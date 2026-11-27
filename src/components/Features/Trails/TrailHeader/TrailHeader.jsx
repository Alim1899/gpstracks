import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Car,
  Check,
  Download,
  Footprints,
  Mountain,
  Share2,
} from "lucide-react";
import { Button } from "@/components/UI/Index";
import { localized } from "@/components/Utils/localized";
import styles from "./TrailHeader.module.css";
import { authorLabel } from "@/components/Utils/author";

const ACTIVITY_ICONS = {
  hiking: Footprints,
  running: Activity,
  mountaineering: Mountain,
  offroad: Car,
};

// "12 ივლ 2026" — თვე ჩვენი თარგმანიდან: Intl ქართულ თვეებს ყველა ბრაუზერში ვერ აჩვენებს
// (მაგ. Android-ის Chrome-ში "2026 M07 12" გამოდის)
const formatDate = (date, t) =>
  `${date.getDate()} ${t(`months.${date.getMonth() + 1}`)} ${date.getFullYear()}`;

export function TrailHeader({ trail, onDownload, downloadDisabled }) {
  const { t, i18n } = useTranslation();
  const notPublished = trail.status !== "published";
  const lang = i18n.resolvedLanguage;
  const title = localized(trail.title, lang);
  const [copied, setCopied] = useState(false);

  const ActivityIcon = ACTIVITY_ICONS[trail.activity];
  const created = trail.createdAt?.toDate?.();

  async function share() {
    const url = window.location.href;
    // მობილურზე: ტელეფონის გაზიარების მენიუ; კომპიუტერზე: ბმულის კოპირება
    if (navigator.share) {
      try {
        await navigator.share({ title: title.text, url });
      } catch {
        // მომხმარებელმა გააუქმა — შეცდომა არ არის
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const author = authorLabel(trail, t);
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title} lang={title.lang ?? undefined}>
          {title.text}
        </h1>
        {/* ამ ენაზე ტექსტი AI-მ თარგმნა (ავტორმა შეიძლება შეასწორა) */}
        {trail.aiLangs?.includes(title.lang) && (
          <span
            className={styles.langBadge}
            title={t("trailPage.aiTranslatedHint")}
          >
            {t("trailPage.aiTranslated")}
          </span>
        )}
        {title.lang && title.lang !== lang && (
          <span className={styles.langBadge}>
            {t("trailPage.onlyIn", {
              language: t(`trailPage.inLanguage.${title.lang}`),
            })}
          </span>
        )}
      </div>

      <ul className={styles.tags}>
        <li className={styles.activity}>
          {ActivityIcon && <ActivityIcon size={16} />}
          {t(`activities.${trail.activity}`)}
        </li>
        <li className={styles.difficulty} data-level={trail.difficultyLevel}>
          {t(`difficulty.${trail.difficulty}`)}
        </li>
        {trail.historicalRegions?.map((h) => (
          <li key={h}>{t(`historicalRegions.${h}`)}</li>
        ))}
        {trail.municipalities?.map((m) => (
          <li key={m}>{t(`municipalities.${m}`)}</li>
        ))}
      </ul>

      <div className={styles.bottomRow}>
        <p className={styles.meta}>
          {author && t("trailPage.by", { name: author })}
          {author && created && " · "}
          {created && formatDate(created, t)}
        </p>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={onDownload}
            disabled={downloadDisabled || notPublished}
            title={
              notPublished ? t("trailPage.downloadNotPublished") : undefined
            }
          >
            <Download size={18} />
            {t("trailPage.downloadGpx")}
          </Button>
          <Button
            variant="outline"
            onClick={share}
            disabled={notPublished}
            title={notPublished ? t("trailPage.shareNotPublished") : undefined}
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? t("trailPage.copied") : t("trailPage.share")}
          </Button>
        </div>
      </div>
    </header>
  );
}
