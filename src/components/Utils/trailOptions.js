// ბილიკის ყველა არჩევანი ერთ ადგილას: ფორმაც და ფილტრებიც ამ ფაილს იყენებს.
// ბაზაში ინახება id, ეკრანზე ჩანს თარგმანი: t(`activities.${id}`) და ა.შ.

const BASIC_DIFFICULTY = ["easy", "moderate", "hard", "expert"];
const VEHICLE_DIFFICULTY = ["anyCar", "crossover", "4x4", "prepared4x4"];

// speedKmh + climbPerHour: სავარაუდო დროის გამოთვლისთვის (მიახლოებითი)
export const ACTIVITIES = [
  { id: "hiking", icon: "Footprints", speedKmh: 5, climbPerHour: 600, difficulties: BASIC_DIFFICULTY },
  { id: "running", icon: "Activity", speedKmh: 9, climbPerHour: 1000, difficulties: BASIC_DIFFICULTY },
  {
    id: "mountaineering",
    icon: "Mountain",
    speedKmh: 3,
    climbPerHour: 300,
    difficulties: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"],
  },
  { id: "offroad", icon: "Car", speedKmh: 15, climbPerHour: null, difficulties: VEHICLE_DIFFICULTY },
];

export const getActivity = (id) => ACTIVITIES.find((a) => a.id === id);

// რიცხვითი სირთულე ფილტრისა და სორტირებისთვის (1 = ყველაზე მარტივი)
export function getDifficultyLevel(activityId, difficulty) {
  const index = getActivity(activityId)?.difficulties.indexOf(difficulty) ?? -1;
  return index + 1 || null;
}

// სავარაუდო დრო აქტივობის მიხედვით
export function estimateHours(activityId, distanceKm, gain) {
  const activity = getActivity(activityId) ?? ACTIVITIES[0];
  const base = distanceKm / activity.speedKmh;
  return activity.climbPerHour ? base + gain / activity.climbPerHour : base;
}

export const ROUTE_TYPES = ["loop", "outAndBack", "oneWay"];
export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const FEATURES = ["lake", "peak", "pass", "waterfall", "glacier", "spring", "viewpoint", "historic"];
export const ACCESS = ["publicTransport", "anyCar", "4x4"];
export const OVERNIGHT = ["tent", "shelter", "guesthouse"];