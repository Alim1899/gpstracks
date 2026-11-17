import { useEffect, useMemo } from "react";
import { MapContainer, Polyline, CircleMarker, useMap } from "react-leaflet";
import { MapLayers } from "../MapLayers/MapLayers";
import styles from "./TrackMap.module.css";

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(positions, { padding: [24, 24] });
  }, [map, positions]);
  return null;
}

const pointStyle = (fillColor) => ({ color: "#fff", weight: 2, fillColor, fillOpacity: 1 });

export function TrackMap({ coords }) {
  const positions = useMemo(() => coords.map(([lng, lat]) => [lat, lng]), [coords]);

  return (
    <MapContainer className={styles.map} center={positions[0]} zoom={12}>
      <MapLayers />
      <Polyline positions={positions} pathOptions={{ color: "#d9480f", weight: 4 }} />
      <CircleMarker center={positions[0]} radius={7} pathOptions={pointStyle("#2f6b4f")} />
      <CircleMarker center={positions.at(-1)} radius={7} pathOptions={pointStyle("#c0392b")} />
      <FitBounds positions={positions} />
    </MapContainer>
  );
}