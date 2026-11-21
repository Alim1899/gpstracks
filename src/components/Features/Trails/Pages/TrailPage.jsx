import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { Alert, Loader } from "@/components/UI/Index";
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
import { useTrail, useTrailTrack } from "@/hooks/useTrails";

// ბაზის ველები → TrackStats-ის ფორმატი
function toStats(trail) {
  return {
    distanceKm: trail.distanceKm,
    gain: trail.gain,
    loss: trail.loss,
    maxEle: trail.maxEle,
    durationHours: trail.estimatedHours,
    recorded: trail.authorHours != null ? { totalHours: trail.authorHours, movingHours: trail.movingHours } : null,
  };
}

export function TrailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const trailQuery = useTrail(id);
  const trackQuery = useTrailTrack(id);
  const coords = trackQuery.data;

  const [showSlope, setShowSlope] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);

  // პროფილი და დახრილობის მონაკვეთები — ერთხელ, ტრეკის ჩატვირთვისას
  const profile = useMemo(() => (coords ? buildProfile(coords) : null), [coords]);
  const segments = useMemo(() => (profile ? slopeSegments(profile) : []), [profile]);

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

  return (
    <div className={styles.page}>
      <title>{`${title} — GPS Tracks`}</title>

      <TrailHeader
        trail={trail}
        downloadDisabled={!coords}
        onDownload={() => downloadGpx({ name: title, coords })}
      />

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.mapBox}>
            {coords ? (
              <TrackMap
                coords={coords}
                stats={stats}
                segments={showSlope ? segments : undefined}
                hoverIndex={hoverIndex}
                peakIndex={profile?.hasEle ? profile.peakIndex : undefined}
                showLocate
              />
            ) : trackQuery.isError ? (
              <Alert variant="error">{t("trailPage.trackError")}</Alert>
            ) : (
              <Loader />
            )}
          </div>

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
        </div>

        <aside className={styles.side}>
          <TrackStats stats={stats} />
          <TrailWarnings trail={trail} isOwner={user?.uid === trail.authorId} />
          <TrailDetails trail={trail} />
        </aside>
      </div>
    </div>
  );
}