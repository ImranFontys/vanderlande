"use client";

import { useMemo } from "react";

type UseEtaOptions = {
  currentStatus: number;
  etaMap: Record<number, number>;
  locale: string;
  noWaitText: string;
  waitMessage: (minutes: number) => string;
  tips: { done: string; busy: string; soon: string };
};

export function useEta({
  currentStatus,
  etaMap,
  locale,
  noWaitText,
  waitMessage,
  tips,
}: UseEtaOptions) {
  return useMemo(() => {
    const etaMinutes = etaMap[currentStatus] ?? 0;
    const etaTime = new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const etaTip =
      etaMinutes === 0 ? tips.done : etaMinutes > 20 ? tips.busy : tips.soon;
    const etaStatus = etaMinutes === 0 ? noWaitText : waitMessage(etaMinutes);

    return { etaMinutes, etaTime, etaTip, etaStatus };
  }, [currentStatus, etaMap, locale, noWaitText, waitMessage, tips]);
}
