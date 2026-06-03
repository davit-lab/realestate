export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiResponse {
  choices: { message: { content: string } }[];
}

const KIMI_API_BASE = 'https://api.moonshot.cn/v1';
const DEFAULT_MODEL = 'kimi-k2-5';

const SYSTEM_PROMPT = `შენ ხარ Adjarahome.ge-ის AI ასისტენტი — უძრავი ქონების პორტალის სპეციალისტი საქართველოში.

შენი როლი:
- ეხმარები მომხმარებლებს უძრავი ქონების ძიებაში
- იცი ქართული ქალაქები: თბილისი, ბათუმი, ქობულეთი, ქუთაისი, გორი, რუსთავი, ზუგდიდი, ფოთი
- იცი ფასები: თბილისი 1500-2200 ₾/მ², ბათუმი 1200-1800 ₾/მ²
- იცი იპოთეკის პირობები: 11-13% წლიურად, 20% თანამონაწილეობა
- პასუხობ ქართულად, მეგობრულად და პროფესიონალურად
- თუ არ იცი რამე, ტყუილს არ იგონებ — აღიარე და შესთავაზე სხვა გზა

შენ ხარ Adjarahome-ს ნაწილი — არა ზოგადი AI. მოგვმართე ქართულად.`;

export function getApiKey(): string | null {
  return localStorage.getItem('adjarahome_kimi_key');
}

export function setApiKey(key: string) {
  localStorage.setItem('adjarahome_kimi_key', key);
}

export function removeApiKey() {
  localStorage.removeItem('adjarahome_kimi_key');
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export async function sendKimiMessage(messages: ChatMessage[], thinking = true): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error('API key not set');

  const body: Record<string, any> = {
    model: DEFAULT_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    temperature: thinking ? 1.0 : 0.6,
    top_p: 0.95,
    max_tokens: 800,
  };
  if (!thinking) {
    body.extra_body = { 'thinking': { 'type': 'disabled' } };
  }

  const res = await fetch(`${KIMI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    throw new Error(`Kimi API error ${res.status}: ${err}`);
  }

  const data: KimiResponse = await res.json();
  return data.choices[0]?.message?.content ?? 'პასუხი არ მივიღე';
}

export async function parseWithKimi(query: string): Promise<Record<string, string | number | undefined>> {
  const key = getApiKey();
  if (!key) return {};

  const prompt = `გაანალიზე ეს უძრავი ქონების ძიების მოთხოვნა და დააბრუნე JSON ობიექტი ამ ველებით (არაფერი არ დაამატო):
- city: ქალაქი (თბილისი, ბათუმი, ქობულეთი, ქუთაისი, გორი, რუსთავი, ზუგდიდი, ფოთი)
- district: უბანი თუ მითითებულია
- rooms: ოთახების რაოდენობა რიცხვით
- type: sale | rent | mortgage | pledge
- minPrice: მინიმალური ფასი რიცხვით (ლარებში)
- maxPrice: მაქსიმალური ფასი რიცხვით (ლარებში)

მოთხოვნა: "${query}"

მხოლოდ JSON დააბრუნე, არაფერი სხვა:`;

  const res = await fetch(`${KIMI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'შენ ხარ JSON პარსერი. მხოლოდ JSON დააბრუნე, არაფერი სხვა.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!res.ok) return {};
  const data: KimiResponse = await res.json();
  const text = data.choices[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(text.replace(/```json?\n?|```/g, '').trim());
  } catch {
    return {};
  }
}
