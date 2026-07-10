import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../services/api";

export const availabilityKeys = {
  all: ["appointments", "availability"] as const,
  byDateAndService: (date: string, serviceId: string) =>
    [...availabilityKeys.all, date, serviceId] as const,
};

type Options = {
  token: string | null;
  date: string;
  serviceId: string;
  enabled: boolean;
};

export function useAvailabilityQuery({ token, date, serviceId, enabled }: Options) {
  return useQuery({
    queryKey: availabilityKeys.byDateAndService(date, serviceId),
    queryFn: () =>
      apiRequest<string[]>(
        `/appointments/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
        { token: token ?? undefined },
      ),
    enabled: enabled && Boolean(token && serviceId),
  });
}
