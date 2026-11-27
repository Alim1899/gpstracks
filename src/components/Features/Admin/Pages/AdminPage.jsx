import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ExternalLink, Map as MapIcon, Search, X } from "lucide-react";
import { Alert, Loader } from "@/components/UI/Index";
import { localized } from "@/components/Utils/localized";
import { MODERATION_STATUSES } from "@/components/Services/adminService";
import { useModerationTrails, useStatusCounts } from "@/hooks/useAdmin";
import { useTrailTrack } from "@/hooks/useTrails";
import { TrackMap } from "@/components/Features/Trails/TrackMap/TrackMap";
import { ModerationPanel } from "../ModerationPanel/ModerationPanel";
import styles from "./AdminPage.module.css";

// ძებნა: სათაური (ყველა ენაზე), ავტორი, მუნიციპალიტეტები (ნათარგმნი სახელით) და ID
function matches(trail, q, t) {
  const haystack = [
    ...Object.values(trail.title ?? {}),
    trail.authorName,
    trail.id,
    ...(trail.municipalities ?? []).map((m) => t(`municipalities.${m}`)),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

// არჩეული ბილიკის ტრეკი რუკაზე (ტრეკი მხოლოდ არჩევისას იტვირთება)
function TrailPreview({ trail }) {
  const { t, i18n } = useTranslation();
  const { data: track, isLoading, isError } = useTrailTrack(trail.id);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const title = localized(trail.title, i18n.resolvedLanguage);

  return (
    <div className={styles.preview}>
      <div className={styles.previewHead}>
        <strong lang={title.lang ?? undefined}>{title.text}</strong>
        <Link to={`/trails/${trail.id}`} className={styles.openLink}>
          {t("admin.openTrail")} <ExternalLink size={14} />
        </Link>
      </div>
      <div className={styles.previewMap}>
        {track?.coords ? (
          <TrackMap
            key={trail.id}
            coords={track.coords}
            waypoints={track.waypoints}
            selectedWaypoint={selectedWaypoint}
            onSelectWaypoint={setSelectedWaypoint}
          />
        ) : isError || (!isLoading && !track) ? (
          <Alert variant="error">{t("trailPage.trackError")}</Alert>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}

// მოდერაცია: ტაბები სტატუსებით (URL-ში ?status=), ძებნა, სია და არჩეული ბილიკი რუკაზე
export function AdminPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const status = MODERATION_STATUSES.includes(params.get("status")) ? params.get("status") : "pending";
  const counts = useStatusCounts().data;
  const { data: trails, isLoading, isError } = useModerationTrails(status);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const lang = i18n.resolvedLanguage;
  const dateFormat = new Intl.DateTimeFormat(lang === "ka" ? "ka-GE" : "en-GB", { dateStyle: "medium" });

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (trails && q ? trails.filter((trail) => matches(trail, q, t)) : trails ?? []),
    [trails, q, t],
  );
  // არჩეული სიაში აღარ არის (ძებნა, ტაბი, დადასტურება) → პირველი ჩანს
  const selected = filtered.find((trail) => trail.id === selectedId) ?? filtered[0];

  return (
    <div className={styles.page}>
      <title>{`${t("admin.title")} — GPS Tracks`}</title>
      <h1 className={styles.title}>{t("admin.title")}</h1>

      <div className={styles.tabs} role="tablist">
        {MODERATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={s === status}
            className={`${styles.tab} ${s === status ? styles.activeTab : ""}`}
            onClick={() => setParams(s === "pending" ? {} : { status: s })}
          >
            {t(`admin.tabs.${s}`)}
            {counts && <span className={styles.count}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <div className={styles.search}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t("admin.searchPlaceholder")}
          aria-label={t("admin.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className={styles.clear} onClick={() => setSearch("")} aria-label={t("admin.clearSearch")}>
            <X size={16} />
          </button>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Alert variant="error">{t("admin.loadError")}</Alert>
      ) : trails.length === 0 ? (
        <p className={styles.empty}>{t(`admin.empty.${status}`)}</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>{t("admin.noResults")}</p>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.list}>
            {filtered.map((trail) => {
              const title = localized(trail.title, lang);
              const active = trail.id === selected?.id;
              return (
                <li key={trail.id} className={`${styles.row} ${active ? styles.activeRow : ""}`}>
                  <div className={styles.info}>
                    <Link to={`/trails/${trail.id}`} className={styles.trailTitle} lang={title.lang ?? undefined}>
                      {title.text}
                    </Link>
                    <p className={styles.meta}>
                      {t(`activities.${trail.activity}`)} · {trail.distanceKm?.toFixed(1)} {t("units.km")} ·{" "}
                      {trail.municipalities?.map((m) => t(`municipalities.${m}`)).join(", ")}
                    </p>
                    <p className={styles.meta}>
                      {t("trailPage.by", { name: trail.authorName || "—" })}
                      {trail.createdAt && ` · ${dateFormat.format(trail.createdAt.toDate())}`}
                    </p>
                  </div>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.mapButton}
                      aria-pressed={active}
                      onClick={() => setSelectedId(trail.id)}
                    >
                      <MapIcon size={16} /> {t("admin.showOnMap")}
                    </button>
                    <ModerationPanel trail={trail} compact />
                  </div>
                </li>
              );
            })}
          </ul>

          {selected && <TrailPreview key={selected.id} trail={selected} />}
        </div>
      )}
    </div>
  );
}