// ტრეკი → GPX ფაილი (ნავიგატორებისა და აპებისთვის: Garmin, OsmAnd, Wikiloc...)

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export function buildGpx({ name, coords }) {
  const points = coords
    .map(([lng, lat, ele]) => {
      const eleTag = ele != null ? `<ele>${Math.round(ele)}</ele>` : "";
      return `      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}">${eleTag}</trkpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPS Tracks" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(name)}</name></metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}

// ფაილის სახელი: ასოები (ქართულიც), ციფრები და ტირე
const toFileName = (name) =>
  name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "track";

export function downloadGpx({ name, coords }) {
  const blob = new Blob([buildGpx({ name, coords })], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${toFileName(name)}.gpx`;
  link.click();
  URL.revokeObjectURL(url);
}