import { useQuery } from "@tanstack/react-query";
import { fetchTrails } from "@/components/Services/trailService";
export function useTrails(region) {
  return useQuery({
    queryKey: ["trails"],
    queryFn: () => fetchTrails(region),
  });
}
