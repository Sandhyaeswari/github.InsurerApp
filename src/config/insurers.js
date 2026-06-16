export const SERVER_CONFIG = {
  SERVER_IP: "http://10.10.1.87",
};

export const INSURERS = {
  BOTSWANA_GENERAL: {
    name: "Botswana General",

    // Xano APIs
    getUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:8BA2UyhU/botswana_life",

    getDocsUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:bs5w45nG/botswana_table",

    putUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:8BA2UyhU/botswana_life",

    // Insuremo APIs
    lienUrl:
      "https://codev-in-gw.insuremo.com/saiscodev/1.0/lien/updateLien",

    lienReleaseUrl:
      "https://codev-in-gw.insuremo.com/saiscodev/1.0/lien/updateLien",

    lienToken:
      "MOATwW7Dnh0oATintNbk_b3uNjM36ETS",
  },

  TECHBULLS: {
    name: "TechBulls Software Solutions Pvt Ltd",

    // Xano APIs
    getUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:czGIZunT/hollard",

    getDocsUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:WJ7zPFII/document_table",

    putUrl:
      "https://x8ki-letl-twmt.n7.xano.io/api:czGIZunT/hollard",

    // Hollard specific APIs
    lienUrl:
      "https://codev-in-gw.insuremo.com/saiscodev/1.0/lien/HollardUpdateLien",

    lienReleaseUrl:
      "https://codev-in-gw.insuremo.com/saiscodev/1.0/lien/HollardUpdateLien",

    lienToken:
      "MOATwW7Dnh0oATintNbk_b3uNjM36ETS",
  },
};