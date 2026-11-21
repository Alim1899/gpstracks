// სიმაღლის პროფილი: კუმულატიური მანძილი, დახრილობის მონაკვეთები.
// coords: [lng, lat, ele?][]

const toRad = (deg) => (deg * Math.PI) / 180;

export function distanceMeters([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

// დახრილობის კლასები: ფერი + თარგმანის გასაღები (trailPage.slope.*)
export const SLOPE_CLASSES = [
  { key: "gentle", max: 10, color: "#2f9e44" },
  { key: "moderate", max: 20, color: "#f08c00" },
  { key: "steep", max: 30, color: "#e03131" },
  { key: "verySteep", max: Infinity, color: "#862e9c" },
];

export const slopeColor = (slope) => SLOPE_CLASSES.find((c) => Math.abs(slope) < c.max).color;

/** { dist: კმ[], ele: მ[], totalKm, hasEle, peakIndex } */
export function buildProfile(coords) {
  const dist = [0];
  for (let i = 1; i < coords.length; i++) {
    dist.push(dist[i - 1] + distanceMeters(coords[i - 1], coords[i]) / 1000);
  }
  const ele = coords.map((c) => c[2] ?? null);
  const hasEle = ele.every((e) => e != null);

  let peakIndex = 0;
  if (hasEle) ele.forEach((e, i) => e > ele[peakIndex] && (peakIndex = i));

  return { dist, ele, totalKm: dist.at(-1), hasEle, peakIndex };
}

/**
 * ტრეკი ~segmentKm სიგრძის მონაკვეთებად, თითოეულს თავისი დახრილობით და ფერით.
 * მოკლე მონაკვეთებზე GPS-ის სიმაღლის ხმაური ფერებს "დააჭრელებდა", ამიტომ ~300 მ.
 * შედეგი: [{ from, to, slope, color }] (from/to — coords-ის ინდექსები)
 */
export function slopeSegments(profile, segmentKm = 0.3) {
  const { dist, ele, hasEle } = profile;
  if (!hasEle || dist.length < 2) return [];

  const segments = [];
  let start = 0;
  for (let i = 1; i < dist.length; i++) {
    const lengthKm = dist[i] - dist[start];
    if (lengthKm >= segmentKm || i === dist.length - 1) {
      const slope = lengthKm > 0 ? ((ele[i] - ele[start]) / (lengthKm * 1000)) * 100 : 0;
      segments.push({ from: start, to: i, slope, color: slopeColor(slope) });
      start = i;
    }
  }
  return segments;
}

// დახრილობა კონკრეტულ წერტილში (±windowKm-ის საშუალო) — tooltip-ისთვის
export function slopeAt(profile, index, windowKm = 0.15) {
  const { dist, ele } = profile;
  let a = index;
  let b = index;
  while (a > 0 && dist[index] - dist[a] < windowKm) a--;
  while (b < dist.length - 1 && dist[b] - dist[index] < windowKm) b++;
  const lengthM = (dist[b] - dist[a]) * 1000;
  return lengthM > 0 ? ((ele[b] - ele[a]) / lengthM) * 100 : 0;
}

// უახლოესი წერტილი მოცემულ მანძილზე (ბინარული ძებნა)
export function indexAtDistance(profile, km) {
  const { dist } = profile;
  let lo = 0;
  let hi = dist.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (dist[mid] < km) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && km - dist[lo - 1] < dist[lo] - km) lo--;
  return lo;
}