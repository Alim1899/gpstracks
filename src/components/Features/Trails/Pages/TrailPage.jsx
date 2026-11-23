import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { Alert, Button, Loader } from "@/components/UI/Index";
import { buildProfile, slopeSegments } from "@/components/Utils/profile";
import { localized } from "@/components/Utils/localized";
import { downloadGpx } from "@/components/Utils/gpxExport";
import { NotFoundPage } from "@/components/Features/Common/Pages/NotFoundPage";
import { TrackMap } from "../TrackMap/TrackMap";
import { TrackStats } from "../TrackStats/TrackStats";
import { ElevationProfile } from "../ElevationProfile/ElevationProfile";
import { TrailHeader } from "../TrailHeader/TrailHeader";
import { TrailWarnings } from "../TrailWarnings/TrailWarnings";
import { TrailDetails } from "../TrailDetails/TrailDetails";
import styles from "./TrailPage.module.css";
import { WaypointList } from "../WaypointList/WaypointList";
import { WaypointEditor } from "@/components/Features/Upload/WaypointEditor/WaypointEditor";
import { useSaveWaypoints, useTrail, useTrailTrack } from "@/hooks/useTrails";
import { useWaypointEditor } from "@/hooks/useWaypointEditor";

// ბაზის ველები → TrackStats-ის ფორმატი
function toStats(trail) {
  return {
    distanceKm: trail.distanceKm,
    gain: trail.gain,
    loss: trail.loss,
    maxEle: trail.maxEle,
    durationHours: trail.estimatedHours,
    recorded:
      trail.authorHours != null
        ? { totalHours: trail.authorHours, movingHours: trail.movingHours }
        : null,
  };
}

export function TrailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
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

  function startEditing() {
    editor.reset(waypoints ?? []);
    setSelectedWaypoint(null);
    saveWaypoints.reset();
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    editor.reset();
  }

  function save() {
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

  const title = localized(trail.title, i18n.resolvedLanguage).text;
  const stats = toStats(trail);
  const isOwner = user?.uid === trail.authorId;

  return (
    <div className={styles.page}>
      <title>{`${title} — GPS Tracks`}</title>

      <TrailHeader
        trail={trail}
        downloadDisabled={!coords}
        onDownload={() => downloadGpx({ name: title, coords, waypoints })}
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
            />
          )}
          <TrackStats stats={stats} />
          <TrailWarnings trail={trail} isOwner={isOwner} />
          <TrailDetails trail={trail} />
          {/* სია და რედაქტორი ერთსა და იმავე ადგილზე: რედაქტირებისას სია რედაქტორით იცვლება */}
          {editing ? (
            <div className={styles.waypointEditing}>
                           <WaypointEditor
                waypoints={editor.waypoints}
                selected={editor.selected}
                onSelect={editor.select}
                onDelete={editor.remove}
              />
              <Alert variant="error">
                {saveWaypoints.isError && t("waypoints.saveError")}
              </Alert>
              <div className={styles.editActions}>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={saveWaypoints.isPending}
                >
                  {t("waypoints.cancel")}
                </Button>
                <Button onClick={save} loading={saveWaypoints.isPending}>
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
