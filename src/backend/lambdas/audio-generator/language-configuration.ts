const iso2LangToPollyParams: {
    [iso2Lang: string]: {
      langCode: string;
      voiceId: string;
      engine: "neural" | "standard";
    };
  } = {
    fr: {
      engine: "neural",
      voiceId: "Lea",
      langCode: "fr-FR",
    },
    en: {
      engine: "neural",
      voiceId: "Joanna",
      langCode: "en-US",
    },
    ar: {
      engine: "standard",
      voiceId: "Zeina",
      langCode: "arb",
    },
    de: {
      engine: "neural",
      langCode: "de-DE",
      voiceId: "Vicki",
    },
    it: {
      engine: "neural",
      langCode: "it-IT",
      voiceId: "Bianca",
    },
    es: {
      engine: "neural",
      langCode: "es-ES",
      voiceId: "Lucia",
    },
  };
  
  const getLangConfigurationOrDefault = (iso2Lang: string) =>
    iso2LangToPollyParams[iso2Lang] || iso2LangToPollyParams["en"];
  
  export { getLangConfigurationOrDefault };
  