import { useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPinPlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./WaypointControl.module.css";

const SNAP_PX = 40; // ტრეკიდან ამაზე შორს დაწკაპუნება არ ითვლება
const round6 = (n) => Math.round(n * 1e6) / 1e6;

// ტრეკის უახლოესი წერტილი ეკრანის პიქსელებში (zoom-ს და რუკის შემობრუნებას ითვალისწინებს)
function nearestIndex(map, positions, latlng) {
  const target = map.latLngToContainerPoint(latlng);
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < positions.length; i++) {
    const p = map.latLngToContainerPoint(positions[i]);
    const dist = (p.x - target.x) ** 2 + (p.y - target.y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return bestDist <= SNAP_PX ** 2 ? best : -1;
}

/**
 * „წერტილის დამატება“: ჩართვის შემდეგ ტრეკზე დაწკაპუნება ამატებს წერტილს
 * coords: [lng, lat, ele?][], positions: [lat, lng][]
 */
export function WaypointControl({ coords, positions, active, onToggle, onAdd, hidden = false }) {
  const map = useMap();
  const { t } = useTranslation();
  const barRef = useRef(null);
  const [missed, setMissed] = useState(false); // ბოლო დაწკაპუნება ტრეკიდან შორს იყო

  useEffect(() => {
    L.DomEvent.disableClickPropagation(barRef.current);
  }, []);

  // არჩევის რეჟიმი: crosshair კურსორი, Escape აუქმებს
  useEffect(() => {
    if (!active) return;
    const container = map.getContainer();
    container.classList.add(styles.picking);
    const onKey = (e) => e.key === "Escape" && onToggle(false);
    document.addEventListener("keydown", onKey);
    return () => {
      container.classList.remove(styles.picking);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, map, onToggle]);

  useMapEvents({
    click(e) {
      if (!active) return;
      const index = nearestIndex(map, positions, e.latlng);
      setMissed(index < 0);
      if (index < 0) return;

      const [lng, lat, ele] = coords[index];
      onAdd({
        lat: round6(lat),
        lng: round6(lng),
        ele: ele != null ? Math.round(ele) : null,
        name: {},
        desc: "",
        type: "other",
      });
    },
  });

  function toggle() {
    setMissed(false);
    onToggle(!active);
  }

  return (
        // hidden: წერტილის popup ღიაა — ღილაკი მას არ გადაეფაროს
    <div ref={barRef} className={`${styles.bar} ${hidden ? styles.hidden : ""}`}>
      <button type="button" className={`${styles.button} ${active ? styles.active : ""}`} onClick={toggle}>
        {active ? <X size={16} /> : <MapPinPlus size={16} />}
        {active ? t("waypoints.cancelAdd") : t("waypoints.add")}
      </button>
      {active && (
        <p className={`${styles.hint} ${missed ? styles.missed : ""}`} role="status">
          {t(missed ? "waypoints.tooFar" : "waypoints.pickHint")}
        </p>
      )}
    </div>
  );
}