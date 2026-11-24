import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Activity, Car, Footprints, MapPin, Mountain } from "lucide-react";
import { localized } from "@/components/Utils/localized";
import { formatDuration } from "@/components/Utils/trackParser";
import { difficultyTone } from "@/components/Utils/trailFilters";
import styles from "./TrailCard.module.css";

const ACTIVITY_ICONS = {
  hiking: Footprints,
  running: Activity,
  mountaineering: Mountain,
  offroad: Car,
};

/**
 * ბილიკის ბარათი მთავარ გვერდზე
 * active: რუკაზე მონიშნულია (მარკერზე მიტანა); onHover(id | null): რუკაზე მარკერის მონიშვნა
 */
export function TrailCard({ trail, active, onHover }) {
  const { t, i18n } = useTranslation();
  const title = localized(trail.title, i18n.resolvedLanguage);
  const Icon = ACTIVITY_ICONS[trail.activity];
  const [firstPlace, ...otherPlaces] = trail.municipalities ?? [];

  return (
    <Link
      to={`/trails/${trail.id}`}
      className={`${styles.card} ${active ? styles.active : ""}`}
      onMouseEnter={() => onHover(trail.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(trail.id)}
      onBlur={() => onHover(null)}
    >
      <div className={styles.tags}>
        <span className={styles.activity}>
          {Icon && <Icon size={14} />}
          {t(`activities.${trail.activity}`)}
        </span>
        <span className={styles.difficulty} data-tone={difficultyTone(trail)}>
          {t(`difficulty.${trail.difficulty}`)}
        </span>
      </div>

      <h3 className={styles.title} lang={title.lang ?? undefined}>
        {title.text}
      </h3>

      {firstPlace && (
        <p className={styles.place}>
          <MapPin size={14} />
          {t(`municipalities.${firstPlace}`)}
          {otherPlaces.length > 0 && ` +${otherPlaces.length}`}
        </p>
      )}

      <dl className={styles.stats}>
        <div>
          <dt>{t("stats.distance")}</dt>
          <dd>
            {trail.distanceKm.toFixed(1)} {t("units.km")}
          </dd>
        </div>
        <div>
          <dt>{t("stats.gain")}</dt>
          <dd>
            {trail.gain} {t("units.m")}
          </dd>
        </div>
        {trail.estimatedHours != null && (
          <div>
            <dt>{t("stats.estimated")}</dt>
            <dd>{formatDuration(trail.estimatedHours, t)}</dd>
          </div>
        )}
      </dl>
    </Link>
  );
}