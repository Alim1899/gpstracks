// ტრეკის გეომეტრია: გამარტივება, კოდირება, მარშრუტის ტიპი.
// coords ყველგან GeoJSON-ის ფორმატშია: [lng, lat, ele?]

const EARTH_RADIUS = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

// კოორდინატები → მეტრები ადგილობრივ სიბრტყეზე (მცირე ტერიტორიისთვის საკმარისად ზუსტია)
function toMeters(coords) {
  const lat0 = toRad(coords.reduce((sum, c) => sum + c[1], 0) / coords.length);
  return coords.map(([lng, lat, ele]) => [
    toRad(lng) * Math.cos(lat0) * EARTH_RADIUS,
    toRad(lat) * EARTH_RADIUS,
    ele ?? 0,
  ]);
}

// წერტილის მანძილი a→b მონაკვეთამდე (3D, მეტრებში)
function segmentDistance(p, a, b) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const lenSq = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
  let t = lenSq ? ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1] + (p[2] - a[2]) * d[2]) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * d[0], p[1] - a[1] - t * d[1], p[2] - a[2] - t * d[2]);
}

/**
 * Douglas-Peucker: აგდებს წერტილებს, რომლებიც ხაზის ფორმას tolerance მეტრზე მეტად არ ცვლის.
 * სიმაღლეც ითვლება (3D), რომ მწვერვალები და უღელტეხილები არ "მოიჭრას".
 * რეკურსიის ნაცვლად stack-ით: დიდ ტრეკებზე stack overflow არ მოხდება.
 */
export function simplify(coords, tolerance = 5) {
  if (coords.length <= 2) return coords;
  const pts = toMeters(coords);
  const keep = new Uint8Array(coords.length);
  keep[0] = keep[coords.length - 1] = 1;

  const stack = [[0, coords.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const dist = segmentDistance(pts[i], pts[first], pts[last]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return coords.filter((_, i) => keep[i]);
}

// Google-ის polyline ალგორითმი: რიცხვების სხვაობები → მოკლე ტექსტი
function encodeValue(value) {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let out = "";
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  return out + String.fromCharCode(v + 63);
}

function encodeSeries(rows, factors) {
  const prev = factors.map(() => 0);
  let out = "";
  for (const row of rows) {
    factors.forEach((factor, i) => {
      const value = Math.round(row[i] * factor);
      out += encodeValue(value - prev[i]);
      prev[i] = value;
    });
  }
  return out;
}

function decodeSeries(str, factors) {
  const rows = [];
  const prev = factors.map(() => 0);
  let index = 0;
  while (index < str.length) {
    const row = factors.map((factor, i) => {
      let result = 0;
      let shift = 0;
      let byte;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      prev[i] += result & 1 ? ~(result >> 1) : result >> 1;
      return prev[i] / factor;
    });
    rows.push(row);
  }
  return rows;
}

/**
 * ტრეკი → { path, elevations }
 * path: სტანდარტული Google polyline (lat,lng; 5 ციფრი ≈ 1 მ სიზუსტე)
 * elevations: სიმაღლეები მეტრებში, იგივე ალგორითმით (null, თუ ტრეკს სიმაღლე არ აქვს)
 */
export function encodeTrack(coords) {
  const hasEle = coords.every((c) => c[2] != null);
  return {
    path: encodeSeries(coords.map(([lng, lat]) => [lat, lng]), [1e5, 1e5]),
    elevations: hasEle ? encodeSeries(coords.map((c) => [c[2]]), [1]) : null,
  };
}

// { path, elevations } → [lng, lat, ele?]
export function decodeTrack({ path, elevations }) {
  const points = decodeSeries(path, [1e5, 1e5]);
  const eles = elevations ? decodeSeries(elevations, [1]) : null;
  return points.map(([lat, lng], i) => (eles ? [lng, lat, eles[i][0]] : [lng, lat]));
}

export function getBounds(coords) {
  let n = -90, s = 90, e = -180, w = 180;
  for (const [lng, lat] of coords) {
    if (lat > n) n = lat;
    if (lat < s) s = lat;
    if (lng > e) e = lng;
    if (lng < w) w = lng;
  }
  return { n, s, e, w };
}

/**
 * მარშრუტის ტიპი:
 * - oneWay: დასაწყისი და დასასრული ერთმანეთისგან შორსაა
 * - outAndBack: ბრუნდება იმავე გზით (უკანა ნახევრის უმეტესი ნაწილი პირველთან ახლოსაა)
 * - loop: ბრუნდება სხვა გზით
 */
export function detectRouteType(coords, distanceKm) {
  const pts = toMeters(coords);
  const [sx, sy] = pts[0];
  const [ex, ey] = pts.at(-1);
  const closeEnough = Math.max(200, distanceKm * 1000 * 0.03); // 200 მ ან სიგრძის 3%
  if (Math.hypot(ex - sx, ey - sy) > closeEnough) return "oneWay";

  const mid = Math.floor(pts.length / 2);
  const sample = (arr, n) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0);
  const firstHalf = sample(pts.slice(0, mid), 600);
  const secondHalf = sample(pts.slice(mid), 80);

  const near = secondHalf.filter(([x, y]) =>
    firstHalf.some(([fx, fy]) => Math.hypot(x - fx, y - fy) < 60)
  ).length;

  return near / secondHalf.length > 0.7 ? "outAndBack" : "loop";
}