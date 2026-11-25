import { app } from "@/firebaseConfig";

// უფასო ტარიფზე (Spark) ხელმისაწვდომი მოდელები, რიგითობით: თუ პირველი გადატვირთულია, შემდეგს ვცდით
const MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
// ერთი მცდელობის დრო ტექსტის სიგრძეზეა დამოკიდებული (ქართული ტექსტი ბევრ ტოკენად იშლება)
const BASE_TIMEOUT_MS = 20_000;
const TIMEOUT_PER_1000_CHARS_MS = 20_000;
const MAX_TIMEOUT_MS = 60_000;
const LANG_NAMES = { ka: "Georgian", en: "English" };

// firebase/ai მხოლოდ პირველ თარგმანზე იტვირთება: სხვა გვერდებს ზედმეტი ~40 KB არ ემატება
const models = new Map();
async function getModel(name) {
  if (models.has(name)) return models.get(name);
  const { getAI, getGenerativeModel, GoogleAIBackend, Schema, ThinkingLevel } = await import("firebase/ai");
  const model = getGenerativeModel(getAI(app, { backend: new GoogleAIBackend() }), {
    model: name,
    generationConfig: {
      temperature: 0.2,
      // თარგმანს „ფიქრი“ არ სჭირდება: ნაგულისხმევ რეჟიმში პასუხი გაცილებით გვიან მოდის
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: Schema.object({
        properties: { translations: Schema.array({ items: Schema.string() }) },
      }),
    },
  });
  models.set(name, model);
  return model;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("translate.timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// 401/403: App Check ან წვდომა — სხვა მოდელიც იგივეს დააბრუნებს, ამიტომ ვჩერდებით
function isAccessError(err) {
  const status = err?.customErrorData?.status ?? Number(/\[(\d{3})/.exec(err?.message ?? "")?.[1]);
  return status === 401 || status === 403;
}

/**
 * ტექსტების თარგმნა ერთი მოთხოვნით: იმავე რაოდენობით და თანმიმდევრობით
 * ცარიელი ტექსტი ცარიელი რჩება (მოდელს არ ეგზავნება)
 * მოდელის გადატვირთვისას (500/503/429) ან დაგვიანებისას შემდეგ მოდელზე გადადის
 */
export async function translateTexts(texts, from, to) {
  const items = texts.map((text) => (text ?? "").trim());
  const toSend = items.filter(Boolean);
  if (!toSend.length) return items;

  const prompt = `Translate each item of the JSON array from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}.
Context: hiking trails in the country of Georgia — trail titles, descriptions and waypoint names.
Rules:
- Proper names (villages, peaks, rivers, lakes, regions) are transliterated into the target language's script, not translated by meaning. For Georgian → English use the official Georgian romanization (e.g. ყაზბეგი → Kazbegi, მესტია → Mestia).
- Keep numbers, units, line breaks and the author's tone. Do not add or omit information.
- Return exactly ${toSend.length} items in the same order, without explanations.
Items: ${JSON.stringify(toSend)}`;

  const chars = toSend.reduce((sum, text) => sum + text.length, 0);
  const timeoutMs = Math.min(MAX_TIMEOUT_MS, BASE_TIMEOUT_MS + (chars / 1000) * TIMEOUT_PER_1000_CHARS_MS);

  let lastError;
  for (const name of MODELS) {
    try {
      const result = await withTimeout((await getModel(name)).generateContent(prompt), timeoutMs);
      const { translations } = JSON.parse(result.response.text());
      if (!Array.isArray(translations) || translations.length !== toSend.length) {
        throw new Error("translate.badResponse");
      }
      // თარგმანები ცარიელი ტექსტების ადგილების გამოტოვებით ბრუნდება
      let next = 0;
      return items.map((text) => (text ? String(translations[next++]).trim() : ""));
    } catch (err) {
      if (isAccessError(err)) throw err;
      console.warn(`AI model ${name} failed, trying next:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
}