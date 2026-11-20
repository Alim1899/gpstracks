import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { simplify, encodeTrack, getBounds } from "@/components/Utils/geometry";
import { estimateHours, getDifficultyLevel } from "@/components/Utils/trailOptions";
import { getAdminRegions, OCCUPIED } from "@/components/Utils/regions";

// Firestore-ის დოკუმენტი მაქს. 1 MB-ია; ტრეკი ამაზე ბევრად ნაკლები უნდა იყოს
const MAX_TRACK_CHARS = 700_000;
const SIMPLIFY_TOLERANCES = [5, 10, 20]; // მ: თუ ტრეკი დიდია, უფრო მეტად ვამარტივებთ

const round = (n, digits = 0) => (n == null ? null : Math.round(n * 10 ** digits) / 10 ** digits);

function encodeForStorage(coords) {
  for (const tolerance of SIMPLIFY_TOLERANCES) {
    const simplified = simplify(coords, tolerance);
    const encoded = encodeTrack(simplified);
    if (encoded.path.length + (encoded.elevations?.length ?? 0) <= MAX_TRACK_CHARS) {
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
  const { coords, stats } = track;
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
    estimatedHours: round(estimateHours(input.activity, stats.distanceKm, stats.gain), 2),
    authorHours: round(stats.recorded?.totalHours, 2),
    movingHours: round(stats.recorded?.movingHours, 2),

    start: new GeoPoint(startLat, startLng),
    end: new GeoPoint(endLat, endLng),
    bounds: getBounds(coords),

    authorId: user.uid,
    authorName: user.displayName ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const trackDoc = { authorId: user.uid, ...encodeForStorage(coords) };

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