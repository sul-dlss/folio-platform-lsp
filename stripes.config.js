const modules = require("./stripes.modules");

module.exports = {
  okapi: {
    // application gateway
    'url': 'https://folio-dev-api.stanford.edu',
    'uiUrl': 'https://folio-dev.stanford.edu',
    // authentication details: url, secret, clientId
    'authnUrl': 'https://keycloak-folio-dev.stanford.edu',
  },
  config: {
    isEureka: true,
    hasAllPerms: false,
    welcomeMessage: 'FOLIO DEV Sunflower CSP 7 - Stanford University',
    platformName: 'FOLIO DEV Sunflower CSP 7',
    helpUrl: 'https://sites.google.com/stanford.edu/folio-training-central/help',
    logCategories: 'core,path,action,xhr',
    useSecureTokens: true,
    idleSessionWarningSeconds: 60,
    logPrefix: '--',
    maxUnpagedResourceCount: 2000,
    showPerms: false,
    aboutInstallDate: '2026-06-08',
    aboutInstallMessage: 'Eureka Dev Sunflower CSP 7',
    enableEcsRequests: false,
    isSingleTenant: true,
    tenantOptions: {sul: {name: "sul", clientId: "sul-application"}}
  },
  modules, // Populated by stripes.modules.js
  branding: {
    logo: {
      src: './tenant-assets/logo.png',
      alt: 'Stanford University',
    },
    favicon: {
      src: './tenant-assets/stanford-favicon.png',
    },
    // Applied as an inline style on the MainNav <header> by stripes-core
    // (MainNav.js). Replaces the former tenant-assets/MainNav.css override,
    // whose only functional content was this one colour.
    style: {
      mainNav: {
        backgroundColor: 'rgb(21, 96, 189)',
      },
    },
  }
};
