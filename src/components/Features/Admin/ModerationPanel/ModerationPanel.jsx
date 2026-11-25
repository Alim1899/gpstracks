import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2, X } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/UI/Index";
import { MAX_REJECT_REASON } from "@/components/Services/adminService";
import { useDeleteTrail, useModerate } from "@/hooks/useAdmin";
import styles from "./ModerationPanel.module.css";

/**
 * მოდერაციის ღილაკები: ადმინის სიაში და ბილიკის გვერდზე
 * pending → დადასტურება / უარყოფა; published → გაუქმება (მიზეზით); rejected → დადასტურება / წაშლა
 * onDeleted: წაშლის შემდეგ (მაგ. ბილიკის გვერდიდან ადმინის გვერდზე გადასვლა)
 */
export function ModerationPanel({ trail, onDeleted, compact = false }) {
  const { t } = useTranslation();
  const moderate = useModerate();
  const remove = useDeleteTrail();
  const [mode, setMode] = useState(null); // null | "reject" | "delete"
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const busy = moderate.isPending || remove.isPending;
  const { status } = trail;

  function close() {
    setMode(null);
    setReason("");
    setReasonError(false);
  }

  function submitReject(e) {
    e.preventDefault();
    if (!reason.trim()) return setReasonError(true);
    moderate.mutate({ id: trail.id, status: "rejected", reason }, { onSuccess: close });
  }

  return (
    <section className={`${styles.panel} ${compact ? styles.compact : ""}`} aria-label={t("admin.moderation")}>
      {!compact && (
        <p className={styles.head}>
          {t("admin.moderation")}: <span className={styles.status} data-status={status}>{t(`admin.status.${status}`)}</span>
        </p>
      )}

      {status === "rejected" && trail.rejectReason && (
        <p className={styles.reason}>{t("admin.reason", { reason: trail.rejectReason })}</p>
      )}

      {mode === "reject" ? (
        <form className={styles.form} onSubmit={submitReject}>
          <Textarea
            label={t("admin.rejectReason")}
            hint={t("admin.rejectReasonHint")}
            error={reasonError ? t("admin.rejectReasonRequired") : undefined}
            value={reason}
            maxLength={MAX_REJECT_REASON}
            rows={3}
            autoFocus
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(false);
            }}
          />
          <div className={styles.actions}>
            <Button variant="outline" onClick={close} disabled={busy}>{t("admin.cancel")}</Button>
            <Button type="submit" className={styles.danger} loading={moderate.isPending}>
              {status === "published" ? t("admin.unpublish") : t("admin.reject")}
            </Button>
          </div>
        </form>
      ) : mode === "delete" ? (
        <div className={styles.form}>
          <p className={styles.confirm}>{t("admin.confirmDelete")}</p>
          <div className={styles.actions}>
            <Button variant="outline" onClick={close} disabled={busy}>{t("admin.cancel")}</Button>
            <Button
              className={styles.danger}
              loading={remove.isPending}
              onClick={() => remove.mutate(trail.id, { onSuccess: () => onDeleted?.() })}
            >
              {t("admin.confirmDeleteButton")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          {status !== "published" && (
            <Button
              loading={moderate.isPending}
              disabled={busy}
              onClick={() => moderate.mutate({ id: trail.id, status: "published" })}
            >
              <Check size={16} /> {t("admin.approve")}
            </Button>
          )}
          {status !== "rejected" && (
            <Button variant="outline" disabled={busy} onClick={() => setMode("reject")}>
              <X size={16} /> {status === "published" ? t("admin.unpublish") : t("admin.reject")}
            </Button>
          )}
          {status === "rejected" && (
            <Button variant="outline" className={styles.dangerOutline} disabled={busy} onClick={() => setMode("delete")}>
              <Trash2 size={16} /> {t("admin.delete")}
            </Button>
          )}
        </div>
      )}

      {(moderate.isError || remove.isError) && <Alert variant="error">{t("admin.actionError")}</Alert>}
    </section>
  );
}