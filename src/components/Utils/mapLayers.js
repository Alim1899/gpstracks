const OSM =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const BASE_LAYERS = [
  {
    id: "topo",
    name: "ტოპო",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: `${OSM}, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`,
    maxNativeZoom: 17,
    maxZoom: 17,
  },
  {
    id: "satellite",
    name: "სატელიტი",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
    maxNativeZoom: 17,
    maxZoom: 19,
  },
];

export const DEFAULT_LAYER = "topo";
