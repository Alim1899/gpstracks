import { useEffect, useMemo, useRef } from "react";
import { Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import { useDeviceHeading } from "@/hooks/useDeviceHeading";
import styles from "./LocateControl.module.css";
import { useGeolocation } from "@/hooks/useGeolocation";

export function LocateControl() {
  const map = useMap();
  const buttonRef = useRef(null);
  const centeredOnce = useRef(false);
  const { position, error, start, watching } = useGeolocation();
  const { heading, enable } = useDeviceHeading();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(buttonRef.current);
  }, []);

  // პირველ ჯერზე რუკა მომხმარებლის მდებარეობაზე გადავიდეს
  useEffect(() => {
    if (position && !centeredOnce.current) {
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15));
      centeredOnce.current = true;
    }
  }, [position, map]);

  async function handleClick() {
    await enable(); // ჯერ კომპასი, რადგან iOS-ს ნებართვა უშუალოდ დაჭერისას სჭირდება
    if (watching && position) map.flyTo([position.lat, position.lng]);
    else start();
  }

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        html: `
          <div class="${styles.marker}">
            ${heading != null ? `<div class="${styles.cone}" style="transform: rotate(${heading}deg)"></div>` : ""}
            <div class="${styles.dot}"></div>
          </div>`,
      }),
    [heading]
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.button} ${watching ? styles.active : ""}`}
        onClick={handleClick}
        aria-label="ჩემი მდებარეობა"
        title={error ?? "ჩემი მდებარეობა"}
      >
        <LocateFixed size={18} />
      </button>

      {position && (
        <>
          <Circle
            center={[position.lat, position.lng]}
            radius={position.accuracy}
            pathOptions={{ color: "#1a73e8", weight: 1, fillOpacity: 0.1 }}
          />
          <Marker position={[position.lat, position.lng]} icon={icon} interactive={false} rotateWithView />
        </>
      )}
    </>
  );
}