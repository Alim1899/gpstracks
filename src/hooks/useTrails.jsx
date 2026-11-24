import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTrail,fetchTrails, fetchTrailTrack, updateTrailWaypoints } from "@/components/Services/trailService";
// ბილიკი და ტრეკი ცალ-ცალკე (პარალელურად): სათაური და სტატისტიკა ტრეკს არ ელოდება
export function useTrail(id) {
  return useQuery({ queryKey: ["trail", id], queryFn: () => fetchTrail(id), enabled: Boolean(id) });
}

export function useTrailTrack(id) {
  return useQuery({ queryKey: ["trailTrack", id], queryFn: () => fetchTrailTrack(id), enabled: Boolean(id) });
}
// წერტილების შენახვა: წარმატების შემდეგ ქეში მაშინვე ახლდება (თავიდან ჩატვირთვის გარეშე)
export function useSaveWaypoints(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (waypoints) => updateTrailWaypoints(id, waypoints),
    onSuccess: (_, waypoints) => {
      queryClient.setQueryData(["trailTrack", id], (old) => old && { ...old, waypoints });
      queryClient.invalidateQueries({ queryKey: ["trail", id] });
    },
  });
}
export function useTrails() {
  return useQuery({ queryKey: ["trails"], queryFn: fetchTrails });
}