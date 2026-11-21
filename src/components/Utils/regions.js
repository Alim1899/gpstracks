// საქართველოს ადმინისტრაციული დაყოფა: მხარეები, მუნიციპალიტეტები, ისტორიული რეგიონები.
// id-ები ემთხვევა მომავალი მუნიციპალიტეტების GeoJSON-ის properties.id-ს:
// ფორმა, ფილტრი, რუკის ფენა და ავტომატური განსაზღვრა ერთსა და იმავე id-ებს იყენებს.

export const ADMIN_REGIONS = [
  { id: "tbilisi", municipalities: ["tbilisi"] },
  { id: "mtskheta-mtianeti", municipalities: ["mtskheta", "dusheti", "tianeti", "kazbegi", "akhalgori"] },
  { id: "kakheti", municipalities: ["telavi", "akhmeta", "gurjaani", "dedoplistskaro", "lagodekhi", "sagarejo", "signagi", "kvareli"] },
  { id: "kvemo-kartli", municipalities: ["rustavi", "bolnisi", "gardabani", "dmanisi", "tetritskaro", "marneuli", "tsalka"] },
  { id: "shida-kartli", municipalities: ["gori", "kaspi", "kareli", "khashuri", "tskhinvali", "java", "znauri"] },  { id: "samtskhe-javakheti", municipalities: ["akhaltsikhe", "adigeni", "aspindza", "akhalkalaki", "borjomi", "ninotsminda"] },
  { id: "imereti", municipalities: ["kutaisi", "baghdati", "vani", "zestaponi", "terjola", "samtredia", "sachkhere", "tkibuli", "tskaltubo", "chiatura", "kharagauli", "khoni"] },
  { id: "racha-lechkhumi", municipalities: ["ambrolauri", "oni", "lentekhi", "tsageri"] },
  { id: "samegrelo-zemo-svaneti", municipalities: ["zugdidi", "poti", "abasha", "martvili", "mestia", "senaki", "chkhorotsku", "tsalenjikha", "khobi"] },
  { id: "guria", municipalities: ["ozurgeti", "lanchkhuti", "chokhatauri"] },
  { id: "adjara", municipalities: ["batumi", "keda", "kobuleti", "khelvachauri", "shuakhevi", "khulo"] },
  { id: "abkhazia", municipalities: ["sokhumi", "gagra", "gudauta", "gulripshi", "ochamchire", "gali"] },];

// ოკუპირებული მუნიციპალიტეტები: რუკაზე სხვა სტილი, ბილიკზე გაფრთხილება
export const OCCUPIED = new Set([
  "akhalgori", "tskhinvali", "java", "znauri",
  "sokhumi", "gagra", "gudauta", "gulripshi", "ochamchire", "gali",
]);

export const HISTORICAL_REGIONS = [
  { id: "tusheti", municipalities: ["akhmeta"] },
  { id: "khevsureti", municipalities: ["dusheti"] },
  { id: "pshavi", municipalities: ["dusheti"] },
  { id: "khevi", municipalities: ["kazbegi"] },
];

export const ALL_MUNICIPALITIES = ADMIN_REGIONS.flatMap((r) =>
  r.municipalities.map((id) => ({ id, region: r.id, occupied: OCCUPIED.has(id) }))
);

export const getRegionOf = (municipalityId) =>
  ALL_MUNICIPALITIES.find((m) => m.id === municipalityId)?.region ?? null;

// მუნიციპალიტეტებიდან მხარეები (დუბლიკატების გარეშე), შენახვისას ავტომატურად
export function getAdminRegions(municipalityIds) {
  return [...new Set(municipalityIds.map(getRegionOf).filter(Boolean))];
}

// რომელი ისტორიული რეგიონები ეკუთვნის არჩეულ მუნიციპალიტეტებს (ფორმაში მხოლოდ ესენი ჩანს)
export function getHistoricalOptions(municipalityIds) {
  return HISTORICAL_REGIONS.filter((h) => h.municipalities.some((m) => municipalityIds.includes(m))).map(
    (h) => h.id
  );
}

export const MIN_SEARCH_LENGTH = 2;


export function searchMunicipalities(query, labels) {
  const q = query.trim().toLocaleLowerCase();
  if (q.length < MIN_SEARCH_LENGTH) return [];

  const matches = (name = "") =>
    name.toLocaleLowerCase().split(/[\s-]+/).some((word) => word.startsWith(q));

  return ALL_MUNICIPALITIES.filter((m) =>
    Object.values(labels).some((lang) => matches(lang[m.id]))
  );
}