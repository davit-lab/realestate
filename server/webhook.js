/**
 * Step 2: Express Webhook Server
 * Receives Telegram/WhatsApp unstructured messages,
 * parses them via OpenAI LLM, inserts into Supabase.
 *
 * Run: node server/webhook.js
 */

import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Secret token middleware — reject unauthenticated webhook calls
function requireSecret(req, res, next) {
  if (!WEBHOOK_SECRET) {
    console.warn('[webhook] WEBHOOK_SECRET not set — running insecure');
    return next();
  }
  const token = req.headers['x-webhook-secret'] || req.query.secret;
  if (token !== WEBHOOK_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a strict real-estate data extraction engine.
Parse the user's unstructured Georgian (or mixed) message into a valid JSON object.
Output ONLY the JSON object — no markdown, no explanations, no code fences.

Required fields (use null if missing):
- property_type: one of ["apartment", "house", "commercial", "land", "hotel", "villa"]
- location: string (city, district, street if available)
- rooms: integer or null
- area_sqm: number or null
- price: number or null (extract numeric value only)
- currency: one of ["GEL", "USD", "EUR"] — default "GEL" if not specified
- title: string — generate a concise listing title in Georgian
- description: string — clean, formatted description
- phone: string or null — extract phone number
- floor: integer or null
- total_floors: integer or null

Rules:
1. If price contains "$" or "usd", currency = "USD".
2. If price contains "€" or "eur", currency = "EUR".
3. Remove currency symbols from price field — store pure number.
4. Location should include city name (e.g., "თბილისი, საბურთალო").
5. Respond with a single minified JSON object.`;

async function parseWithLLM(rawText) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: rawText }
    ],
    temperature: 0.1,
    max_tokens: 512,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty LLM response');

  return JSON.parse(content);
}

/**
 * POST /webhook/telegram
 * Expected Telegram Bot Webhook payload shape:
 * { message: { text: "...", chat: { id: 123 }, from: { id: 456 } } }
 */
app.post('/webhook/telegram', requireSecret, async (req, res) => {
  const startTime = Date.now();

  try {
    const messageText = req.body?.message?.text ?? req.body?.text ?? '';
    const agentTelegramId = req.body?.message?.from?.id?.toString() ?? null;

    if (!messageText) {
      return res.status(400).json({ ok: false, error: 'No message text provided' });
    }

    const parsed = await parseWithLLM(messageText);

    const insertPayload = {
      user_id: null,
      property_type: parsed.property_type || 'apartment',
      location: parsed.location || '',
      rooms: parsed.rooms ?? null,
      area_sqm: parsed.area_sqm ?? null,
      price: parsed.price ?? null,
      currency: parsed.currency || 'GEL',
      images: [],
      status: 'draft',
      raw_message: messageText,
      title: parsed.title || '',
      description: parsed.description || '',
      phone: parsed.phone || null,
      floor: parsed.floor ?? null,
      total_floors: parsed.total_floors ?? null
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    console.log(`[webhook] Inserted property ${data.id} in ${Date.now() - startTime}ms`);

    return res.status(200).json({ ok: true, id: data.id, parsed });
  } catch (err) {
    console.error('[webhook] Error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /webhook/whatsapp
 * Generic webhook for WhatsApp Business API or similar
 */
app.post('/webhook/whatsapp', requireSecret, async (req, res) => {
  const startTime = Date.now();

  try {
    const messageText = req.body?.Body ?? req.body?.text ?? req.body?.message ?? '';

    if (!messageText) {
      return res.status(400).json({ ok: false, error: 'No message text provided' });
    }

    const parsed = await parseWithLLM(messageText);

    const insertPayload = {
      user_id: null,
      property_type: parsed.property_type || 'apartment',
      location: parsed.location || '',
      rooms: parsed.rooms ?? null,
      area_sqm: parsed.area_sqm ?? null,
      price: parsed.price ?? null,
      currency: parsed.currency || 'GEL',
      images: [],
      status: 'draft',
      raw_message: messageText,
      title: parsed.title || '',
      description: parsed.description || '',
      phone: parsed.phone || null,
      floor: parsed.floor ?? null,
      total_floors: parsed.total_floors ?? null
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    console.log(`[whatsapp] Inserted property ${data.id} in ${Date.now() - startTime}ms`);

    return res.status(200).json({ ok: true, id: data.id, parsed });
  } catch (err) {
    console.error('[whatsapp] Error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Webhook server listening on http://localhost:${PORT}`);
  console.log(`Endpoints: POST /webhook/telegram | POST /webhook/whatsapp | GET /health`);
});
