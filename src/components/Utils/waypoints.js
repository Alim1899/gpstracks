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

export function normalizeWaypointType(raw) {
  const key = typeof raw === "string" ? raw.toLowerCase().trim() : "";
  if (BY_ID[key]) return key;
  return SYMBOLS[key] ?? "other";
}

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