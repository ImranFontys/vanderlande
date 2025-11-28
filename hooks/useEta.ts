"use client";

import { useEffect, useMemo, useState } from "react";

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
  const etaMinutes = etaMap[currentStatus] ?? 0;
  const [etaTime, setEtaTime] = useState("");

  useEffect(() => {
    const nextTime = new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setEtaTime(nextTime);
  }, [etaMinutes, locale]);

  const etaTip = useMemo(
    () => (etaMinutes === 0 ? tips.done : etaMinutes > 20 ? tips.busy : tips.soon),
    [etaMinutes, tips.busy, tips.done, tips.soon]
  );
  const etaStatus = useMemo(
    () => (etaMinutes === 0 ? noWaitText : waitMessage(etaMinutes)),
    [etaMinutes, noWaitText, waitMessage]
  );

  return { etaMinutes, etaTime, etaTip, etaStatus };
}
