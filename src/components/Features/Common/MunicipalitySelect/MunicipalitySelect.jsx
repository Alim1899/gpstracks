import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import { ADMIN_REGIONS, MIN_SEARCH_LENGTH, OCCUPIED, searchMunicipalities } from "@/components/Utils/regions";
import inputStyles from "@/components/UI/Input/Input.module.css";
import styles from "./MunicipalitySelect.module.css";

const MAX_RESULTS = 8;

/**
 * მუნიციპალიტეტების არჩევა (რამდენიმე არჩევანი).
 * ცარიელ ველზე: მთელი სია, მხარეების მიხედვით დაჯგუფებული.
 * აკრეფისას: ძებნა ყველა ენაზე ერთდროულად ("ქა" და "ka" ორივე ქარელს პოულობს).
 * value: ["sachkhere", ...]   onChange: იღებს ახალ მასივს
 */
export function MunicipalitySelect({ label, value = [], onChange, onBlur, name, error, hint, inline = false  }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const listId = `${id}-list`;
  const messageId = `${id}-message`;
  const optionId = (municipalityId) => `${id}-${municipalityId}`;

  const [query, setQuery] = useState("");
const [isOpen, setOpen] = useState(false);
  const open = inline || isOpen;
  const [activeIndex, setActiveIndex] = useState(0);

  const browsing = query.trim().length === 0;
  const tooShort = !browsing && query.trim().length < MIN_SEARCH_LENGTH;

  // ყველა ენის სახელები ძებნისთვის (თარგმანის ფაილებიდან)
  const labels = useMemo(
    () =>
      Object.fromEntries(
        LANGUAGES.map(({ code }) => [code, i18n.getResourceBundle(code, "translation")?.municipalities ?? {}])
      ),
    [i18n]
  );

  // სიის რეჟიმი: მხარეები, შიგნით მუნიციპალიტეტები ანბანით (უკვე არჩეულების გარეშე)
  const groups = useMemo(() => {
    if (!browsing) return [];
    const collator = new Intl.Collator(i18n.resolvedLanguage);
    return ADMIN_REGIONS.map((region) => ({
      region: region.id,
      items: region.municipalities
        .filter((m) => !value.includes(m))
        .map((m) => ({ id: m, region: region.id, occupied: OCCUPIED.has(m) }))
        .sort((a, b) => collator.compare(t(`municipalities.${a.id}`), t(`municipalities.${b.id}`))),
    })).filter((group) => group.items.length > 0);
  }, [browsing, value, i18n.resolvedLanguage, t]);

  const results = useMemo(
    () => (browsing ? [] : searchMunicipalities(query, labels).filter((m) => !value.includes(m.id)).slice(0, MAX_RESULTS)),
    [browsing, query, labels, value]
  );

  // კლავიატურით სანავიგაციო ბრტყელი სია (ორივე რეჟიმში)
  const options = browsing ? groups.flatMap((g) => g.items) : results;
  const active = open ? options[activeIndex] : undefined;

  // კლავიატურით მოძრაობისას აქტიური ელემენტი ხილვად არეში დარჩეს
  const activeId = active?.id;
  useEffect(() => {
    if (activeId) document.getElementById(`${id}-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [id, activeId]);

  function select(municipality) {
    onChange([...value, municipality.id]);
    setQuery("");
    setActiveIndex(0);
  }

  const remove = (municipalityId) => onChange(value.filter((v) => v !== municipalityId));

  function handleKeyDown(e) {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault(); // ფორმა არ გაიგზავნოს
      if (active) select(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length) {
      remove(value.at(-1)); // ცარიელ ველში Backspace ბოლო არჩეულს შლის
    }
  }

  function renderOption(m, index, showRegion) {
    return (
      <li
        key={m.id}
        id={optionId(m.id)}
        role="option"
        aria-selected={index === activeIndex}
        className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
        onMouseDown={(e) => e.preventDefault()} // ველს ფოკუსი არ დაეკარგოს
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => select(m)}
      >
        <span>{t(`municipalities.${m.id}`)}</span>
        <span className={styles.region}>
          {showRegion && t(`adminRegions.${m.region}`)}
          {m.occupied && <span className={styles.occupied}>{t("form.occupied")}</span>}
        </span>
      </li>
    );
  }

  let flatIndex = 0; // დაჯგუფებულ სიაში თითოეული ელემენტის ინდექსი ბრტყელ სიაში

  return (
        <div className={`${inputStyles.field} ${inline ? styles.inline : ""}`}>
      {label && <label htmlFor={id} className={inputStyles.label}>{label}</label>}

      {value.length > 0 && (
        <ul className={styles.selected}>
          {value.map((municipalityId) => {
            const municipalityName = t(`municipalities.${municipalityId}`);
            return (
              <li key={municipalityId} className={styles.tag}>
                {municipalityName}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => remove(municipalityId)}
                  aria-label={t("form.remove", { name: municipalityName })}
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
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active ? optionId(active.id) : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={error || hint ? messageId : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onBlur={() => {
              setOpen(false);
              onBlur?.();
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {open && (
          <ul id={listId} role="listbox" className={styles.list}>
            {browsing ? (
              groups.map((group) => (
                <li key={group.region} role="presentation">
                  <div id={`${id}-group-${group.region}`} className={styles.groupLabel}>
                    {t(`adminRegions.${group.region}`)}
                  </div>
                  <ul role="group" aria-labelledby={`${id}-group-${group.region}`} className={styles.groupList}>
                    {group.items.map((m) => renderOption(m, flatIndex++, false))}
                  </ul>
                </li>
              ))
            ) : tooShort ? (
              <li className={styles.message}>{t("form.typeMore")}</li>
            ) : results.length === 0 ? (
              <li className={styles.message}>{t("form.noResults")}</li>
            ) : (
              results.map((m, index) => renderOption(m, index, true))
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