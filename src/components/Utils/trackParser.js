import { gpx, kml } from "@tmcw/togeojson";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ELEVATION_THRESHOLD = 3; // მ, GPS-ის ხმაურის გასაფილტრად

export async function parseTrackFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["gpx", "kml"].includes(ext)) {
    throw new Error("მხარდაჭერილია მხოლოდ GPX და KML ფაილები");
  }
  if (file.size > MAX_SIZE) throw new Error("ფაილი 10 MB-ზე დიდია");

  const xml = new DOMParser().parseFromString(await file.text(), "application/xml");
  if (xml.querySelector("parsererror")) {
    throw new Error("ფაილი დაზიანებულია ან არასწორი ფორმატისაა");
  }

  const geojson = ext === "gpx" ? gpx(xml) : kml(xml);
  const coords = extractLineCoords(geojson);
  if (coords.length < 2) throw new Error("ფაილში ტრეკი ვერ მოიძებნა");

  return { coords, stats: computeStats(coords) };
}

// ყველა ხაზს ერთ მასივად აერთიანებს: [lng, lat, ele?]
function extractLineCoords(geojson) {
  const coords = [];
  const add = (line) => {
    for (const point of line) coords.push(point); // დიდ მასივებზე push(...) stack-ს ავსებს
  };

  for (const { geometry } of geojson.features) {
    if (!geometry) continue;
    if (geometry.type === "LineString") add(geometry.coordinates);
    if (geometry.type === "MultiLineString") geometry.coordinates.forEach(add);
  }
  return coords;
}

const EARTH_RADIUS = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

function haversine([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a));
}

export function computeStats(coords) {
  let distance = 0;
  let gain = 0;
  let loss = 0;
  let minEle = Infinity;
  let maxEle = -Infinity;
  let lastEle = null;

  for (let i = 0; i < coords.length; i++) {
    if (i > 0) distance += haversine(coords[i - 1], coords[i]);

    const ele = coords[i][2];
    if (ele == null) continue;

    minEle = Math.min(minEle, ele);
    maxEle = Math.max(maxEle, ele);

    if (lastEle === null) {
      lastEle = ele;
      continue;
    }
    const diff = ele - lastEle;
    if (Math.abs(diff) >= ELEVATION_THRESHOLD) {
      if (diff > 0) gain += diff;
      else loss -= diff;
      lastEle = ele;
    }
  }

  const distanceKm = distance / 1000;
  const hasEle = minEle !== Infinity;

  return {
    distanceKm,
    gain: Math.round(gain),
    loss: Math.round(loss),
    minEle: hasEle ? Math.round(minEle) : null,
    maxEle: hasEle ? Math.round(maxEle) : null,
    // ნეისმიტის წესი: 5 კმ/სთ + 1 სთ ყოველ 600 მ აღმართზე
    durationHours: distanceKm / 5 + gain / 600,
  };
}

export function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h} სთ ${m} წთ` : `${m} წთ`;
}