import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { Maximize2, Minimize2 } from "lucide-react";
import styles from "./FullscreenControl.module.css";
import { useTranslation } from "react-i18next";

export function FullscreenControl({ active, onToggle }) {
  const map = useMap();
  const buttonRef = useRef(null);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(buttonRef.current);
  }, []);

  useEffect(() => {
    map.invalidateSize(); // ზომის შეცვლის შემდეგ Leaflet-მა ფილები თავიდან დაითვალოს
    if (!active) return;

    const onKey = (e) => e.key === "Escape" && onToggle();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // უკან გვერდი არ ისქროლოს

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, map, onToggle]);
  const t = useTranslation();
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label={active ? t("map.fullscreenExit") : t("map.fullscreenEnter")}
      title={active ? t("map.fullscreenExit") : t("map.fullscreenEnter")}
    >
      {active ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
    </button>
  );
}
