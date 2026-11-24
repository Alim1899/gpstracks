import {
  createElement,
  Binoculars,
  Camera,
  Droplet,
  Droplets,
  Flag,
  House,
  MapPin,
  Mountain,
  Signpost,
  SquareParking,
  Tent,
  TriangleAlert,
  Waves,
} from "lucide";
import { localized } from "./localized";
export const MAX_WAYPOINTS = 200;
export const WAYPOINT_NAME_MAX = 100;
export const WAYPOINT_DESC_MAX = 500;

// წერტილების ტიპები: ბაზაში ინახება id, ეკრანზე ჩანს t(`waypoints.types.${id}`)
export const WAYPOINT_TYPES = [
  { id: "spring", icon: Droplet, color: "#1c7ed6" },
  { id: "camp", icon: Tent, color: "#2f9e44" },
  { id: "shelter", icon: House, color: "#a0522d" },
  { id: "peak", icon: Mountain, color: "#495057" },
  { id: "pass", icon: Flag, color: "#7048e8" },
  { id: "viewpoint", icon: Binoculars, color: "#f08c00" },
  { id: "lake", icon: Waves, color: "#1098ad" },
  { id: "waterfall", icon: Droplets, color: "#4dabf7" },
  { id: "parking", icon: SquareParking, color: "#364fc7" },
  { id: "junction", icon: Signpost, color: "#5c940d" },
  { id: "danger", icon: TriangleAlert, color: "#e03131" },
  { id: "photo", icon: Camera, color: "#c2255c" },
  { id: "other", icon: MapPin, color: "#868e96" },
];

const BY_ID = Object.fromEntries(WAYPOINT_TYPES.map((type) => [type.id, type]));
export const getWaypointType = (id) => BY_ID[id] ?? BY_ID.other;

// ფაილებში შემხვედრი სიმბოლოები (Garmin, OsmAnd, Wikiloc...) → ჩვენი ტიპები
const SYMBOLS = {
  "drinking water": "spring",
  "water source": "spring",
  water: "spring",
  fountain: "spring",
  campground: "camp",
  campsite: "camp",
  tent: "camp",
  lodge: "shelter",
  lodging: "shelter",
  hut: "shelter",
  building: "shelter",
  summit: "peak",
  mountain: "peak",
  "mountain pass": "pass",
  saddle: "pass",
  "scenic area": "viewpoint",
  "scenic view": "viewpoint",
  waterfall: "waterfall",
  "parking area": "parking",
  "trail head": "parking",
  trailhead: "parking",
  intersection: "junction",
  "danger area": "danger",
  "photo spot": "photo",
};

// სახელიდან ტიპის გამოცნობა, როცა ფაილში ტიპი არ წერია (მაგ. Wikiloc: "წყალი | Water")
// თანმიმდევრობა მნიშვნელოვანია: ჯერ ჩანჩქერი, მერე წყარო
const NAME_HINTS = [
  ["waterfall", /waterfall|ჩანჩქერ/],
  ["spring", /spring|water|fountain|წყარო|წყალ/],
  ["camp", /camp|tent|ბანაკ|კარავ/],
  ["shelter", /hut|shelter|cottage|lodge|refuge|ქოხ|კოტეჯ|თავშესაფ/],
  ["pass", /\bpass\b|saddle|უღელტეხ/],
  ["peak", /summit|peak|\bmount\b|\bmt\b|მწვერვალ/],
  ["viewpoint", /viewpoint|view point|ხედ/],
  ["lake", /lake|ტბა|ტბის/],
  ["parking", /parking|პარკინგ|ავტოსადგომ/],
  ["junction", /junction|fork|გასაყარ/],
  ["danger", /danger|საშიშ/],
];

function guessFromName(name) {
  const text = (
    typeof name === "string" ? name : Object.values(name ?? {}).join(" ")
  ).toLowerCase();
  return NAME_HINTS.find(([, pattern]) => pattern.test(text))?.[0] ?? "other";
}

// ჩვენი id → უცვლელი; ცნობილი სიმბოლო → შესაბამისი ტიპი; სხვა შემთხვევაში სახელით
export function normalizeWaypointType(raw, name) {
  const key = typeof raw === "string" ? raw.toLowerCase().trim() : "";
  if (BY_ID[key]) return key;
  return SYMBOLS[key] ?? guessFromName(name);
}

const ID_ONLY = /^[\s\-–—|:#]*[0-9a-f]{6,}\s*$/i;
const cleanDesc = (desc) =>
  typeof desc === "string" && !ID_ONLY.test(desc) ? desc.trim() : "";

const GEORGIAN_CHARS = /[\u10A0-\u10FF\u1C90-\u1CBF]/g;
const LATIN_CHARS = /[A-Za-z]/g;
const countChars = (text, pattern) => (text.match(pattern) ?? []).length;
// ქართულად ითვლება 2+ ქართული ასოთი; ორენოვანია, თუ ამასთან 3+ ლათინური ასოც აქვს
const MIN_GEORGIAN = 2;
const MIN_LATIN = 3;
// გაყოფის შემდეგ ბოლოებზე დარჩენილი გამყოფები ("-", "|", "/", ":", ფრჩხილები) და ცარიელი "()"
function tidy(text) {
  return text
    .replace(/\(\s*\)/g, "")
    .replace(/^[\s\-–—|/:,;(]+|[\s\-–—|/:,;)]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitMixed(text) {
  const parts = { ka: [], en: [] };
  let current = null;
  let pending = []; // ენამდე შემხვედრი ციფრები/ნიშნები — პირველ სიტყვას მიჰყვება

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const georgian = countChars(word, GEORGIAN_CHARS);
    const latin = countChars(word, LATIN_CHARS);
    const lang = georgian > latin ? "ka" : latin > georgian ? "en" : current;

    if (!lang) {
      pending.push(word);
      continue;
    }
    if (pending.length) {
      parts[lang].push(...pending);
      pending = [];
    }
    parts[lang].push(word);
    current = lang;
  }

  return { ka: tidy(parts.ka.join(" ")), en: tidy(parts.en.join(" ")) };
}

// სახელის ობიექტი ცარიელი ენების გარეშე, ტექსტი ბოლოებში გასუფთავებული
export function cleanName(name) {
  return Object.fromEntries(
    Object.entries(name ?? {})
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([lang, value]) => [lang, value.trim()]),
  );
}

// ტექსტი → { ka } ან { en }, ორენოვანი კი იყოფა ორად
function splitText(raw) {
  const text = raw.trim();
  if (!text) return {};
  const georgian = countChars(text, GEORGIAN_CHARS);
  const latin = countChars(text, LATIN_CHARS);

  if (georgian >= MIN_GEORGIAN && latin >= MIN_LATIN) {
    return cleanName(splitMixed(text));
  }
  return georgian >= MIN_GEORGIAN ? { ka: text } : { en: text };
}

/**
 * ფაილიდან ან ბაზიდან მოსული სახელი → { ka, en }
 * - ტექსტი ("ბეთლების ეკლესია - Betlemi Church") ანბანით ნაწილდება
 * - ძველი ჩანაწერი ({ ka: "საწყისი - Start" }) იყოფა მხოლოდ მაშინ, როცა სხვა ენა საერთოდ აკლია:
 *   ავტორის მიერ ორივე ენაზე შევსებულ სახელს არ ვეხებით
 */
export function splitName(raw) {
  if (typeof raw === "string") return splitText(raw);

  const name = cleanName(raw);
  const langs = Object.keys(name);
  if (langs.length !== 1) return name;

  const [lang] = langs;
  const parts = splitText(name[lang]);
  return parts[lang] && Object.keys(parts).length > 1 ? parts : name;
}

// ფაილიდან ან ბაზიდან მოსული წერტილი → ერთიანი, სუფთა ფორმატი
export function normalizeWaypoint(w) {
  return {
    lat: w.lat,
    lng: w.lng,
    ele: w.ele ?? null,
    name: splitName(w.name),
    desc: cleanDesc(w.desc),
    type: normalizeWaypointType(w.type, w.name),
  };
}

// სახელი საჭირო ენაზე; თუ ამ ენაზე არ არის, სხვა ენაზე ({ text, lang })
export const waypointName = (w, lang) => localized(w.name, lang);

const hasName = (w) =>
  Object.values(w.name ?? {}).some((value) => value?.trim());

// რომელ ენებზე აკლია სახელი: უსახელო წერტილი სრულია, სახელიანს ბილიკის ყველა ენაზე სჭირდება
export function missingNameLangs(w, langs) {
  if (!hasName(w)) return [];
  return langs.filter((lang) => !w.name?.[lang]?.trim());
}

// პირველი წერტილი, რომელსაც სახელი რომელიმე ენაზე აკლია (-1, თუ ყველა სრულია)
export const firstIncompleteWaypoint = (waypoints, langs) =>
  waypoints.findIndex((w) => missingNameLangs(w, langs).length > 0);

// ფერადი წრე თეთრი იკონით (HTML): რუკის მარკერიც და სიაც ერთნაირად გამოიყურება
export function waypointPinHtml(typeId, size = 28) {
  const { icon, color } = getWaypointType(typeId);
  const iconSize = Math.round(size * 0.55);
  const svg = createElement(icon, {
    width: iconSize,
    height: iconSize,
    stroke: "#fff",
    "stroke-width": 2.25,
  }).outerHTML;

  return `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;box-sizing:border-box;border:2px solid #fff;border-radius:50%;background:${color};box-shadow:0 1px 4px rgb(0 0 0 / 0.35)">${svg}</span>`;
}
