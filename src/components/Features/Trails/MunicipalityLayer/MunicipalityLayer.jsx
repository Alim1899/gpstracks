import { useEffect, useMemo } from "react";
import { GeoJSON, Pane, useMap } from "react-leaflet";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, GEORGIA_MASK_URL, MUNICIPALITIES_URL } from "@/components/Utils/mapData";
import styles from "./MunicipalityLayer.module.css";

const MASK_STYLE = { stroke: false, fillColor: "#777271", fillOpacity: 0.4 };
const BORDER_STYLE = { color: "#3d4a44", weight: 1, opacity: 0.55, fill: false };
const SELECTED_STYLE = { color: "#f70202", weight: 3, opacity: 1, fillColor: "#2f6b4f", fillOpacity: 0.08 };
const PAD = 50;
const useGeoJson = (url) =>
  useQuery({ queryKey: ["geojson", url], queryFn: () => fetchJson(url), staleTime: Infinity });

/**
 * საქართველოს გარეთ რუკა ბუნდოვანია, საქართველო — მკვეთრი.
 * backdrop-filter ფენა საქართველოს ფორმის „ხვრელით“ (clip-path evenodd),
 * რუკის ყოველ გადაადგილებაზე თავიდან ითვლება. მხოლოდ შემოუბრუნებელ რუკაზე.
 */
function BlurOutside({ mask }) {
  const map = useMap();

  useEffect(() => {
    const pane = map.getPane("blurOutside") ?? map.createPane("blurOutside");
    pane.style.zIndex = 250; // tile-ების (200) ზემოთ, საზღვრებისა (350) და მარკერების ქვემოთ
    pane.style.pointerEvents = "none";
    const layer = L.DomUtil.create("div", styles.blur, pane);
    const rings = mask.features[0].geometry.coordinates.slice(1); // ხვრელები = საქართველო

    function update() {
      const { x: width, y: height } = map.getSize();
      L.DomUtil.setPosition(layer, map.containerPointToLayerPoint([0, 0]));
      layer.style.width = `${width}px`;
      layer.style.height = `${height}px`;

           // ხვრელები ეკრანის ჩარჩოთი იჭრება: დიდ ზუმზე კოორდინატები უზარმაზარი ხდება
      // და ბრაუზერი clip-path-ს ვეღარ ხატავს — მთელი რუკა ბუნდოვანდებოდა
      const view = L.bounds([-PAD, -PAD], [width + PAD, height + PAD]);
      const holes = rings
        .map((ring) => {
          const points = ring.map(([lng, lat]) => map.latLngToContainerPoint([lat, lng]));
          const clipped = L.PolyUtil.clipPolygon(points, view);
          if (clipped.length < 3) return "";
          return "M" + clipped.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L") + "Z";
        })
        .join("");
      layer.style.clipPath = `path(evenodd, "M0 0H${width}V${height}H0Z${holes}")`;
    }

    update();
    map.on("move zoom viewreset resize", update);
    return () => {
      map.off("move zoom viewreset resize", update);
      layer.remove();
    };
  }, [map, mask]);

  return null;
}

/**
 * ფონი: საქართველოს გარეთ დაბნელებული ან ბუნდოვანი, მუნიციპალიტეტების საზღვრები, არჩეულები გამოკვეთილი.
 * blurOutside: გარეთ ბუნდოვანი (მთავარი გვერდი); სხვა შემთხვევაში ნაცრისფერი ფენა
 */
export function MunicipalityLayer({ selected = [], blurOutside = false }) {
  const { data: mask } = useGeoJson(GEORGIA_MASK_URL);
  const { data: municipalities } = useGeoJson(MUNICIPALITIES_URL);

  const selectedKey = selected.join(",");
  const selectedData = useMemo(() => {
    if (!municipalities || !selectedKey) return null;
    const ids = selectedKey.split(",");
    return { ...municipalities, features: municipalities.features.filter((f) => ids.includes(f.properties.id)) };
  }, [municipalities, selectedKey]);

  return (
    <>
      {mask && blurOutside && <BlurOutside mask={mask} />}
      <Pane name="context" style={{ zIndex: 350, pointerEvents: "none" }}>
        {mask && !blurOutside && <GeoJSON data={mask} interactive={false} style={MASK_STYLE} />}
        {municipalities && <GeoJSON data={municipalities} interactive={false} style={BORDER_STYLE} />}
        {selectedData && (
          <GeoJSON key={selectedKey} data={selectedData} interactive={false} style={SELECTED_STYLE} />
        )}
      </Pane>
    </>
  );
}