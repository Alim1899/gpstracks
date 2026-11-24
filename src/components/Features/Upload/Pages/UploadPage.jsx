import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { CircleCheck } from "lucide-react";
import { useAuth } from "@/Context/useAuth";
import { useWaypointEditor } from "@/hooks/useWaypointEditor";
import { parseTrackFile } from "@/components/Utils/trackParser";
import { detectRouteType } from "@/components/Utils/geometry";
import { estimateHours } from "@/components/Utils/trailOptions";
import {
  firstIncompleteWaypoint,
  normalizeWaypoint,
} from "@/components/Utils/waypoints";
import {
  detectMunicipalities,
  loadMunicipalities,
} from "@/components/Utils/municipalityDetect";
import {
  buildTrailDocs,
  createTrail,
  saveOriginalFile,
  newTrailId,
} from "@/components/Services/trailService";
import { Alert, Button } from "@/components/UI/Index";
import { TrackMap } from "@/components/Features/Trails/TrackMap/TrackMap";
import { TrackStats } from "@/components/Features/Trails/TrackStats/TrackStats";
import { FileDropzone } from "../FileDropzone/FileDropzone";
import { TrailForm } from "../TrailForm/TrailForm";
import { WaypointEditor } from "../WaypointEditor/WaypointEditor";
import styles from "./UploadPage.module.css";

export function UploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [track, setTrack] = useState(null); // { file, fileName, coords, stats, waypoints, meta, routeType, municipalities }
  const [error, setError] = useState(null); // თარგმანის გასაღები
  const [parsing, setParsing] = useState(false);
  const [activity, setActivity] = useState("");
  const [savedId, setSavedId] = useState(null);
  const wp = useWaypointEditor(); // წერტილები: ფაილიდან + ავტორის დამატებული
  const [langs, setLangs] = useState([]); // ფორმაში არჩეული ენები: წერტილის სახელიც ამ ენებზე
  async function handleFile(file) {
    setError(null);
    setParsing(true);
    try {
      const result = await parseTrackFile(file);
      setTrack({
        file,
        fileName: file.name,
        ...result,
        routeType: detectRouteType(result.coords, result.stats.distanceKm),
        municipalities: await detectMunicipalitiesSafe(result.coords),
      });
      wp.reset(result.waypoints.map(normalizeWaypoint));
    } catch (err) {
      setError(
        err.message?.startsWith("upload.")
          ? err.message
          : "upload.errors.unknown",
      );
    } finally {
      setParsing(false);
    }
  }

  // საზღვრების ფაილი ვერ ჩაიტვირთა → ცარიელი სია; ავტორი ხელით აირჩევს, ატვირთვა არ ჩერდება
  async function detectMunicipalitiesSafe(coords) {
    try {
      return detectMunicipalities(coords, await loadMunicipalities());
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function reset() {
    setTrack(null);
    setActivity("");
    setSavedId(null);
    wp.reset();
  }

  // სავარაუდო დრო არჩეული აქტივობის მიხედვით (ლაშქრობა, სირბილი...)
  const stats = useMemo(() => {
    if (!track) return null;
    if (!activity) return track.stats;
    const { distanceKm, gain } = track.stats;
    return {
      ...track.stats,
      durationHours: estimateHours(activity, distanceKm, gain),
    };
  }, [track, activity]);

  async function handleSave(input) {
    // სახელიან წერტილს ბილიკის ყველა ენაზე უნდა ჰქონდეს სახელი: პირველ არასრულს რუკაზე ვხსნით
    const incomplete = firstIncompleteWaypoint(wp.saved, input.langs);
    if (incomplete >= 0) {
      wp.select(incomplete);
      throw new Error("waypoints.incomplete");
    }
    const id = newTrailId();
    // ჯერ ორიგინალი: თუ ვერ შეინახა, ბილიკი მაინც ინახება hasOriginal: false-ით
    const hasOriginal = await saveOriginalFile(id, track.file, user);
    const { trail, trackDoc } = buildTrailDocs(
      input,
      { ...track, waypoints: wp.saved },
      user,
    );
    await createTrail(id, { trail: { ...trail, hasOriginal }, trackDoc });
    setSavedId(id);
    window.scrollTo({ top: 0 });
  }

  if (savedId) {
    return (
      <div className={styles.success}>
        <CircleCheck
          size={56}
          strokeWidth={1.5}
          className={styles.successIcon}
        />
        <h1 className={styles.title}>{t("trailForm.successTitle")}</h1>
        <p className={styles.successText}>{t("trailForm.successText")}</p>
        <div className={styles.successActions}>
          <Link to={`/trails/${savedId}`} className={styles.viewLink}>
            {t("trailForm.viewTrail")}
          </Link>
          <Button variant="outline" onClick={reset}>
            {t("trailForm.uploadAnother")}
          </Button>
          <Link to="/" className={styles.homeLink}>
            {t("trailForm.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${track ? styles.withTrack : ""}`}>
      <h1 className={styles.title}>{t("upload.title")}</h1>

      {!track ? (
        <div className={styles.dropzone}>
          <Alert variant="error">{error && t(error)}</Alert>
          <FileDropzone onFile={handleFile} disabled={parsing} />
        </div>
      ) : (
        <div className={styles.layout}>
          <aside className={styles.preview}>
            <div className={styles.fileRow}>
              <span>{track.fileName}</span>
              <Button variant="link" onClick={reset}>
                {t("common.change")}
              </Button>
            </div>

            <TrackMap
              coords={track.coords}
              stats={stats}
              showLocate
              editor={wp}
              waypointLangs={langs}
            />
            <TrackStats stats={stats} />
            <WaypointEditor
              waypoints={wp.waypoints}
              langs={langs}
              selected={wp.selected}
              onSelect={wp.select}
              onDelete={wp.remove}
              onUpdate={wp.update}
            />
          </aside>

          <div className={styles.formColumn}>
            {/* key: ახალ ფაილზე ფორმა თავიდან იწყება */}
            <TrailForm
              key={track.fileName + track.coords.length}
              routeType={track.routeType}
              municipalities={track.municipalities}
              onSubmit={handleSave}
              onActivityChange={setActivity}
              onLangsChange={setLangs}
            />
          </div>
        </div>
      )}
    </div>
  );
}
