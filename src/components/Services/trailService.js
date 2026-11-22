import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  GeoPoint,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db, rtdb} from "@/firebaseConfig";
import { simplify, encodeTrack, getBounds,decodeTrack } from "@/components/Utils/geometry";
import {
  estimateHours,
  getDifficultyLevel,
} from "@/components/Utils/trailOptions";
import { getAdminRegions, OCCUPIED } from "@/components/Utils/regions";
import { ref, set, serverTimestamp as rtdbTimestamp } from "firebase/database";
import { gzipToBase64 } from "@/components/Utils/compression";
// Firestore-ის დოკუმენტი მაქს. 1 MB-ია; ტრეკი ამაზე ბევრად ნაკლები უნდა იყოს
const MAX_TRACK_CHARS = 700_000;
const SCHEMA_VERSION = 1;
const SIMPLIFY_TOLERANCES = [5, 10, 20]; // მ: თუ ტრეკი დიდია, უფრო მეტად ვამარტივებთ

const round = (n, digits = 0) =>
  n == null ? null : Math.round(n * 10 ** digits) / 10 ** digits;

function encodeForStorage(coords) {
  for (const tolerance of SIMPLIFY_TOLERANCES) {
    const simplified = simplify(coords, tolerance);
    const encoded = encodeTrack(simplified);
    if (
      encoded.path.length + (encoded.elevations?.length ?? 0) <=
      MAX_TRACK_CHARS
    ) {
      return { ...encoded, pointCount: simplified.length };
    }
  }
  throw new Error("upload.errors.trackTooLarge");
}

/**
 * ბაზის ორი დოკუმენტის მომზადება:
 * trail: პატარა, სიისა და ფილტრებისთვის (სტატისტიკა ცალკე რიცხვებად)
 * trackDoc: ტრეკის გეომეტრია, იტვირთება მხოლოდ ბილიკის გვერდზე
 * input: toTrailInput()-ის შედეგი, track: parseTrackFile()-ის შედეგი
 */
export function buildTrailDocs(input, track, user) {
    const { coords, stats, meta, waypoints } = track;
  const [startLng, startLat] = coords[0];
  const [endLng, endLat] = coords.at(-1);

  const trail = {
    ...input,
    difficultyLevel: getDifficultyLevel(input.activity, input.difficulty),
    adminRegions: getAdminRegions(input.municipalities),
    occupied: input.municipalities.some((m) => OCCUPIED.has(m)),

    // სტატისტიკა ორიგინალი ტრეკიდან (გამარტივებამდე), ცალკე ველებად ფილტრისთვის
    distanceKm: round(stats.distanceKm, 2),
    gain: stats.gain,
    loss: stats.loss,
    minEle: stats.minEle,
    maxEle: stats.maxEle,
    estimatedHours: round(
      estimateHours(input.activity, stats.distanceKm, stats.gain),
      2,
    ),
    authorHours: round(stats.recorded?.totalHours, 2),
    movingHours: round(stats.recorded?.movingHours, 2),

    start: new GeoPoint(startLat, startLng),
    end: new GeoPoint(endLat, endLng),
    bounds: getBounds(coords),
    // ავტორის ჩაწერის თარიღი და წყარო ფაილი
    recordedAt: meta.recordedAt ? Timestamp.fromMillis(meta.recordedAt) : null,
    source: {
      fileName: track.fileName.slice(0, 200),
      format: meta.format,
      creator: meta.creator,
      pointCount: meta.pointCount,
      hasTimes: meta.hasTimes,
    },
    hasWaypoints: waypoints.length > 0,

    // მრიცხველები: Firestore orderBy-ში ველის არმქონე დოკუმენტები არ ხვდება
    viewCount: 0,
    downloadCount: 0,
    likeCount: 0,
    ratingCount: 0,
    ratingSum: 0,

    schemaVersion: SCHEMA_VERSION,
    authorId: user.uid,
    authorName: user.displayName ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const trackDoc = { authorId: user.uid, ...encodeForStorage(coords), waypoints };
  return { trail, trackDoc };
}

// ორივე დოკუმენტი ერთად (batch): ან ორივე შეინახება, ან არცერთი
export async function createTrail({ trail, trackDoc }) {
  const trailRef = doc(collection(db, "trails"));
  const batch = writeBatch(db);
  batch.set(trailRef, trail);
  batch.set(doc(db, "trailTracks", trailRef.id), trackDoc);
  await batch.commit();
  return trailRef.id;
}

// მხოლოდ გამოქვეყნებული ბილიკები (Rules სხვას არ დაუშვებს)
export async function fetchTrails() {
  const q = query(collection(db, "trails"), where("status", "==", "published"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ერთი ბილიკი. null: არ არსებობს ან სხვისი გამოუქვეყნებელია (Rules უარს ამბობს)
export async function fetchTrail(id) {
  try {
    const snap = await getDoc(doc(db, "trails", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    if (err.code === "permission-denied") return null;
    throw err;
  }
}

// ბილიკის ტრეკი, გაშიფრული: [lng, lat, ele?][]
export async function fetchTrailTrack(id) {
  const snap = await getDoc(doc(db, "trailTracks", id));
  return snap.exists() ? decodeTrack(snap.data()) : null;
}

const MAX_ORIGINAL_CHARS = 9_000_000; // RTDB-ის ერთი მნიშვნელობის ლიმიტი 10 MB-ია
const ORIGINAL_TIMEOUT_MS = 30_000;

/**
 * ორიგინალი ფაილი RTDB-ში: trackFiles/{id}/meta (პატარა, საჯარო) და /data (ფაილი)
 * ბილიკი უკვე შენახულია, ამიტომ შეცდომა აქ ატვირთვას არ აჩერებს; აბრუნებს true/false
 */
export async function saveOriginalFile(trailId, file, user) {
  try {
    const data = await gzipToBase64(file);
    if (data.length > MAX_ORIGINAL_CHARS) return false;

    const write = set(ref(rtdb, `trackFiles/${trailId}`), {
      meta: {
        authorId: user.uid,
        fileName: file.name.slice(0, 200),
        size: file.size,
        encoding: "gzip-base64",
        createdAt: rtdbTimestamp(),
      },
      data,
    });
    // RTDB-იც კავშირის გარეშე ელოდება; 30 წმ-ის შემდეგ ვაგრძელებთ (ჩაწერა ფონზე გაგრძელდება)
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ORIGINAL_TIMEOUT_MS),
    );
    await Promise.race([write, timeout]);
    return true;
  } catch (err) {
    console.error("Original file not saved:", err);
    return false;
  }
}