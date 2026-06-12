-- Step 1: Supabase Chat Schema — Optimistic UI + Realtime
-- Run this in the Supabase SQL Editor

-- 1. Conversations table (meta for each buyer/agent thread)
CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id    UUID,
  title         TEXT NOT NULL DEFAULT '',
  last_message  TEXT,
  last_sent_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages table (core chat data)
CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id       UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content       TEXT NOT NULL DEFAULT '',
  image_url     TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  status        TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — participants can read/write their own threads
DROP POLICY IF EXISTS "Allow participants to read conversations" ON conversations;
CREATE POLICY "Allow participants to read conversations" ON conversations FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = agent_id
  );

DROP POLICY IF EXISTS "Allow participants to insert conversations" ON conversations;
CREATE POLICY "Allow participants to insert conversations" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow participants to update conversations" ON conversations;
CREATE POLICY "Allow participants to update conversations" ON conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

DROP POLICY IF EXISTS "Allow participants to read messages" ON messages;
CREATE POLICY "Allow participants to read messages" ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow participants to insert messages" ON messages;
CREATE POLICY "Allow participants to insert messages" ON messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow sender to update own message status" ON messages;
CREATE POLICY "Allow sender to update own message status" ON messages FOR UPDATE USING (sender_id = auth.uid());

-- 4b. Admin policies — full read + message delete for moderation
DROP POLICY IF EXISTS "Allow admin to read all conversations" ON conversations;
CREATE POLICY "Allow admin to read all conversations" ON conversations FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin to read all messages" ON messages;
CREATE POLICY "Allow admin to read all messages" ON messages FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin to delete messages" ON messages;
CREATE POLICY "Allow admin to delete messages" ON messages FOR DELETE USING (public.is_admin());

-- 5. B-Tree indexes for ultra-fast querying at scale
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages USING btree (chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages USING btree (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations USING btree (buyer_id, last_sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations USING btree (agent_id, last_sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_sent ON conversations USING btree (last_sent_at DESC);

-- 6. Function: auto-update conversation.last_message on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_sent_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_update_conversation_last_message" ON messages;
CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- 7. Enable Realtime
BEGIN;
  -- Ensure publication exists
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;
COMMIT;

-- Add tables to realtime publication (safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations';
  END IF;
END $$;

-- 8. Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images', 'chat-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 9. Storage RLS — allow participants to upload/read their own chat images
DROP POLICY IF EXISTS "Allow participants to upload chat images" ON storage.objects;
CREATE POLICY "Allow participants to upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = (storage.foldername(name))[1]::uuid
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Allow anyone to read chat images" ON storage.objects;
CREATE POLICY "Allow anyone to read chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');
