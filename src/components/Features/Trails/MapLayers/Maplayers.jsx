import { useEffect, useRef, useState } from "react";
import { TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { BASE_LAYERS, DEFAULT_LAYER } from "@/components/Utils/mapLayers";
import styles from "./MapLayers.module.css";

// რუკის ცენტრის tile-ის URL მოცემული ფენისთვის
function getThumbUrl(layer, map) {
  const zoom = Math.max(0, Math.min(map.getZoom() - 1, layer.maxZoom)); // ოდნავ შორიდან
  const { x, y } = map.project(map.getCenter(), zoom).divideBy(256).floor();
  return L.Util.template(layer.url, { s: "a", z: zoom, x, y, r: "" });
}

export function MapLayers({ defaultLayer = DEFAULT_LAYER }) {
  const map = useMap();
  const [activeId, setActiveId] = useState(defaultLayer);
  const [, setViewVersion] = useState(0);
  const buttonRef = useRef(null);

  // რუკის გადაადგილებისას მინიატურა განახლდეს
  useMapEvents({ moveend: () => setViewVersion((v) => v + 1) });

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const index = BASE_LAYERS.findIndex((layer) => layer.id === activeId);
  const { id, name, ...tileProps } = BASE_LAYERS[index];
  const next = BASE_LAYERS[(index + 1) % BASE_LAYERS.length];

  return (
    <>
      <TileLayer key={id} {...tileProps} />

      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        onClick={() => setActiveId(next.id)}
        aria-label={`${next.name} ფენაზე გადართვა`}
        title={`აქტიური: ${name}`}
      >
        <img src={getThumbUrl(next, map)} alt="" className={styles.thumb} />

      </button>
    </>
  );
}