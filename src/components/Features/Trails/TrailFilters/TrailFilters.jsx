import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Car, Footprints, Mountain, SlidersHorizontal } from "lucide-react";
import { Button, Checkbox, ChipGroup } from "@/components/UI/Index";
import { MunicipalitySelect } from "@/components/Features/Common/MunicipalitySelect/MunicipalitySelect";
import { ACTIVITIES, ROUTE_TYPES, getActivity } from "@/components/Utils/trailOptions";
import { DISTANCE_RANGES, SORTS, countExtraFilters } from "@/components/Utils/trailFilters";
import styles from "./TrailFilters.module.css";

const ACTIVITY_ICONS = { hiking: Footprints, running: Activity, mountaineering: Mountain, offroad: Car };

/**
 * ფილტრები: ზემოთ აქტივობა და დახარისხება, დანარჩენი — „ფილტრები“ ღილაკით გასახსნელ პანელში
 * filters: parseFilters()-ის შედეგი; onChange(patch); onReset()
 */
export function TrailFilters({ filters, onChange, onReset, shown }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const extra = countExtraFilters(filters);
  const month = new Date().getMonth() + 1;
  const activity = getActivity(filters.activity);

  const activityOptions = ACTIVITIES.map(({ id }) => {
    const Icon = ACTIVITY_ICONS[id];
    return { value: id, label: t(`activities.${id}`), icon: <Icon size={16} /> };
  });

  return (
    <div className={styles.filters}>
      <div className={styles.bar}>
        <ChipGroup
          options={activityOptions}
          value={filters.activity}
          // სხვა აქტივობას სხვა სირთულეები აქვს: არჩეული სირთულე იშლება
          onChange={(value) => onChange({ activity: value, difficulty: [] })}
          allowDeselect
          name="activity"
        />

        <div className={styles.barEnd}>
          <button
            type="button"
            className={`${styles.moreButton} ${open ? styles.moreOpen : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <SlidersHorizontal size={16} />
            {t("home.filters")}
            {extra > 0 && <span className={styles.badge}>{extra}</span>}
          </button>

          <label className={styles.sort}>
            <span className={styles.sortLabel}>{t("home.sortLabel")}</span>
            <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
              {SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t(`home.sort.${sort}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {open && (
        <div className={styles.panel}>
          {activity ? (
            <ChipGroup
              label={t("trailForm.difficulty")}
              options={activity.difficulties.map((d) => ({ value: d, label: t(`difficulty.${d}`) }))}
              value={filters.difficulty}
              onChange={(difficulty) => onChange({ difficulty })}
              multiple
            />
          ) : (
            <div className={styles.field}>
              <span className={styles.label}>{t("trailForm.difficulty")}</span>
              <span className={styles.hint}>{t("home.chooseActivity")}</span>
            </div>
          )}

          <ChipGroup
            label={t("stats.distance")}
            options={DISTANCE_RANGES.map(({ id }) => ({ value: id, label: t(`home.distance.${id}`) }))}
            value={filters.distance}
            onChange={(distance) => onChange({ distance })}
            allowDeselect
            name="distance"
          />

          <ChipGroup
            label={t("trailForm.routeType")}
            options={ROUTE_TYPES.map((id) => ({ value: id, label: t(`routeTypes.${id}`) }))}
            value={filters.routeType}
            onChange={(routeType) => onChange({ routeType })}
            multiple
          />

          <Checkbox
            label={t("home.inSeason", { month: t(`months.${month}`) })}
            checked={filters.inSeason}
            onChange={(inSeason) => onChange({ inSeason })}
          />

          <MunicipalitySelect
            label={t("trailForm.municipalities")}
            value={filters.municipalities}
            onChange={(municipalities) => onChange({ municipalities })}
          />

          <div className={styles.panelEnd}>
            <span className={styles.hint}>{t("home.results", { count: shown })}</span>
            <div className={styles.panelActions}>
              <Button variant="link" onClick={onReset}>
                {t("home.reset")}
              </Button>
              <Button onClick={() => setOpen(false)}>{t("home.apply")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}