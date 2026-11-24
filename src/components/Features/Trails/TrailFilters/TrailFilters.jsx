import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button, Checkbox, ChipGroup } from "@/components/UI/Index";
import { MunicipalitySelect } from "@/components/Features/Common/MunicipalitySelect/MunicipalitySelect";
import { ROUTE_TYPES, getActivity } from "@/components/Utils/trailOptions";
import { DISTANCE_RANGES, SORTS, countExtraFilters } from "@/components/Utils/trailFilters";
import styles from "./TrailFilters.module.css";

/**
 * გვერდითი პანელის ფილტრები: „ფილტრები“ ჩამოიშლება სიის თავზე (რუკას არ ეფარება) + დალაგება
 * აქტივობა ცალკეა (ActivityBar, რუკის თავზე)
 * filters: parseFilters()-ის შედეგი; onChange(patch); onReset()
 */
export function TrailFilters({ filters, onChange, onReset }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const extra = countExtraFilters(filters);
  const month = new Date().getMonth() + 1;
  const activity = getActivity(filters.activity);

  return (
    <div className={styles.filters}>
      <div className={styles.head}>
        <button
          type="button"
          className={`${styles.toggle} ${open ? styles.open : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <SlidersHorizontal size={16} />
          {t("home.filters")}
          {extra > 0 && <span className={styles.badge}>{extra}</span>}
          <ChevronDown size={16} className={styles.chevron} />
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
            inline
            label={t("trailForm.municipalities")}
            value={filters.municipalities}
            onChange={(municipalities) => onChange({ municipalities })}
          />

          {extra > 0 && (
            <Button variant="link" onClick={onReset} className={styles.reset}>
              {t("home.reset")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}