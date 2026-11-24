// ფორმის მონაცემების აღწერა: საწყისი მნიშვნელობები, ვალიდაცია და ბაზისთვის მომზადება.
import { LANGUAGES } from "@/i18n";
import { getHistoricalOptions } from "@/components/Utils/regions";

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 2000;

const LANG_CODES = LANGUAGES.map((l) => l.code);

// სათაური და აღწერა ყველა ენისთვის: title_ka, title_en, description_ka, ...
export function createInitialValues({ lang, routeType, municipalities }) {
  const values = {
    primaryLang: LANG_CODES.includes(lang) ? lang : LANG_CODES[0],
    bothLangs: false,
    activity: "",
    difficulty: "",
    municipalities: municipalities ?? [],
    historicalRegions: [],
    routeType: routeType ?? "",
    seasons: [],
    features: [],
    access: "",
    overnight: [],
    aiLangs: [], // რომელი ენა შეივსო AI თარგმანით (ბილიკის გვერდზე ნიშანი)
  };
  for (const code of LANG_CODES) {
    values[`title_${code}`] = "";
    values[`description_${code}`] = "";
  }
  return values;
}

// რომელ ენებზე ავსებს ავტორი: არჩეული პირველია
export function getActiveLangs(values) {
  if (!values.bothLangs) return [values.primaryLang];
  return [
    values.primaryLang,
    ...LANG_CODES.filter((c) => c !== values.primaryLang),
  ];
}

export function validateTrail(values) {
  const errors = {};

  for (const lang of getActiveLangs(values)) {
    const title = values[`title_${lang}`].trim();
    if (!title) errors[`title_${lang}`] = "trailForm.errors.titleRequired";
    else if (title.length < 3)
      errors[`title_${lang}`] = "trailForm.errors.titleMin";
  }

  if (!values.activity) errors.activity = "trailForm.errors.activityRequired";
  if (!values.difficulty)
    errors.difficulty = "trailForm.errors.difficultyRequired";
  if (!values.municipalities.length)
    errors.municipalities = "trailForm.errors.municipalitiesRequired";
  if (!values.routeType)
    errors.routeType = "trailForm.errors.routeTypeRequired";

  return errors;
}

// ფორმის ბრტყელი მნიშვნელობები → ბილიკის მონაცემები (ენები ობიექტებად)
export function toTrailInput(values) {
  const langs = getActiveLangs(values);
  const byLang = (prefix) =>
    Object.fromEntries(
      langs
        .map((lang) => [lang, values[`${prefix}_${lang}`].trim()])
        .filter(([, text]) => text),
    );

  // თუ მუნიციპალიტეტი წაიშალა, მისი ისტორიული მხარეც აღარ ინახება
  const historicalOptions = getHistoricalOptions(values.municipalities);

  return {
    title: byLang("title"),
    description: byLang("description"),
    langs,
    activity: values.activity,
    difficulty: values.difficulty,
    municipalities: values.municipalities,
    historicalRegions: values.historicalRegions.filter((h) =>
      historicalOptions.includes(h),
    ),
    routeType: values.routeType,
    seasons: [...values.seasons].sort((a, b) => a - b),
    features: values.features,
    access: values.access || null,
    overnight: values.overnight,
    aiLangs: values.aiLangs.filter((lang) => langs.includes(lang)),
  };
}
