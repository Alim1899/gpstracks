import { waypointPinHtml } from "@/components/Utils/waypoints";

// წერტილის იკონი სიებისთვის (იგივე, რაც რუკაზე)
export function WaypointPin({ type, size = 24 }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", flex: "none" }}
      dangerouslySetInnerHTML={{ __html: waypointPinHtml(type, size) }}
    />
  );
}