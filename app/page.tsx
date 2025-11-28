"use client";

import { SummaryCard } from "@/components/SummaryCard";
import { TraceProgress } from "@/components/TraceProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEta } from "@/hooks/useEta";
import { getPassengerCopy, type FormError, type Language } from "@/lib/i18n/passenger";
import { mockTrace, statusSteps } from "@/lib/mockData";
import { buildTraceRecord, sanitizeId, type TraceRecord } from "@/lib/utils";
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const STEP_ETA_MAP: Record<number, number> = {
  1: 35,
  2: 30,
  3: 20,
  4: 12,
  5: 5,
  6: 0,
};

const languageNames: Record<Language, string> = {
  nl: "Nederlands",
  en: "English",
};

export default function PassengerPage() {
  const [records, setRecords] = useState<Record<string, TraceRecord>>(() => ({ ...mockTrace }));
  const [bagInput, setBagInput] = useState("bag001");
  const [selectedBagId, setSelectedBagId] = useState("bag001");
  const [errorKey, setErrorKey] = useState<FormError | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trackSectionRef = useRef<HTMLElement | null>(null);
  const { language, setLanguage, languages } = useLanguage();

  const copy = useMemo(() => getPassengerCopy(language), [language]);
  const statusLabels = useMemo(() => copy.statusLabels, [copy]);
  const activeBag = records[selectedBagId] ?? records.bag001;
  const suggestions = useMemo(() => Object.keys(records).slice(0, 4), [records]);
  const localizedSteps = useMemo(
    () => statusSteps.map((step) => ({ ...step, label: statusLabels[step.id] })),
    [statusLabels]
  );
  const { etaTime, etaTip, etaStatus } = useEta({
    currentStatus: activeBag.currentStatus,
    etaMap: STEP_ETA_MAP,
    locale: copy.locale,
    noWaitText: copy.eta.noWait,
    waitMessage: copy.eta.waitMessage,
    tips: copy.eta.tips,
  });
  const lastScanTime = activeBag.history[activeBag.history.length - 1]?.time ?? "-";
  const errorMessage = errorKey ? copy.form.errors[errorKey] : null;
  const summaryItems = useMemo(
    () => [
      { label: copy.summary.status, value: statusLabels[activeBag.currentStatus] },
      { label: copy.summary.lastUpdate, value: lastScanTime },
      { label: copy.summary.id, value: activeBag.id },
      { label: copy.summary.eta, value: etaTime },
    ],
    [activeBag, copy.summary, etaTime, lastScanTime, statusLabels]
  );
  const inputWidthStyle = useMemo(() => {
    const reference = bagInput.trim().length > 0 ? bagInput : copy.form.placeholder;
    const target = Math.min(Math.max(reference.length + 2, 10), 24);
    return { maxWidth: `clamp(10rem, ${target}ch, 24rem)` };
  }, [bagInput, copy.form.placeholder]);

  const handleTrack = () => {
    const sanitized = sanitizeId(bagInput);
    if (!sanitized) {
      setErrorKey("invalidId");
      setToast(copy.form.errors.invalidId);
      return;
    }
    setErrorKey(null);
    if (!records[sanitized]) {
      const generated = buildTraceRecord(sanitized);
      setRecords((prev) => ({ ...prev, [sanitized]: generated }));
    }
    setSelectedBagId(sanitized);
    setToast(`${copy.summary.id} ${sanitized} geladen`);
    setTimeout(() => inputRef.current?.blur(), 100);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleTrack();
  };

  const handleLanguageChange = (next: Language) => {
    if (next !== language) {
      setLanguage(next);
    }
  };

  const handleLanguageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = languages.indexOf(language);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = languages[(currentIndex + 1) % languages.length];
      handleLanguageChange(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (currentIndex - 1 + languages.length) % languages.length;
      handleLanguageChange(languages[nextIndex]);
    }
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus();
  };

  const scrollToTrack = () => {
    trackSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToInput();
  };

  return (
    <main className="page px-4 pt-6 pb-10 md:pt-8 md:pb-12 space-y-8 md:space-y-10 flex flex-col items-center">
      <div className="flex justify-end w-full max-w-3xl">
        <span className="sr-only" id="language-selector-label">
          {copy.languageToggle}
        </span>
        <div
          role="radiogroup"
          aria-labelledby="language-selector-label"
          className="inline-flex rounded-full border border-slate-200 bg-white/80 text-xs font-semibold shadow-inner"
          onKeyDown={handleLanguageKeyDown}
        >
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              className={`px-3 py-1 transition ${language === code ? "bg-slate-900 text-white" : "text-slate-600"}`}
              role="radio"
              aria-checked={language === code}
              aria-label={languageNames[code]}
              onClick={() => handleLanguageChange(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="rounded-full bg-white/85 backdrop-blur px-3 py-2 shadow-md shadow-orange-200/60 border border-slate-100">
          <img
            src="/vanderlande-logo.png"
            alt="Vanderlande logo"
            className="h-14 w-auto sm:h-16 md:h-20 drop-shadow-sm"
            loading="eager"
          />
        </div>
      </div>

      <header className="text-center space-y-3 w-full max-w-2xl leading-relaxed">
        <p className="eyebrow">{copy.hero.eyebrow}</p>
        <h1 className="text-4xl font-semibold text-slate-900">{copy.hero.title}</h1>
        <p className="text-sm text-muted">
          {copy.hero.subtitle}{" "}
          <a href="/operator" className="text-accent font-semibold">
            /operator
          </a>
          {copy.hero.operatorLinkSuffix}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="primary-btn px-5" onClick={scrollToTrack}>
            {copy.ui.ctaTrack}
          </button>
        </div>
      </header>

      <section className="w-full max-w-xl" ref={trackSectionRef}>
        <form className="glass rounded-3xl p-6 track-card space-y-5 shadow-lg shadow-slate-200/60" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="bagInput" className="text-sm font-semibold text-muted text-center">
              {copy.form.label}
            </label>
            <p className="text-xs text-muted text-center">{copy.ui.enterHint}</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <input
                ref={inputRef}
                id="bagInput"
                name="bagId"
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-center focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-[max-width] duration-200 ease-out w-full sm:w-auto"
                style={inputWidthStyle}
                placeholder={copy.form.placeholder}
                value={bagInput}
                onChange={(event) => setBagInput(event.target.value)}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby="bagInputTip bagInputError"
              />
              <button
                type="submit"
                className="primary-btn btn-pop w-full sm:w-auto min-h-[44px] px-6 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-orange-200/60"
                title={copy.form.submit}
              >
                {copy.form.submit}
              </button>
            </div>
            {errorMessage && (
              <span id="bagInputError" className="text-xs text-rose-600" role="alert" aria-live="polite">
                {errorMessage}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted justify-center">
            {suggestions.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip ${id === activeBag.id ? "chip-active" : ""} rounded-full shadow-sm shadow-slate-200/80 px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400`}
                aria-pressed={id === activeBag.id}
                onClick={() => {
                  setSelectedBagId(id);
                  setBagInput(id);
                  setErrorKey(null);
                }}
              >
                {id}
              </button>
            ))}
          </div>
          <p id="bagInputTip" className="text-xs text-muted">
            {copy.form.tip}
          </p>
        </form>
      </section>

      <div className="w-full max-w-3xl">
        <SummaryCard items={summaryItems} helperText={`${etaStatus} ${etaTip}`} className="glow-card track-card">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_0_6px_rgba(16,185,129,0.25)]"
                aria-hidden="true"
              />
              {copy.ui.liveStatus}
            </span>
          </div>
          <TraceProgress current={activeBag.currentStatus} steps={localizedSteps} />
        </SummaryCard>
      </div>

      <div className="sm:hidden fixed bottom-4 right-4 z-20">
        <button
          type="button"
          onClick={scrollToTrack}
          className="rounded-full bg-accent text-white font-semibold px-5 py-3 shadow-md shadow-orange-200/70 hover:-translate-y-0.5 active:translate-y-0 transition-transform"
        >
          {copy.ui.stickyTrack}
        </button>
      </div>

      <footer className="w-full max-w-3xl text-center text-sm text-muted space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="/operator" className="text-accent font-semibold hover:underline">{copy.ui.operatorLink}</a>
          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
          <a href="#bagInput" className="hover:underline">{copy.ui.trackLink}</a>
          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
          <a href="mailto:ops@vanderlande.com" className="hover:underline">{copy.ui.supportLink}</a>
          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
          <a href="mailto:chat@vanderlande.com" className="hover:underline">{copy.ui.liveChatLink}</a>
        </div>
        <p className="text-xs">{copy.ui.footerNote}</p>
      </footer>

      <div aria-live="polite" role="status" className="fixed right-4 top-4 z-30 hidden sm:block">
        {toast && (
          <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-200/70 px-4 py-3 text-sm text-slate-900">
            {toast}
          </div>
        )}
      </div>
      <div aria-live="polite" role="status" className="fixed left-4 right-4 bottom-4 z-30 sm:hidden">
        {toast && (
          <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-200/70 px-4 py-3 text-sm text-slate-900">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}
