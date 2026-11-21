// ფაილი → gzip → base64 (RTDB-ში ტექსტად შესანახად). GPX/KML 5-10-ჯერ იკუმშება
export async function gzipToBase64(file) {
  const stream = file.stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return bytesToBase64(bytes);
}

// უკუპროცესი: base64 → ორიგინალი ტექსტი (ჩამოტვირთვისთვის)
export async function gunzipBase64(base64) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

// ნაწილ-ნაწილ, რომ დიდ ფაილზე String.fromCharCode-მა სტეკი არ გადაავსოს
function bytesToBase64(bytes) {
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}