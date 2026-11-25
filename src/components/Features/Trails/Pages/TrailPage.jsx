import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useIsAdmin } from "@/hooks/useAdmin";
import { ModerationPanel } from "../../Admin/ModerationPanel/ModerationPanel";
import {
  buildProfile,
  slopeSegments,
  waypointsOnTrack,
} from "@/components/Utils/profile";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { Alert, Button, Loader } from "@/components/UI/Index";
import { localized } from "@/components/Utils/localized";
import { downloadGpx } from "@/components/Utils/gpxExport";
import {
  firstIncompleteWaypoint,
  waypointName,
} from "@/components/Utils/waypoints";
import { NotFoundPage } from "@/components/Features/Common/Pages/NotFoundPage";
import { WaypointEditor } from "@/components/Features/Upload/WaypointEditor/WaypointEditor";
import { useSaveWaypoints, useTrail, useTrailTrack } from "@/hooks/useTrails";
import { useWaypointEditor } from "@/hooks/useWaypointEditor";
import { TrackMap } from "../TrackMap/TrackMap";
import { TrackStats } from "../TrackStats/TrackStats";
import { ElevationProfile } from "../ElevationProfile/ElevationProfile";
import { TrailHeader } from "../TrailHeader/TrailHeader";
import { TrailWarnings } from "../TrailWarnings/TrailWarnings";
import { TrailDetails } from "../TrailDetails/TrailDetails";
import { WaypointList } from "../WaypointList/WaypointList";
import styles from "./TrailPage.module.css";

// ბაზის ველები → TrackStats-ის ფორმატი
function toStats(trail) {
  return {
    distanceKm: trail.distanceKm,
    gain: trail.gain,
    loss: trail.loss,
    maxEle: trail.maxEle,
    durationHours: trail.estimatedHours,
    recorded:
      trail.authorHours > 0
        ? { totalHours: trail.authorHours, movingHours: trail.movingHours }
        : null,
  };
}

export function TrailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const trailQuery = useTrail(id);
  const trackQuery = useTrailTrack(id);
  const coords = trackQuery.data?.coords;
  const waypoints = trackQuery.data?.waypoints;

  const [showSlope, setShowSlope] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);

  // წერტილების რედაქტირება (მხოლოდ ავტორი): ასლზე ვმუშაობთ, ბაზაში „შენახვისას“ იწერება
  const [editing, setEditing] = useState(false);
  const editor = useWaypointEditor();
  const saveWaypoints = useSaveWaypoints(id);
  const [showIncomplete, setShowIncomplete] = useState(false); // „შენახვა“ არასრული სახელებით

  function startEditing() {
    editor.reset(waypoints ?? []);
    setSelectedWaypoint(null);
    saveWaypoints.reset();
    setShowIncomplete(false);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    editor.reset();
  }

  // სახელიან წერტილს ბილიკის ყველა ენაზე უნდა ჰქონდეს სახელი (ენის დამატების შემდეგაც)
  function save(langs) {
    const incomplete = firstIncompleteWaypoint(editor.saved, langs);
    if (incomplete >= 0) {
      editor.select(incomplete);
      setShowIncomplete(true);
      return;
    }
    saveWaypoints.mutate(editor.saved, { onSuccess: () => setEditing(false) });
  }

  // პროფილი და დახრილობის მონაკვეთები — ერთხელ, ტრეკის ჩატვირთვისას
  const profile = useMemo(
    () => (coords ? buildProfile(coords) : null),
    [coords],
  );
  const segments = useMemo(
    () => (profile ? slopeSegments(profile) : []),
    [profile],
  );

  // რედაქტირებისას პროფილზეც ახალი წერტილები ჩანს
  const profileWaypoints = editing ? editor.waypoints : waypoints;
  const waypointsOnProfile = useMemo(
    () =>
      coords && profileWaypoints
        ? waypointsOnTrack(coords, profileWaypoints)
        : [],
    [coords, profileWaypoints],
  );
  if (trailQuery.isLoading) return <Loader fullPage />;
  if (trailQuery.isError) {
    return (
      <div className={styles.page}>
        <Alert variant="error">{t("trailPage.loadError")}</Alert>
      </div>
    );
  }

  const trail = trailQuery.data;
  if (!trail) return <NotFoundPage />; // არ არსებობს ან სხვისი გამოუქვეყნებელია

  const lang = i18n.resolvedLanguage;
  const title = localized(trail.title, lang).text;
  const stats = toStats(trail);
  const isOwner = user?.uid === trail.authorId;
  const langs = trail.langs ?? [];

  return (
    <div className={styles.page}>
      <title>{`${title} — GPS Tracks`}</title>

      <TrailHeader
        trail={trail}
        downloadDisabled={!coords}
        onDownload={() =>
          downloadGpx({
            name: title,
            coords,
            // GPX-ში სახელი ერთ ენაზე: საიტის მიმდინარე ენით
            waypoints: waypoints?.map((w) => ({
              ...w,
              name: waypointName(w, lang).text,
            })),
          })
        }
      />

      <div className={styles.layout}>
        <div className={styles.mapBox}>
          {coords ? (
            <TrackMap
              coords={coords}
              stats={stats}
              segments={showSlope ? segments : undefined}
              hoverIndex={hoverIndex}
              peakIndex={profile?.hasEle ? profile.peakIndex : undefined}
              showLocate
              waypoints={waypoints}
              selectedWaypoint={selectedWaypoint}
              onSelectWaypoint={setSelectedWaypoint}
              editor={editing ? editor : undefined}
              waypointLangs={langs}
            />
          ) : trackQuery.isError ? (
            <Alert variant="error">{t("trailPage.trackError")}</Alert>
          ) : (
            <Loader />
          )}
        </div>

        <aside className={styles.side}>
          {profile?.hasEle && (
            <ElevationProfile
              profile={profile}
              segments={segments}
              showSlope={showSlope}
              onToggleSlope={setShowSlope}
              hoverIndex={hoverIndex}
              onHover={setHoverIndex}
              waypoints={waypointsOnProfile}
              selectedWaypoint={editing ? editor.selected : selectedWaypoint}
              onSelectWaypoint={editing ? editor.select : setSelectedWaypoint}
            />
          )}
          <TrackStats stats={stats} />
          {isAdmin && (
            <ModerationPanel
              trail={trail}
              onDeleted={() =>
                navigate("/admin?status=rejected", { replace: true })
              }
            />
          )}
          <TrailWarnings trail={trail} isOwner={isOwner} />
          <TrailDetails trail={trail} />

          {/* სია და რედაქტორი ერთსა და იმავე ადგილზე: რედაქტირებისას სია რედაქტორით იცვლება */}
          {editing ? (
            <div className={styles.waypointEditing}>
              <WaypointEditor
                waypoints={editor.waypoints}
                langs={langs}
                selected={editor.selected}
                onSelect={editor.select}
                onDelete={editor.remove}
                onUpdate={editor.update}
              />
              <Alert variant="error">
                {saveWaypoints.isError
                  ? t("waypoints.saveError")
                  : showIncomplete &&
                      firstIncompleteWaypoint(editor.saved, langs) >= 0
                    ? t("waypoints.incomplete")
                    : null}
              </Alert>
              <div className={styles.editActions}>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={saveWaypoints.isPending}
                >
                  {t("waypoints.cancel")}
                </Button>
                <Button
                  onClick={() => save(langs)}
                  loading={saveWaypoints.isPending}
                >
                  {t("waypoints.save")}
                </Button>
              </div>
            </div>
          ) : (
            waypoints && (
              <WaypointList
                waypoints={waypoints}
                selected={selectedWaypoint}
                onSelect={setSelectedWaypoint}
                onEdit={isOwner ? startEditing : undefined}
              />
            )
          )}
        </aside>
      </div>
    </div>
  );
}
