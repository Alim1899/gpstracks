import { gpx, kml } from "@tmcw/togeojson";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ELEVATION_THRESHOLD = 3; // მ, GPS-ის ხმაურის გასაფილტრად
const MOVING_WINDOW = 30;   // წმ: ამ ფანჯარაში ვამოწმებთ გადაადგილებას
const MIN_SPEED = 0.1;   // მ/წმ ≈ 1.2 კმ/სთ, 3D (სიმაღლის ჩათვლით)
const MAX_GAP = 120;      // წმ_GAP = 120;         // წმ: ამაზე დიდი წყვეტა = ჩაწერა დაპაუზებული იყო


function distance3d(a, b) {
  const dz = a[2] != null && b[2] != null ? b[2] - a[2] : 0;
  return Math.hypot(haversine(a, b), dz);
}


export async function parseTrackFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["gpx", "kml"].includes(ext)) {
   throw new Error("upload.errors.unsupported");
  }
  if (file.size > MAX_SIZE) throw new Error("upload.errors.tooLarge");

  const xml = new DOMParser().parseFromString(await file.text(), "application/xml");
  if (xml.querySelector("parsererror")) {
   throw new Error("upload.errors.corrupted");
  }

  const geojson = ext === "gpx" ? gpx(xml) : kml(xml);

 const { coords, times } = extractLineCoords(geojson);
if (coords.length < 2) throw new Error("upload.errors.noTrack");

return {
  coords,
  stats: { ...computeStats(coords), recorded: computeTimes(coords, times) },
};
}






// ყველა ხაზს ერთ მასივად აერთიანებს: [lng, lat, ele?]
function extractLineCoords(geojson) {
  const coords = [];
  const times = [];

  const add = (line, lineTimes) => {
    for (let i = 0; i < line.length; i++) {
      coords.push(line[i]);
      times.push(lineTimes?.[i] ?? null);
    }
  };

  for (const { geometry, properties } of geojson.features) {
    if (!geometry) continue;
    const t = properties?.coordinateProperties?.times;
    if (geometry.type === "LineString") add(geometry.coordinates, t);
    if (geometry.type === "MultiLineString")
      geometry.coordinates.forEach((line, i) => add(line, t?.[i]));
  }
  return { coords, times };
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

export function formatDuration(hours, t) {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const H = t("units.h");
  const M = t("units.min");
  return h > 0 ? `${h}${H} ${m}${M}` : `${m}${M}`;
}

export function computeTimes(coords, times) {
  const t = times.map((s) => (s ? Date.parse(s) : NaN));
  if (t.length < 2 || t.some(Number.isNaN)) return null;

  let moving = 0;
  // მონაკვეთი from→to ითვლება მოძრაობად, თუ საშუალო სიჩქარე ზღვარზე მეტია
  const addIfMoving = (from, to) => {
    const dt = (t[to] - t[from]) / 1000;
    if (dt > 0 && distance3d(coords[from], coords[to]) / dt >= MIN_SPEED) moving += dt;
  };

  let start = 0;
  for (let i = 1; i < coords.length; i++) {
    if ((t[i] - t[i - 1]) / 1000 > MAX_GAP) {
      addIfMoving(start, i - 1); // მიმდინარე მონაკვეთის დახურვა
      addIfMoving(i - 1, i);     // წყვეტა: იშვიათი ჩაწერა ითვლება, გაჩერება და პაუზა არა
      start = i;
      continue;
    }
    if ((t[i] - t[start]) / 1000 >= MOVING_WINDOW) {
      addIfMoving(start, i);
      start = i;
    }
  }
  addIfMoving(start, coords.length - 1); // ბოლო მონაკვეთი

  return {
    totalHours: (t.at(-1) - t[0]) / 3_600_000,
    movingHours: moving / 3600,
  };
}