import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/UI/Index";
import styles from "./FileDropzone.module.css";
import { useTranslation } from "react-i18next";
export function FileDropzone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onFile(file);
  };
const { t } = useTranslation();
  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <FileUp size={36} />
     <p className={styles.title}>{t("upload.drop")}</p>
<p className={styles.hint}>{t("common.or")}</p>
      <Button variant="outline" onClick={() => inputRef.current?.click()} loading={disabled}>
       {t("upload.choose")}
      </Button>
      {/* accept განზრახ არ არის: Android და iOS GPX-ს ხშირად ნაცრისფრად აჩვენებს. ფორმატს parser ამოწმებს */}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // იგივე ფაილის თავიდან არჩევა რომ იმუშაოს
        }}
      />
    </div>
  );
}