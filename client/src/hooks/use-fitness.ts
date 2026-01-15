import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useFitnessPrograms() {
  return useQuery({
    queryKey: [api.fitness.programs.path],
    queryFn: async () => {
      const res = await fetch(api.fitness.programs.path);
      if (!res.ok) throw new Error("Failed to fetch programs");
      return api.fitness.programs.responses[200].parse(await res.json());
    },
  });
}
