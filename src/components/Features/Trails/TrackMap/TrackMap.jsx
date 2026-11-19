import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Polyline, CircleMarker, useMap } from "react-leaflet";
import { MapLayers } from "../MapLayers/MapLayers";
import { FullscreenControl } from "../FullscreenControl/FullScreenControl";
import styles from "./TrackMap.module.css";
import { CompassControl } from "../CompassControl/CompassControl";
import { LocateControl } from "../LocateControl/LocateControl";
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(positions, { padding: [24, 24] });
  }, [map, positions]);
  return null;
}

const pointStyle = (fillColor) => ({
  color: "#fff",
  weight: 2,
  fillColor,
  fillOpacity: 1,
});

export function TrackMap({ coords, showLocate = false }) {
  const [fullscreen, setFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);
  const positions = useMemo(
    () => coords.map(([lng, lat]) => [lat, lng]),
    [coords],
  );

  return (
    <div className={`${styles.wrapper} ${fullscreen ? styles.fullscreen : ""}`}>
      <MapContainer
        className={styles.map}
        center={positions[0]}
        zoom={12}
        rotate 
        rotateControl={false}
        touchRotate
      >
        <MapLayers />
        <Polyline
          positions={positions}
          pathOptions={{ color: "#d9480f", weight: 4 }}
        />
        <CircleMarker
          center={positions[0]}
          radius={7}
          pathOptions={pointStyle("#2f6b4f")}
        />
        <CircleMarker
          center={positions.at(-1)}
          radius={7}
          pathOptions={pointStyle("#c0392b")}
        />
        <FitBounds positions={positions} />
        <FullscreenControl active={fullscreen} onToggle={toggleFullscreen} />
        {showLocate && <LocateControl />}
          <CompassControl />
      </MapContainer>
    </div>
  );
}
