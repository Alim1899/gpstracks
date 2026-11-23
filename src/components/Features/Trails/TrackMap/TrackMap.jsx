// UNTOUCHABLE|||||||||||||||||||||||||||||\
import "leaflet/dist/leaflet.css";
import "@/components/Utils/leafletSetup";
import "leaflet-rotate";
// UNTOUCHABLE|||||||||||||||||||||||||||||\

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mountainSvg } from "@/components/Utils/mountainIcon";
import { MapLayers } from "../MapLayers/MapLayers";
import { FullscreenControl } from "../FullscreenControl/FullScreenControl";
import { CompassControl } from "../CompassControl/CompassControl";
import { LocateControl } from "../LocateControl/LocateControl";
import { TrackStats } from "../TrackStats/TrackStats";
import { WaypointControl } from "../WaypointControl/WaypointControl";
import { WaypointForm } from "../WaypointForm/WaypointForm";
import styles from "./TrackMap.module.css";
import { waypointName, waypointPinHtml } from "@/components/Utils/waypoints";

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

const TRACK_COLOR = "#d9480f";
const CASING = { color: "#fff", weight: 7, opacity: 0.9 }; // თეთრი კონტური: ხაზი ნებისმიერ ფენაზე ჩანს

const peakIcon = L.divIcon({
  className: "",
  html: mountainSvg(28),
  iconSize: [28, 22],
  iconAnchor: [14, 20],
});

// წერტილის იკონები ქეშში: ტიპი + მონიშნულია თუ არა
const waypointIcons = new Map();
function waypointIcon(type, selected) {
  const key = `${type}|${selected}`;
  if (!waypointIcons.has(key)) {
    const size = selected ? 36 : 28;
    waypointIcons.set(
      key,
      L.divIcon({
        className: "",
        html: waypointPinHtml(type, size),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
    );
  }
  return waypointIcons.get(key);
}

// სიიდან არჩეული წერტილი ხილვად არეში გადმოვიდეს
function PanToPoint({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point && !map.getBounds().contains(point)) map.panTo(point);
  }, [map, point]);
  return null;
}

/**
 * coords: [lng, lat, ele?][]
 * stats: fullscreen-ის პანელისთვის (არასავალდებულო)
 * segments: [{ from, to, color }] — დახრილობის ფერები (არასავალდებულო)
 * hoverIndex: პროფილზე მონიშნული წერტილი (არასავალდებულო)
 * peakIndex: მწვერვალის იკონი (არასავალდებულო)
 * waypoints: [{ lat, lng, ele, name, desc, type }] (არასავალდებულო, ნახვის რეჟიმი)
 * selectedWaypoint, onSelectWaypoint: მონიშნული წერტილის index (ნახვის რეჟიმი)
 * editor: useWaypointEditor()-ის შედეგი — თუ გადაეცა, წერტილები რედაქტირდება პირდაპირ რუკაზე
 */
export function TrackMap({
  coords,
  stats,
  segments,
  hoverIndex,
  peakIndex,
  showLocate = false,
  waypoints,
  selectedWaypoint = null,
  onSelectWaypoint,
  editor,
  waypointLangs = [],
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const [fullscreen, setFullscreen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);

  const positions = useMemo(
    () => coords.map(([lng, lat]) => [lat, lng]),
    [coords],
  );
  const coloredLines = useMemo(
    () =>
      segments?.map((s) => ({
        key: s.from,
        color: s.color,
        positions: positions.slice(s.from, s.to + 1),
      })),
    [segments, positions],
  );
  // რედაქტირებისას სია და მონიშნული editor-იდან მოდის
  const editable = Boolean(editor);
  const points = editable ? editor.waypoints : waypoints;
  const selected = editable ? editor.selected : selectedWaypoint;
  const select = editable ? editor.select : onSelectWaypoint;
  const selectedPoint = points?.[selected];
  // მხოლოდ კოორდინატებზე დამოკიდებული: სახელის აკრეფისას popup თავიდან არ იხატება (ფოკუსი არ იკარგება)
  const pointLat = selectedPoint?.lat;
  const pointLng = selectedPoint?.lng;
  const focusPoint = useMemo(
    () => (pointLat != null ? [pointLat, pointLng] : null),
    [pointLat, pointLng],
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

        <Polyline positions={positions} pathOptions={CASING} />
        {coloredLines?.length ? (
          coloredLines.map((line) => (
            <Polyline
              key={line.key}
              positions={line.positions}
              pathOptions={{ color: line.color, weight: 4 }}
            />
          ))
        ) : (
          <Polyline
            positions={positions}
            pathOptions={{ color: TRACK_COLOR, weight: 4 }}
          />
        )}

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
        {peakIndex != null && (
          <Marker
            position={positions[peakIndex]}
            icon={peakIcon}
            interactive={false}
          />
        )}
        {hoverIndex != null && positions[hoverIndex] && (
          <CircleMarker
            center={positions[hoverIndex]}
            radius={7}
            pathOptions={{ ...pointStyle("#1a73e8"), weight: 3 }}
          />
        )}

        {points?.map((w, i) => {
          const name = waypointName(w, lang).text;
          return (
            <Marker
              key={`${i}-${w.lat}-${w.lng}`}
              position={[w.lat, w.lng]}
              icon={waypointIcon(w.type, i === selected)}
              zIndexOffset={i === selected ? 1000 : 0}
              eventHandlers={{ click: () => select?.(i) }}
            >
              {name && (
                <Tooltip direction="top" offset={[0, -16]}>
                  {name}
                </Tooltip>
              )}
              {/* ნახვის რეჟიმში: დეტალები popup-ში */}
              {!editable && (
                <Popup>
                  <strong>{name || t(`waypoints.types.${w.type}`)}</strong>
                  <br />
                  {t(`waypoints.types.${w.type}`)}
                  {w.ele != null && ` · ${w.ele} ${t("units.m")}`}
                  {w.desc && <p className={styles.popupDesc}>{w.desc}</p>}
                </Popup>
              )}
            </Marker>
          );
        })}
        <PanToPoint point={focusPoint} />

        {editable && (
          <>
            <WaypointControl
              coords={coords}
              positions={positions}
              active={editor.adding}
              onToggle={editor.toggleAdding}
              onAdd={editor.add}
              hidden={Boolean(selectedPoint)}
            />
            {/* მონიშნული წერტილის სახელი და ტიპი — popup-ში; დახურვა დაუდასტურებელ ახალ წერტილს შლის */}
            {selectedPoint && (
              <Popup
                key={selected}
                position={focusPoint}
                offset={[0, -12]}
                minWidth={248}
                eventHandlers={{ remove: () => editor.close(selected) }}
              >
                <WaypointForm
                  waypoint={selectedPoint}
                  langs={waypointLangs}
                  isNew={editor.isDraft(selected)}
                  onChange={(patch) => editor.update(selected, patch)}
                  onConfirm={editor.confirm}
                  onDelete={() => editor.remove(selected)}
                />
              </Popup>
            )}
          </>
        )}

        <FitBounds positions={positions} />
        <FullscreenControl active={fullscreen} onToggle={toggleFullscreen} />
        {showLocate && <LocateControl />}
        <CompassControl />
      </MapContainer>

      {/* რუკის გარეთ: პანელზე დაჭერა/სქროლი რუკას აღარ ამოძრავებს */}
      {fullscreen && stats && (
        <div className={`${styles.sheet} ${sheetOpen ? styles.sheetOpen : ""}`}>
          <button
            type="button"
            className={styles.sheetToggle}
            onClick={() => setSheetOpen((o) => !o)}
            aria-expanded={sheetOpen}
            aria-label={sheetOpen ? t("map.hideDetails") : t("map.showDetails")}
          >
            {sheetOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
          <div className={styles.sheetBody}>
            <TrackStats stats={stats} />
          </div>
        </div>
      )}
    </div>
  );
}
