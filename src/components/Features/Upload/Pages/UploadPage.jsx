import { useState } from "react";
import { parseTrackFile } from "@/components/Utils/trackParser";
import { Alert, Button } from "@/components/UI/Index";
import { FileDropzone } from "../FileDropzone/FileDropzone";
import { TrackMap } from "@/components/Features/Trails/TrackMap/TrackMap";
import { TrackStats } from "@/components/Features/Trails/TrackStats/TrackStats";
import styles from "./UploadPage.module.css";

export function UploadPage() {
  const [track, setTrack] = useState(null); // { fileName, coords, stats }
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);

  async function handleFile(file) {
    setError(null);
    setParsing(true);
    try {
      const result = await parseTrackFile(file);
      setTrack({ fileName: file.name, ...result });
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>ტრეკის ატვირთვა</h1>

      <Alert variant="error">{error}</Alert>

      {!track ? (
        <FileDropzone onFile={handleFile} disabled={parsing} />
      ) : (
        <>
          <div className={styles.fileRow}>
            <span>{track.fileName}</span>
            <Button variant="link" onClick={() => setTrack(null)}>
              შეცვლა
            </Button>
          </div>

         <TrackMap coords={track.coords} stats={track.stats} showLocate />
          <TrackStats stats={track.stats} />

          {/* შემდეგ ნაბიჯზე: ფორმა */}
        </>
      )}
    </div>
  );
}