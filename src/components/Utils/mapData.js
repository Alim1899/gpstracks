// რუკის სტატიკური მონაცემები public/data-დან: თითო ფაილი ერთხელ იტვირთება და მეხსიერებაში რჩება
export const MUNICIPALITIES_URL = "/data/municipalities.geojson";
export const GEORGIA_MASK_URL = "/data/georgia-mask.geojson"; // მსოფლიო საქართველოს გარეშე (ფონის დასაბნელებლად)

const cache = new Map();

export function fetchJson(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`${url}: ${res.status}`);
          return res.json();
        })
        .catch((err) => {
          cache.delete(url); // შემდეგ ჯერზე თავიდან ცდა
          throw err;
        }),
    );
  }
  return cache.get(url);
}