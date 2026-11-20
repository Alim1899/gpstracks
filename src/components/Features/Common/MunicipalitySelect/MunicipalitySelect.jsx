import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import { MIN_SEARCH_LENGTH, searchMunicipalities } from "@/components/Utils/regions";
import inputStyles from "@/components/UI/Input/Input.module.css";
import styles from "./MunicipalitySelect.module.css";

const MAX_RESULTS = 8;

/**
 * მუნიციპალიტეტების არჩევა ძებნით (რამდენიმე არჩევანი).
 * value: ["sachkhere", ...]   onChange: იღებს ახალ მასივს
 * ეძებს ყველა ენაზე ერთდროულად: "ქა" და "ka" ორივე ქარელს პოულობს.
 */
export function MunicipalitySelect({ label, value = [], onChange, onBlur, name, error, hint }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const listId = `${id}-list`;
  const messageId = `${id}-message`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // ყველა ენის სახელები ძებნისთვის (თარგმანის ფაილებიდან)
  const labels = useMemo(
    () =>
      Object.fromEntries(
        LANGUAGES.map(({ code }) => [code, i18n.getResourceBundle(code, "translation")?.municipalities ?? {}])
      ),
    [i18n]
  );

  const results = useMemo(
    () => searchMunicipalities(query, labels).filter((m) => !value.includes(m.id)).slice(0, MAX_RESULTS),
    [query, labels, value]
  );

  const showList = open && query.trim().length > 0;
  const tooShort = query.trim().length < MIN_SEARCH_LENGTH;

  function select(municipality) {
    onChange([...value, municipality.id]);
    setQuery("");
    setActiveIndex(0);
  }

  const remove = (municipalityId) => onChange(value.filter((v) => v !== municipalityId));

  function handleKeyDown(e) {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault(); // ფორმა არ გაიგზავნოს
      if (showList && results[activeIndex]) select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length) {
      remove(value.at(-1)); // ცარიელ ველში Backspace ბოლო არჩეულს შლის
    }
  }

  return (
    <div className={inputStyles.field}>
      {label && <label htmlFor={id} className={inputStyles.label}>{label}</label>}

      {value.length > 0 && (
        <ul className={styles.selected}>
          {value.map((municipalityId) => {
            const name = t(`municipalities.${municipalityId}`);
            return (
              <li key={municipalityId} className={styles.tag}>
                {name}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => remove(municipalityId)}
                  aria-label={t("form.remove", { name })}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.combobox}>
        <div className={`${inputStyles.control} ${error ? inputStyles.hasError : ""}`}>
          <input
            id={id}
            name={name}
            className={inputStyles.input}
            role="combobox"
            autoComplete="off"
            placeholder={t("form.searchMunicipality")}
            value={query}
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && results[activeIndex] ? `${id}-${results[activeIndex].id}` : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={error || hint ? messageId : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setOpen(false);
              onBlur?.();
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {showList && (
          <ul id={listId} role="listbox" className={styles.list}>
            {tooShort ? (
              <li className={styles.message}>{t("form.typeMore")}</li>
            ) : results.length === 0 ? (
              <li className={styles.message}>{t("form.noResults")}</li>
            ) : (
              results.map((m, index) => (
                <li
                  key={m.id}
                  id={`${id}-${m.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
                  onMouseDown={(e) => e.preventDefault()} // ველს ფოკუსი არ დაეკარგოს
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(m)}
                >
                  <span>{t(`municipalities.${m.id}`)}</span>
                  <span className={styles.region}>
                    {t(`adminRegions.${m.region}`)}
                    {m.occupied && <span className={styles.occupied}>{t("form.occupied")}</span>}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error ? (
        <p id={messageId} className={inputStyles.error} role="alert">{error}</p>
      ) : hint ? (
        <p id={messageId} className={inputStyles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}