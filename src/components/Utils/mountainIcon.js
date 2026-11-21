// მთის იკონის ფორმა: ორი მწვერვალი (მარცხენა მაღალი, თოვლიანი).
// ერთი წყარო React-ის SVG-სთვისაც (MountainIcon) და Leaflet-ის divIcon-ისთვისაც.
export const MOUNTAIN_PATH = "M-11 6 L-4 -8 L0 -1 L4 -5 L11 6 Z";
export const SNOW_PATH = "M-4 -8 L-6.2 -3.6 L-4.6 -4.4 L-3.4 -3.2 L-1.9 -4.8 Z";

// SVG სტრიქონად (Leaflet-ის divIcon-ისთვის)
export const mountainSvg = (size = 26) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-13 -11 26 20">` +
  `<path d="${MOUNTAIN_PATH}" fill="#1c2321" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke"/>` +
  `<path d="${SNOW_PATH}" fill="#fff"/></svg>`;