import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button, ChipGroup, Input, Textarea } from "@/components/UI/Index";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import { WAYPOINT_DESC_MAX, WAYPOINT_NAME_MAX, WAYPOINT_TYPES } from "@/components/Utils/waypoints";
import styles from "./WaypointEditor.module.css";

/**
 * ატვირთვისას წერტილების სია და რედაქტირება (მონიშნული იშლება ფორმად)
 * waypoints: [{ lat, lng, ele, name, desc, type }]
 */
export function WaypointEditor({ waypoints, selected, onSelect, onChange, onDelete }) {
  const { t } = useTranslation();

  const typeOptions = WAYPOINT_TYPES.map(({ id }) => ({
    value: id,
    label: t(`waypoints.types.${id}`),
    icon: <WaypointPin type={id} size={20} />,
  }));

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        {t("waypoints.title")}
        {waypoints.length > 0 && <span className={styles.count}>{waypoints.length}</span>}
      </h2>

      {waypoints.length === 0 ? (
        <p className={styles.empty}>{t("waypoints.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {waypoints.map((w, i) => {
            const open = i === selected;
            return (
              <li key={`${i}-${w.lat}-${w.lng}`} className={`${styles.item} ${open ? styles.open : ""}`}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => onSelect(open ? null : i)}
                  aria-expanded={open}
                >
                  <WaypointPin type={w.type} size={26} />
                  <span className={styles.name}>{w.name || t(`waypoints.types.${w.type}`)}</span>
                  {w.ele != null && (
                    <span className={styles.ele}>
                      {w.ele} {t("units.m")}
                    </span>
                  )}
                </button>

                {open && (
                  <div className={styles.form}>
                    <Input
                      label={t("waypoints.name")}
                      placeholder={t("waypoints.namePlaceholder")}
                      value={w.name}
                      maxLength={WAYPOINT_NAME_MAX}
                      onChange={(e) => onChange(i, { name: e.target.value })}
                      autoFocus
                    />
                    <ChipGroup
                      label={t("waypoints.type")}
                      options={typeOptions}
                      value={w.type}
                      onChange={(type) => onChange(i, { type })}
                    />
                    <Textarea
                      label={t("waypoints.desc")}
                      value={w.desc}
                      rows={2}
                      maxLength={WAYPOINT_DESC_MAX}
                      onChange={(e) => onChange(i, { desc: e.target.value })}
                    />
                    <div className={styles.actions}>
                      <Button variant="outline" onClick={() => onDelete(i)}>
                        <Trash2 size={16} />
                        {t("waypoints.delete")}
                      </Button>
                      <Button onClick={() => onSelect(null)}>{t("waypoints.done")}</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}