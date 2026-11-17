import { useState } from "react";
import { List, Map as MapIcon } from "lucide-react";
import styles from "./HomePage.module.css";

export function HomePage() {
  const [mobileView, setMobileView] = useState("list"); // list | map

  const toggleView = () => setMobileView((v) => (v === "list" ? "map" : "list"));

  return (
    <div className={styles.page}>
      <div className={styles.filters}>ფილტრები (შემდეგ ნაბიჯზე)</div>

      <div className={styles.content} data-view={mobileView}>
        <section className={styles.listPanel} aria-label="ბილიკების სია">
          სია
        </section>
        <section className={styles.mapPanel} aria-label="რუკა">
          რუკა
        </section>
      </div>

      <button className={styles.viewToggle} onClick={toggleView}>
        {mobileView === "list" ? (
          <><MapIcon size={18} /> რუკაზე ნახვა</>
        ) : (
          <><List size={18} /> სიის ნახვა</>
        )}
      </button>
    </div>
  );
}