// UNTOUCHABLE|||||||||||||||||||||||||||||\
import "leaflet/dist/leaflet.css";
import "@/components/Utils/leafletSetup";
import "leaflet-rotate";
// UNTOUCHABLE|||||||||||||||||||||||||||||\

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Polyline, CircleMarker, useMap } from "react-leaflet";
import { MapLayers } from "../MapLayers/MapLayers";
import { FullscreenControl } from "../FullscreenControl/FullScreenControl";
import styles from "./TrackMap.module.css";
import { CompassControl } from "../CompassControl/CompassControl";
import { LocateControl } from "../LocateControl/LocateControl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TrackStats } from "../TrackStats/TrackStats";
import { useTranslation } from "react-i18next";

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

export function TrackMap({ coords,stats, showLocate = false }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);
  const positions = useMemo(
    () => coords.map(([lng, lat]) => [lat, lng]),
    [coords],
  );
const {t} =useTranslation()
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
          {fullscreen && stats && (
        <div className={`${styles.sheet} ${sheetOpen ? styles.sheetOpen : ""}`}>
          <button
  type="button"
  className={styles.sheetToggle}
  onClick={() => setSheetOpen((o) => !o)}
  aria-expanded={sheetOpen}
aria-label={sheetOpen ? t("map.hideDetails") : t("map.showDetails")}>
  {sheetOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
</button>
          <div className={styles.sheetBody}>
            <TrackStats stats={stats} />
          </div>
        </div>
      )}
      </MapContainer>
    </div>
  );
}
