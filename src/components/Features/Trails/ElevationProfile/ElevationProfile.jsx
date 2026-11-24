import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, MountainIcon } from "@/components/UI/Index";
import {
  SLOPE_CLASSES,
  indexAtDistance,
  slopeAt,
} from "@/components/Utils/profile";
import styles from "./ElevationProfile.module.css";
import { createElement } from "lucide";
import { getWaypointType, waypointName } from "@/components/Utils/waypoints";
const W = 560;
const H = 220;
const M = { top: 22, right: 16, bottom: 28, left: 52 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

// "ლამაზი" ბიჯი ღერძისთვის: 1, 2, 5, 10, 20, 50... × 10ⁿ
function niceStep(range, targetTicks) {
  const raw = range / targetTicks;
  const power = 10 ** Math.floor(Math.log10(raw));
  const n = raw / power;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power;
}

/**
 * სიმაღლის პროფილი.
 * profile: buildProfile()-ის შედეგი, segments: slopeSegments()-ის შედეგი
 * hoverIndex / onHover: კონტროლირებადი — მშობელი იმავე წერტილს რუკაზეც აჩვენებს
 */
export function ElevationProfile({
  profile,
  segments,
  showSlope,
  onToggleSlope,
  hoverIndex,
  onHover,
  waypoints = [],
  selectedWaypoint = null,
  onSelectWaypoint,
}) {
  const { t, i18n } = useTranslation();
  const gradientId = useId();
  const { dist, ele, totalKm, peakIndex } = profile;

  const scale = useMemo(() => {
    const minE = Math.min(...ele);
    const maxE = Math.max(...ele);
    const yStep = niceStep(Math.max(maxE - minE, 100), 4);
    const yMin = Math.floor(minE / yStep) * yStep;
    const yMax = Math.ceil(maxE / yStep) * yStep;
    const x = (km) => M.left + (km / totalKm) * IW;
    const y = (e) => M.top + IH - ((e - yMin) / (yMax - yMin)) * IH;

    const yTicks = [];
    for (let v = yMin; v <= yMax; v += yStep) yTicks.push(v);
    const xStep = niceStep(totalKm, 6);
    const xTicks = [];
    for (let km = 0; km <= totalKm + 1e-9; km += xStep) xTicks.push(km);

    return { x, y, yTicks, xTicks, xStep };
  }, [ele, totalKm]);

  const { x, y } = scale;
  const toPath = (from, to) =>
    dist
      .slice(from, to + 1)
      .map(
        (d, j) =>
          `${j ? "L" : "M"}${x(d).toFixed(1)} ${y(ele[from + j]).toFixed(1)}`,
      )
      .join(" ");

  const linePath = toPath(0, dist.length - 1); // რამდენიმე ასეული წერტილი — memo არ სჭირდება
  const areaPath = `${linePath} L${x(totalKm)} ${M.top + IH} L${M.left} ${M.top + IH} Z`;

  function handlePointer(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const km = Math.max(0, Math.min(totalKm, ((svgX - M.left) / IW) * totalKm));
    onHover(indexAtDistance(profile, km));
  }

  const km = t("units.km");
  const m = t("units.m");
  const hover = hoverIndex != null && {
    x: x(dist[hoverIndex]),
    y: y(ele[hoverIndex]),
    slope: slopeAt(profile, hoverIndex),
  };
  const tipX = hover && (hover.x + 170 > W ? hover.x - 166 : hover.x + 10);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("trailPage.elevationProfile")}</h2>
        <Checkbox
          label={t("trailPage.slopeColors")}
          checked={showSlope}
          onChange={onToggleSlope}
        />
      </header>

      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("trailPage.elevationProfile")}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => onHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6b4f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2f6b4f" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* ბადე და ღერძები */}
        {scale.yTicks.map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(v)}
              y2={y(v)}
              className={styles.grid}
            />
            <text
              x={M.left - 8}
              y={y(v) + 4}
              textAnchor="end"
              className={styles.axis}
            >
              {v} {m}
            </text>
          </g>
        ))}
        {scale.xTicks.map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - 8}
            textAnchor="middle"
            className={styles.axis}
          >
            {Number(v.toFixed(1))} {km}
          </text>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />

        {showSlope ? (
          segments.map((s) => (
            <path
              key={s.from}
              d={toPath(s.from, s.to)}
              stroke={s.color}
              className={styles.slopeLine}
            />
          ))
        ) : (
          <path d={linePath} className={styles.line} />
        )}

        {/* მწვერვალი */}
        <MountainIcon
          x={x(dist[peakIndex])}
          y={y(ele[peakIndex]) - 11}
          scale={0.9}
        />
        <text
          x={x(dist[peakIndex]) + 14}
          y={y(ele[peakIndex]) - 8}
          className={styles.peakLabel}
        >
          {Math.round(ele[peakIndex])} {m}
        </text>
        {/* წერტილები ხაზზე: ფერადი წრე ტიპის იკონით; დაჭერა რუკაზე მონიშნავს */}
        {waypoints.map(({ waypoint, waypointIndex, index }) => {
          const { icon, color } = getWaypointType(waypoint.type);
          const selected = waypointIndex === selectedWaypoint;
          const r = selected ? 10 : 8;
          const name = waypointName(waypoint, i18n.resolvedLanguage).text || t(`waypoints.types.${waypoint.type}`);
          const iconSvg = createElement(icon, {
            width: r * 1.1,
            height: r * 1.1,
            x: -r * 0.55,
            y: -r * 0.55,
            stroke: "#fff",
            "stroke-width": 2.5,
          }).outerHTML;
          return (
            <g
              key={waypointIndex}
              transform={`translate(${x(dist[index])} ${y(ele[index])})`}
              className={styles.waypoint}
              onClick={() => onSelectWaypoint?.(selected ? null : waypointIndex)}
            >
              <title>{`${name} · ${Math.round(ele[index])} ${m} · ${dist[index].toFixed(1)} ${km}`}</title>
              <circle r={r} fill={color} className={styles.waypointDot} />
              <g dangerouslySetInnerHTML={{ __html: iconSvg }} />
            </g>
          );
        })}
        {hover && (
          <g className={styles.hover}>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={M.top}
              y2={M.top + IH}
              className={styles.hoverLine}
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r="5"
              className={styles.hoverDot}
            />
            <rect
              x={tipX}
              y={M.top}
              width="156"
              height="50"
              rx="8"
              className={styles.tipBox}
            />
            <text x={tipX + 10} y={M.top + 20} className={styles.tipMain}>
              {Math.round(ele[hoverIndex])} {m} · {dist[hoverIndex].toFixed(1)}{" "}
              {km}
            </text>
            <text x={tipX + 10} y={M.top + 39} className={styles.tipSub}>
              {t("trailPage.tooltipSlope", {
                value: `${hover.slope > 0 ? "+" : ""}${hover.slope.toFixed(0)}`,
              })}
            </text>
          </g>
        )}
      </svg>

      {showSlope && (
        <ul className={styles.legend}>
          {SLOPE_CLASSES.map((c) => (
            <li key={c.key}>
              <i style={{ background: c.color }} />
              {t(`trailPage.slope.${c.key}`)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
