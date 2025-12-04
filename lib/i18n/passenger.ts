import { statusSteps } from "@/lib/mockData";

type StatusId = (typeof statusSteps)[number]["id"];
type StepDescriptions = Record<StatusId, { title: string; body: string }>;

export const passengerLanguages = ["nl", "en"] as const;
export type Language = (typeof passengerLanguages)[number];
export const defaultLanguage: Language = "nl";

export type FormError = "invalidId";

export type PassengerTranslation = {
  locale: string;
  languageToggle: string;
  hero: { eyebrow: string; title: string; subtitle: string; operatorLinkSuffix: string };
  ui: {
    enterHint: string;
    ctaTrack: string;
    ctaHow: string;
    stickyTrack: string;
    stickyStatus: string;
    liveStatus: string;
    lastScanNote: string;
    lastScanTitle: string;
    footerNote: string;
    operatorLink: string;
    trackLink: string;
    supportLink: string;
    liveChatLink: string;
  };
  form: {
    label: string;
    placeholder: string;
    submit: string;
    tip: string;
    errors: Record<FormError, string>;
  };
  summary: { status: string; lastUpdate: string; id: string; eta: string };
  eta: {
    noWait: string;
    waitMessage: (minutes: number) => string;
    tips: { done: string; busy: string; soon: string };
  };
  route: {
    heading: string;
    shortActive: string;
    shortUpcoming: string;
    detailActive: string;
    detailUpcoming: string;
    lastScanPrefix: string;
    currentTitle: string;
    nextTitle: string;
    overviewTitle: string;
    doneMessage: string;
    toggleShow: string;
    toggleHide: string;
    recentTitle: string;
    tipLabel: string;
  };
  statusLabels: Record<StatusId, string>;
  stepDescriptions: StepDescriptions;
  insights: {
    heading: string;
    subtitle: string;
    tiles: {
      throughput: { title: string; helper: string };
      ontime: { title: string; helper: string };
      hubs: { title: string; helper: string };
      exceptions: { title: string; helper: string };
    };
  };
};

const translations: Record<Language, PassengerTranslation> = {
  nl: {
    locale: "nl-NL",
    languageToggle: "Taal",
    hero: {
      eyebrow: "Passagier",
      title: "Volg je bagage",
      subtitle: "Alleen de belangrijkste informatie voor reizigers. Operators vinden hun dashboard op",
      operatorLinkSuffix: ".",
    },
    ui: {
      enterHint: "Druk op Enter om direct te zoeken.",
      ctaTrack: "Track een bag",
      ctaHow: "Hoe werkt het",
      stickyTrack: "Track bag",
      stickyStatus: "Status",
      liveStatus: "Live status",
      lastScanNote: "Op basis van laatste scan",
      lastScanTitle: "Geschat op basis van laatste scan",
      footerNote: "Responsief ontworpen voor mobiel en desktop. Kies taal bovenin.",
      operatorLink: "Operator",
      trackLink: "Track",
      supportLink: "Support",
      liveChatLink: "Live chat",
    },
    form: {
      label: "Zending-ID",
      placeholder: "bijv. bag001",
      submit: "Bekijk",
      tip: "Tip: nummer niet bij de hand? Kies een voorbeeld-ID om de demo te zien.",
      errors: {
        invalidId: "Voer een geldig ID in",
      },
    },
    summary: {
      status: "Status",
      lastUpdate: "Laatste update",
      id: "ID",
      eta: "ETA",
    },
    eta: {
      noWait: "Geen wachttijd meer.",
      waitMessage: (minutes: number) => `Nog ongeveer ${minutes} min.`,
      tips: {
        done: "Je bagage staat op de band of is al opgehaald.",
        busy: "Door drukte op de sortering kan dit iets langer duren.",
        soon: "Blijf in de buurt van de band, je bagage komt bijna.",
      },
    },
    route: {
      heading: "Route & tips",
      shortActive: "Onderweg",
      shortUpcoming: "Nog niet",
      detailActive: "Je bagage is onderweg naar dit punt.",
      detailUpcoming: "Deze stap volgt zodra het traject zover is.",
      lastScanPrefix: "Laatste scan om",
      currentTitle: "Nu bezig",
      nextTitle: "Hierna",
      overviewTitle: "Route-overzicht",
      doneMessage: "Je bagage is klaar, er zijn geen volgende stappen meer.",
      toggleShow: "Toon details",
      toggleHide: "Verberg details",
      recentTitle: "Laatste scans",
      tipLabel: "Tip",
    },
    statusLabels: {
      1: "Ingecheckt",
      2: "In sorteercentrum",
      3: "Geladen op vliegtuig",
      4: "Aangekomen",
      5: "Op bagageband",
      6: "Opgehaald",
    },
    stepDescriptions: {
      1: {
        title: "Check-in",
        body: "Je bagage is geregistreerd bij de balie. Je ontvangt updates zodra er nieuwe scans zijn.",
      },
      2: {
        title: "Sorteercentrum",
        body: "De koffer beweegt door het automatische systeem. Operators bewaken uitzonderingen.",
      },
      3: {
        title: "Boarding",
        body: "Je bagage staat klaar bij het vliegtuig en wordt geladen.",
      },
      4: {
        title: "Aankomst",
        body: "Het vliegtuig is geland en de bagage gaat richting band.",
      },
      5: {
        title: "Bagageband",
        body: "De koffer verschijnt zo op de band. Houd je boardingpass gereed.",
      },
      6: {
        title: "Afgehaald",
        body: "De bagage is opgehaald. Neem contact op met support als dit niet klopt.",
      },
    },
    insights: {
      heading: "Live bagage-inzichten",
      subtitle: "Zie hoe druk de sorteersystemen zijn en of koffers op tijd door het proces gaan.",
      tiles: {
        throughput: { title: "Doorvoer per uur", helper: "Aantal gescande bags per tijdslot" },
        ontime: { title: "Op tijd gescand", helper: "Percentage koffers dat de geplande timing haalt" },
        hubs: { title: "Hub belasting", helper: "In- en outbound bags per hub" },
        exceptions: { title: "Uitzonderingen", helper: "Reden van vertragingen op dit moment" },
      },
    },
  },
  en: {
    locale: "en-GB",
    languageToggle: "Language",
    hero: {
      eyebrow: "Passenger",
      title: "Track your bag",
      subtitle: "Only the essentials for travelers. Operators can access their dashboard via",
      operatorLinkSuffix: ".",
    },
    ui: {
      enterHint: "Press Enter to search instantly.",
      ctaTrack: "Track a bag",
      ctaHow: "How it works",
      stickyTrack: "Track bag",
      stickyStatus: "Status",
      liveStatus: "Live status",
      lastScanNote: "Based on last scan",
      lastScanTitle: "Estimated from last scan",
      footerNote: "Responsive for mobile and desktop. Choose language above.",
      operatorLink: "Operator",
      trackLink: "Track",
      supportLink: "Support",
      liveChatLink: "Live chat",
    },
    form: {
      label: "Shipment ID",
      placeholder: "e.g. bag001",
      submit: "View",
      tip: "Tip: can't find the number? Pick a sample ID to explore the demo.",
      errors: {
        invalidId: "Enter a valid ID",
      },
    },
    summary: {
      status: "Status",
      lastUpdate: "Last update",
      id: "ID",
      eta: "ETA",
    },
    eta: {
      noWait: "No waiting time left.",
      waitMessage: (minutes: number) => `About ${minutes} min. remaining.`,
      tips: {
        done: "Your bag should be on the belt or already collected.",
        busy: "Sorting is busy, so it could take a little longer.",
        soon: "Stay close to the belt; your bag is almost there.",
      },
    },
    route: {
      heading: "Route & tips",
      shortActive: "In progress",
      shortUpcoming: "Pending",
      detailActive: "Your bag is traveling to this stage.",
      detailUpcoming: "This step will start once the process reaches it.",
      lastScanPrefix: "Last scan at",
      currentTitle: "In progress",
      nextTitle: "Up next",
      overviewTitle: "Route overview",
      doneMessage: "Your bag is finished; no more steps ahead.",
      toggleShow: "Show details",
      toggleHide: "Hide details",
      recentTitle: "Recent scans",
      tipLabel: "Tip",
    },
    statusLabels: {
      1: "Checked in",
      2: "In sorting hub",
      3: "Loaded on aircraft",
      4: "Arrived",
      5: "On baggage belt",
      6: "Collected",
    },
    stepDescriptions: {
      1: {
        title: "Check-in",
        body: "Your bag has been registered at the desk. You'll receive updates when new scans arrive.",
      },
      2: {
        title: "Sorting center",
        body: "The bag moves through the automated system. Operators keep an eye on exceptions.",
      },
      3: {
        title: "Boarding",
        body: "Your bag is staged at the aircraft and is being loaded.",
      },
      4: {
        title: "Arrival",
        body: "The aircraft has landed and the baggage is heading toward the belt.",
      },
      5: {
        title: "Baggage belt",
        body: "The bag will appear on the belt shortly. Keep your boarding pass ready.",
      },
      6: {
        title: "Collected",
        body: "The bag was picked up. Contact support if this is unexpected.",
      },
    },
    insights: {
      heading: "Live baggage insights",
      subtitle: "Track how busy the sortation is and whether bags are flowing on time.",
      tiles: {
        throughput: { title: "Throughput per hour", helper: "Number of bags scanned per time slot" },
        ontime: { title: "On-time scans", helper: "Share of bags hitting their planned timing" },
        hubs: { title: "Hub load", helper: "Inbound and outbound bags per hub" },
        exceptions: { title: "Exceptions", helper: "Top reasons for delays right now" },
      },
    },
  },
};

export function getPassengerCopy(language: Language): PassengerTranslation {
  return translations[language];
}
