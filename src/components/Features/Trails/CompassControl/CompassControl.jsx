import { useEffect, useRef, useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import styles from "./CompassControl.module.css";

// კუთხე წრის ცენტრიდან მაჩვენებლამდე: 0° = ზემოთ, საათის ისრის მიმართულებით
function pointerAngle(e, el) {
  const r = el.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

export function CompassControl() {
  const map = useMap();
  const ref = useRef(null);
  const drag = useRef(null);
  const [bearing, setBearing] = useState(() => map.getBearing());

  useMapEvent("rotate", () => setBearing(map.getBearing()));

  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
  }, []);

  function onPointerDown(e) {
    e.preventDefault();
    ref.current.setPointerCapture(e.pointerId);
    drag.current = {
      startAngle: pointerAngle(e, ref.current),
      startBearing: map.getBearing(),
      moved: false,
    };
  }

  function onPointerMove(e) {
    if (!drag.current) return;
    const delta = pointerAngle(e, ref.current) - drag.current.startAngle;
    if (Math.abs(delta) > 2) drag.current.moved = true;
    if (drag.current.moved) map.setBearing(drag.current.startBearing + delta);
  }

  function onPointerUp() {
    // უბრალო დაჭერა (გადატრიალების გარეშე) ჩრდილოეთს აბრუნებს
    if (drag.current && !drag.current.moved) map.setBearing(0, { animate: true });
    drag.current = null;
  }

  return (
    <div
      ref={ref}
      className={styles.compass}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-label="რუკის მიმართულება"
      aria-valuenow={Math.round(bearing)}
      aria-valuemin={0}
      aria-valuemax={359}
      title="გადაატრიალე. დაჭერით ჩრდილოეთზე დაბრუნდება"
    >
      <div className={styles.ring} style={{ transform: `rotate(${bearing}deg)` }}>
        <span className={styles.north}>N</span>
        <span className={styles.needle} />
      </div>
    </div>
  );
}