import { app } from "@/firebaseConfig";

// უფასო ტარიფზე (Spark) ხელმისაწვდომი სტაბილური მოდელი; ვადის გასვლისას მხოლოდ აქ იცვლება
const MODEL = "gemini-3.5-flash";
const TIMEOUT_MS = 30_000;
const LANG_NAMES = { ka: "Georgian", en: "English" };

// firebase/ai მხოლოდ პირველ თარგმანზე იტვირთება: სხვა გვერდებს ზედმეტი ~40 KB არ ემატება
let model = null;
async function getModel() {
  if (model) return model;
  const { getAI, getGenerativeModel, GoogleAIBackend, Schema } = await import("firebase/ai");
  model = getGenerativeModel(getAI(app, { backend: new GoogleAIBackend() }), {
    model: MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: Schema.object({
        properties: { translations: Schema.array({ items: Schema.string() }) },
      }),
    },
  });
  return model;
}

function withTimeout(promise) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("translate.timeout")), TIMEOUT_MS),
  );
  return Promise.race([promise, timeout]);
}

/**
 * ტექსტების თარგმნა ერთი მოთხოვნით: იმავე რაოდენობით და თანმიმდევრობით
 * ცარიელი ტექსტი ცარიელი რჩება (მოდელს არ ეგზავნება)
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

  const result = await withTimeout((await getModel()).generateContent(prompt));
  const { translations } = JSON.parse(result.response.text());
  if (!Array.isArray(translations) || translations.length !== toSend.length) {
    throw new Error("translate.badResponse");
  }

  // თარგმანები ცარიელი ტექსტების ადგილების გამოტოვებით ბრუნდება
  let next = 0;
  return items.map((text) => (text ? String(translations[next++]).trim() : ""));
}