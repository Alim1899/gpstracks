import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { List, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Loader } from "@/components/UI/Index";
import { useTrails } from "@/hooks/useTrails";
import {
  applyFilters,
  countExtraFilters,
  filtersToParams,
  parseFilters,
} from "@/components/Utils/trailFilters";
import { ActivityBar } from "../ActivityBar/ActivityBar";
import { TrailFilters } from "../TrailFilters/TrailFilters";
import { TrailCard } from "../TrailCard/TrailCard";
import { TrailsMap } from "../TrailsMap/TrailsMap";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const { data: trails, isLoading, isError } = useTrails();
  const visible = useMemo(() => applyFilters(trails ?? [], filters), [trails, filters]);

  // აქტივობის ღილაკებზე რიცხვები: დანარჩენი ფილტრების გათვალისწინებით, აქტივობის გარეშე
  const activityCounts = useMemo(() => {
    const counts = {};
    for (const trail of applyFilters(trails ?? [], { ...filters, activity: "", difficulty: [] })) {
      counts[trail.activity] = (counts[trail.activity] ?? 0) + 1;
    }
    return counts;
  }, [trails, filters]);

  // ფილტრის გარეშე რუკა მთელ საქართველოს აჩვენებს, ფილტრით — ნაპოვნ ბილიკებს
  const filtered = Boolean(filters.activity) || countExtraFilters(filters) > 0;

  const [hoveredId, setHoveredId] = useState(null); // ბარათი ↔ მარკერი
  const [mobileView, setMobileView] = useState("list"); // list | map

  // replace: ყოველი ჩიპი ისტორიაში ცალკე ნაბიჯად არ ჩაიწეროს
  const updateFilters = (patch) => setParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  const resetFilters = () => setParams({}, { replace: true });
  const toggleView = () => setMobileView((v) => (v === "list" ? "map" : "list"));

  function renderList() {
    if (isLoading) return <Loader />;
    if (isError) return <Alert variant="error">{t("home.loadError")}</Alert>;
    if (!trails.length) return <p className={styles.empty}>{t("home.empty")}</p>;
    if (!visible.length) {
      return (
        <div className={styles.empty}>
          <p>{t("home.noResults")}</p>
          <Button variant="outline" onClick={resetFilters}>
            {t("home.reset")}
          </Button>
        </div>
      );
    }
    return (
      <ul className={styles.cards}>
        {visible.map((trail) => (
          <li key={trail.id}>
            <TrailCard trail={trail} active={trail.id === hoveredId} onHover={setHoveredId} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.page} data-view={mobileView}>
      <title>GPS Tracks</title>

      <div className={styles.activity}>
        <ActivityBar
          value={filters.activity}
          // სხვა აქტივობას სხვა სირთულეები აქვს: არჩეული სირთულე იშლება
          onChange={(activity) => updateFilters({ activity, difficulty: [] })}
          counts={activityCounts}
        />
      </div>

      <aside className={styles.sidebar} aria-label={t("home.list")}>
        <TrailFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
        {!isLoading && !isError && trails.length > 0 && (
          <p className={styles.count}>{t("home.results", { count: visible.length })}</p>
        )}
        {renderList()}
      </aside>

      <section className={styles.mapPanel} aria-label={t("home.map")}>
        <TrailsMap
          trails={visible}
          activeId={hoveredId}
          onHover={setHoveredId}
          visible={mobileView === "map"}
          municipalities={filters.municipalities}
          fitToTrails={filtered}
        />
      </section>

      <button type="button" className={styles.viewToggle} onClick={toggleView}>
        {mobileView === "list" ? (
          <>
            <MapIcon size={18} /> {t("home.showMap")}
          </>
        ) : (
          <>
            <List size={18} /> {t("home.showList")}
          </>
        )}
      </button>
    </div>
  );
}