// ტრეკიდან მუნიციპალიტეტების ავტომატური განსაზღვრა (point-in-polygon).
// საზღვრები: public/data/municipalities.geojson, properties.id = regions.js-ის id
import { fetchJson, MUNICIPALITIES_URL } from "./mapData";

const SAMPLE_STEP_M = 150; // ტრეკზე ყოველ ~150 მ-ში ერთი შესამოწმებელი წერტილი
const MIN_SHARE = 0.03;    // მუნიციპალიტეტი ითვლება, თუ ტრეკის ≥3% მასშია (საზღვრის "ცახცახის" გამოსარიცხად)

let cache = null; // მომზადებული პოლიგონები ერთხელ

// ფაილის ჩატვირთვა (იგივე ფაილს მთავარი გვერდის რუკაც იყენებს) + თითო პოლიგონისთვის bbox
export function loadMunicipalities() {
  cache ??= fetchJson(MUNICIPALITIES_URL)
    .then(prepareMunicipalities)
    .catch((err) => {
      cache = null; // შემდეგ ჯერზე თავიდან ცდა
      throw err;
    });
  return cache;
}

// GeoJSON → [{ id, polygons, bbox }] (Polygon და MultiPolygon ერთნაირ ფორმატში)
export function prepareMunicipalities(geojson) {
  return geojson.features.map((f) => {
    const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    return { id: f.properties.id, polygons, bbox: getBbox(polygons) };
  });
}

function getBbox(polygons) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0]) {
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    }
  }
  return [w, s, e, n];
}

// ray casting: წერტილიდან სხივი და გადაკვეთების რაოდენობა (კენტი = შიგნითაა)
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// პოლიგონი = გარე რგოლი + ხვრელები
const inPolygon = (point, [outer, ...holes]) => inRing(point, outer) && !holes.some((h) => inRing(point, h));

function findMunicipality(point, municipalities) {
  const [x, y] = point;
  for (const m of municipalities) {
    const [w, s, e, n] = m.bbox;
    if (x < w || x > e || y < s || y > n) continue;
    if (m.polygons.some((p) => inPolygon(point, p))) return m.id;
  }
  return null;
}

const toRad = (deg) => (deg * Math.PI) / 180;
function distanceM([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

// ტრეკიდან წერტილები დაახლოებით თანაბარი მანძილით (ჩაწერის სიხშირე რომ შედეგზე არ მოქმედებდეს)
function sampleTrack(coords) {
  const samples = [coords[0]];
  let sinceLast = 0;
  for (let i = 1; i < coords.length; i++) {
    sinceLast += distanceM(coords[i - 1], coords[i]);
    if (sinceLast >= SAMPLE_STEP_M) {
      samples.push(coords[i]);
      sinceLast = 0;
    }
  }
  samples.push(coords.at(-1));
  return samples;
}

/**
 * coords: [lng, lat, ele?][] → ["dusheti", "akhmeta"] (ტრეკის უდიდესი ნაწილიდან უმცირესისკენ)
 * საქართველოს გარეთ მყოფი ტრეკისთვის: []
 */
export function detectMunicipalities(coords, municipalities) {
  const counts = new Map();
  const samples = sampleTrack(coords);

  for (const point of samples) {
    const id = findMunicipality(point, municipalities);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const detected = sorted.filter(([, count]) => count / samples.length >= MIN_SHARE).map(([id]) => id);

  // მოკლე ტრეკი, რომელიც ყველგან ზღვარს ქვემოთაა: მაინც ვაბრუნებთ ყველაზე ხშირს
  return detected.length ? detected : sorted.slice(0, 1).map(([id]) => id);
}