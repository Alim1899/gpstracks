import { useMemo } from "react";
import { GeoJSON, Pane } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, GEORGIA_MASK_URL, MUNICIPALITIES_URL } from "@/components/Utils/mapData";

// საქართველოს გარეთ: ნაცრისფერი, ნახევრად გამჭვირვალე ფენა (ყურადღება ქვეყანაზე)
const MASK_STYLE = { stroke: false, fillColor: "#777271", fillOpacity: 0.4 };
const BORDER_STYLE = { color: "#3d4a44", weight: 1, opacity: 0.55, fill: false };
const SELECTED_STYLE = { color: "#2f6b4f", weight: 2.5, opacity: 1, fillColor: "#2f6b4f", fillOpacity: 0.08 };

const useGeoJson = (url) =>
  useQuery({ queryKey: ["geojson", url], queryFn: () => fetchJson(url), staleTime: Infinity });

/**
 * ფონი: საქართველოს გარეთ დაბნელებული, მუნიციპალიტეტების საზღვრები, ფილტრში არჩეულები გამოკვეთილი
 * ცალკე pane: tile-ების ზემოთ, ხაზებისა და მარკერების ქვემოთ, დაჭერას არ იჭერს
 */
export function MunicipalityLayer({ selected = [] }) {
  const { data: mask } = useGeoJson(GEORGIA_MASK_URL);
  const { data: municipalities } = useGeoJson(MUNICIPALITIES_URL);

  const selectedKey = selected.join(",");
  const selectedData = useMemo(() => {
    if (!municipalities || !selectedKey) return null;
    const ids = selectedKey.split(",");
    return { ...municipalities, features: municipalities.features.filter((f) => ids.includes(f.properties.id)) };
  }, [municipalities, selectedKey]);

  return (
    <Pane name="context" style={{ zIndex: 350, pointerEvents: "none" }}>
      {mask && <GeoJSON data={mask} interactive={false} style={MASK_STYLE} />}
      {municipalities && <GeoJSON data={municipalities} interactive={false} style={BORDER_STYLE} />}
      {/* key: react-leaflet GeoJSON-ის data არ ახლდება — არჩევანის შეცვლისას ფენა თავიდან იქმნება */}
      {selectedData && (
        <GeoJSON key={selectedKey} data={selectedData} interactive={false} style={SELECTED_STYLE} />
      )}
    </Pane>
  );
}