// მთავარი გვერდის ფილტრები: URL-ში ინახება (?activity=hiking&distance=short...),
// ამიტომ ბმულის გაზიარება და „უკან“ ღილაკი ფილტრებს ინარჩუნებს.
import { getActivity } from "./trailOptions";

// მანძილის დიაპაზონები, კმ (min ჩათვლით, max-ის გარეშე)
export const DISTANCE_RANGES = [
  { id: "short", max: 5 },
  { id: "medium", min: 5, max: 10 },
  { id: "long", min: 10, max: 20 },
  { id: "veryLong", min: 20 },
];

export const SORTS = ["newest", "shortest", "longest", "easiest"];
export const DEFAULT_SORT = "newest";

// URL → ფილტრები (უცნობი მნიშვნელობები იგნორირდება)
export function parseFilters(params) {
  const list = (key) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const activity = getActivity(params.get("activity"))?.id ?? "";
  const distance = DISTANCE_RANGES.some((r) => r.id === params.get("distance")) ? params.get("distance") : "";
  const sort = SORTS.includes(params.get("sort")) ? params.get("sort") : DEFAULT_SORT;

  return {
    activity,
    // სირთულე აქტივობაზეა დამოკიდებული: აქტივობის გარეშე არ გამოიყენება
    difficulty: activity ? list("difficulty").filter((d) => getActivity(activity).difficulties.includes(d)) : [],
    municipalities: list("municipalities"),
    distance,
    routeType: list("routeType"),
    inSeason: params.get("season") === "now",
    sort,
  };
}

// ფილტრები → URL (ცარიელი მნიშვნელობები არ იწერება)
export function filtersToParams(filters) {
  const entries = {
    activity: filters.activity,
    difficulty: filters.difficulty.join(","),
    municipalities: filters.municipalities.join(","),
    distance: filters.distance,
    routeType: filters.routeType.join(","),
    season: filters.inSeason ? "now" : "",
    sort: filters.sort === DEFAULT_SORT ? "" : filters.sort,
  };
  return Object.fromEntries(Object.entries(entries).filter(([, value]) => value));
}

// რამდენი ფილტრია ჩართული („ფილტრები (3)“); აქტივობა და დახარისხება ცალკე ჩანს, ამიტომ არ ითვლება
export function countExtraFilters(filters) {
  return [
    filters.difficulty.length,
    filters.municipalities.length,
    filters.distance,
    filters.routeType.length,
    filters.inSeason,
  ].filter(Boolean).length;
}

const inRange = (km, { min = 0, max = Infinity }) => km >= min && km < max;

const SORTERS = {
  newest: (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
  shortest: (a, b) => a.distanceKm - b.distanceKm,
  longest: (a, b) => b.distanceKm - a.distanceKm,
  easiest: (a, b) => difficultyTone(a) - difficultyTone(b) || a.distanceKm - b.distanceKm,
};

// ფილტრაცია და დახარისხება ბრაუზერში: ყველა გამოქვეყნებული ბილიკი ერთხელ იტვირთება
export function applyFilters(trails, filters, month = new Date().getMonth() + 1) {
  const range = DISTANCE_RANGES.find((r) => r.id === filters.distance);

  return trails
    .filter((trail) => {
      if (filters.activity && trail.activity !== filters.activity) return false;
      if (filters.difficulty.length && !filters.difficulty.includes(trail.difficulty)) return false;
      if (
        filters.municipalities.length &&
        !trail.municipalities?.some((m) => filters.municipalities.includes(m))
      )
        return false;
      if (range && !inRange(trail.distanceKm, range)) return false;
      if (filters.routeType.length && !filters.routeType.includes(trail.routeType)) return false;
      // სეზონი მითითებული არ არის → ბილიკი ყოველთვის შესაფერისად ითვლება
      if (filters.inSeason && trail.seasons?.length && !trail.seasons.includes(month)) return false;
      return true;
    })
    .sort(SORTERS[filters.sort] ?? SORTERS[DEFAULT_SORT]);
}

/**
 * სირთულის ტონი 1–4 (მწვანე, ნარინჯისფერი, წითელი, იისფერი) ყველა აქტივობისთვის ერთნაირად:
 * ლაშქრობას 4 დონე აქვს, ალპინიზმს 12 — ორივე 4 ფერზე ნაწილდება
 */
export function difficultyTone({ activity, difficultyLevel }) {
  const count = getActivity(activity)?.difficulties.length ?? 4;
  if (!difficultyLevel) return 1;
  return Math.min(4, Math.max(1, Math.ceil((difficultyLevel / count) * 4)));
}

// ტონის ფერები: ბარათის სირთულე და რუკის მარკერი
export const TONE_COLORS = { 1: "#2f9e44", 2: "#f08c00", 3: "#e03131", 4: "#862e9c" };