import { useQuery } from "@tanstack/react-query";
import { fetchTrail, fetchTrailTrack } from "@/components/Services/trailService";

// ბილიკი და ტრეკი ცალ-ცალკე (პარალელურად): სათაური და სტატისტიკა ტრეკს არ ელოდება
export function useTrail(id) {
  return useQuery({ queryKey: ["trail", id], queryFn: () => fetchTrail(id), enabled: Boolean(id) });
}

export function useTrailTrack(id) {
  return useQuery({ queryKey: ["trailTrack", id], queryFn: () => fetchTrailTrack(id), enabled: Boolean(id) });
}