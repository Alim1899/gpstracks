import { useQuery } from "@tanstack/react-query";
import { fetchTrails } from "../services/trailService";

export function useTrails(region) {
  return useQuery({
    queryKey: ["trails", region ?? "all"],
    queryFn: () => fetchTrails(region),
  });
}