// მრავალენოვანი ველი ({ ka: "...", en: "..." }) → ტექსტი საჭირო ენაზე.
// თუ ამ ენაზე არ არის, ვაბრუნებთ სხვა ენას და ვუთითებთ რომელს (UI-ში "მხოლოდ ქართულად").
export function localized(field, lang) {
  if (!field) return { text: "", lang: null };
  if (field[lang]) return { text: field[lang], lang };
  const other = Object.keys(field).find((key) => field[key]);
  return { text: other ? field[other] : "", lang: other ?? null };
}