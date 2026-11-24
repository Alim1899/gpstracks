import { useState } from "react";

/**
 * AI თარგმანის მდგომარეობა: რომელი თარგმანი მიმდინარეობს და რომელი ჩავარდა
 * key: რისი თარგმანია (მაგ. "en" ან "waypoints") — ღილაკი თავის key-ს ამოწმებს
 */
export function useAiTranslate() {
  const [pending, setPending] = useState(null);
  const [failed, setFailed] = useState(null);

  async function run(key, task) {
    setPending(key);
    setFailed(null);
    try {
      return await task();
    } catch (err) {
      console.error("AI translation failed:", err);
      setFailed(key);
      return null;
    } finally {
      setPending(null);
    }
  }

  return { pending, failed, run };
}