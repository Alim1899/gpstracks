// UNTOUCHABLE|||||||||||||||||||||||||||||\
import "leaflet/dist/leaflet.css";
import "@/components/Utils/leafletSetup";
import "leaflet-rotate";
// UNTOUCHABLE|||||||||||||||||||||||||||||\

import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { createElement, Activity, Car, Footprints, Mountain } from "lucide";
import { useTranslation } from "react-i18next";
import { localized } from "@/components/Utils/localized";
import { difficultyTone, TONE_COLORS } from "@/components/Utils/trailFilters";
import { MapLayers } from "../MapLayers/MapLayers";
import styles from "./TrailsMap.module.css";

import { MunicipalityLayer } from "../MunicipalityLayer/MunicipalityLayer";
// საქართველოს საზღვრები (სამხრეთ-დასავლეთი, ჩრდილო-აღმოსავლეთი): ფილტრის გარეშე რუკა ამას ერგება
const GEORGIA_BOUNDS = [
  [41.05, 40.0],
  [43.59, 46.74],
];
const ICONS = { hiking: Footprints, running: Activity, mountaineering: Mountain, offroad: Car };

// მარკერი: სირთულის ფერის წრე აქტივობის იკონით; მონიშნული — უფრო დიდი (ქეშით)
const markerIcons = new Map();
function markerIcon(activity, tone, active) {
  const key = `${activity}|${tone}|${active}`;
  if (!markerIcons.has(key)) {
    const size = active ? 40 : 30;
    const svg = createElement(ICONS[activity] ?? Footprints, {
      width: Math.round(size * 0.5),
      height: Math.round(size * 0.5),
      stroke: "#fff",
      "stroke-width": 2.25,
    }).outerHTML;
    const html = `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;box-sizing:border-box;border:2px solid #fff;border-radius:50%;background:${TONE_COLORS[tone]};box-shadow:0 1px 5px rgb(0 0 0 / ${active ? 0.5 : 0.35})">${svg}</span>`;
    markerIcons.set(
      key,
      L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
    );
  }
  return markerIcons.get(key);
}

const startOf = (trail) => [trail.start.latitude, trail.start.longitude];

// ფილტრის შეცვლისას რუკა ნაჩვენებ ბილიკებს მოერგება (trails ახლდება მხოლოდ ფილტრის ცვლილებაზე).
// მობილურზე რუკა დამალულია (ზომა 0): მორგება ხდება მაშინ, როცა გამოჩნდება (visible)
// რუკის მორგება: ფილტრის გარეშე — მთელ საქართველოზე, ფილტრით — ნაპოვნ ბილიკებზე.
// მობილურზე რუკა დამალულია (ზომა 0): მორგება ხდება მაშინ, როცა გამოჩნდება (visible)
function FitView({ trails, fitToTrails, visible }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const { x, y } = map.getSize();
    if (!x || !y) return;
    if (fitToTrails && trails.length) {
      map.fitBounds(trails.map(startOf), { padding: [40, 40], maxZoom: 11 });
    } else {
      map.fitBounds(GEORGIA_BOUNDS, { padding: [8, 8] });
    }
  }, [map, trails, fitToTrails, visible]);
  return null;
}

/**
 * ყველა ნაჩვენები ბილიკის საწყისი წერტილი რუკაზე
 * activeId: მონიშნული (ბარათზე მიტანა); onHover(id | null): ბარათის მონიშვნა
 * visible: მობილურზე რუკის ხედი ჩართულია (გამოჩენისას ზომა და საზღვრები თავიდან)
 */
export function TrailsMap({ trails, activeId, onHover, visible = true,municipalities,fitToTrails=false  }) {
  const { t, i18n } = useTranslation();
  const withStart = useMemo(() => trails.filter((trail) => trail.start), [trails]);

  return (
   <MapContainer
      className={styles.map}
      bounds={GEORGIA_BOUNDS}
      zoomSnap={0.25}
      zoomDelta={0.5}
      rotateControl={false}
    >
      <MapLayers />
      <MunicipalityLayer selected={municipalities} blurOutside />
      <FitView trails={withStart} fitToTrails={fitToTrails} visible={visible} />

      {withStart.map((trail) => {
        const active = trail.id === activeId;
        return (
          <Marker
            key={trail.id}
            position={startOf(trail)}
            icon={markerIcon(trail.activity, difficultyTone(trail), active)}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{ mouseover: () => onHover(trail.id), mouseout: () => onHover(null) }}
          >
            <Popup>
              <strong>{localized(trail.title, i18n.resolvedLanguage).text}</strong>
              <div className={styles.popupMeta}>
                {t(`activities.${trail.activity}`)} · {t(`difficulty.${trail.difficulty}`)}
              </div>
              <div className={styles.popupMeta}>
                {trail.distanceKm.toFixed(1)} {t("units.km")} · ↑ {trail.gain} {t("units.m")}
              </div>
              <Link to={`/trails/${trail.id}`} className={styles.popupLink}>
                {t("home.viewTrail")}
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}