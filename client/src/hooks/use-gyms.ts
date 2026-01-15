import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGyms() {
  return useQuery({
    queryKey: [api.gyms.list.path],
    queryFn: async () => {
      const res = await fetch(api.gyms.list.path);
      if (!res.ok) throw new Error("Failed to fetch gyms");
      return api.gyms.list.responses[200].parse(await res.json());
    },
  });
}
