import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/Context/useAuth";
import {
  checkIsAdmin,
  deleteTrail,
  fetchStatusCounts,
  fetchTrailsByStatus,
  moderateTrail,
} from "@/components/Services/adminService";

// { isAdmin, loading } — ერთხელ მოწმდება ყოველ მომხმარებელზე
export function useIsAdmin() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const q = useQuery({
    queryKey: ["isAdmin", uid],
    queryFn: () => checkIsAdmin(uid),
    enabled: Boolean(uid),
    staleTime: Infinity,
  });
  return { isAdmin: q.data === true, loading: loading || (Boolean(uid) && q.isLoading) };
}

export function useModerationTrails(status) {
  return useQuery({ queryKey: ["admin", "trails", status], queryFn: () => fetchTrailsByStatus(status) });
}

export function useStatusCounts() {
  return useQuery({ queryKey: ["admin", "counts"], queryFn: fetchStatusCounts });
}

// ცვლილების შემდეგ: ადმინის სიები, მთავარი გვერდის სია და ბილიკის გვერდი ახლდება
function useRefresh() {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["trails"] });
    queryClient.invalidateQueries({ queryKey: ["trail", id] });
  };
}

export function useModerate() {
  const { user } = useAuth();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, status, reason = "" }) => moderateTrail(id, { status, reason, adminId: user.uid }),
    onSuccess: (_, { id }) => refresh(id),
  });
}

export function useDeleteTrail() {
  const queryClient = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: deleteTrail,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["trailTrack", id] });
      refresh(id);
    },
  });
}