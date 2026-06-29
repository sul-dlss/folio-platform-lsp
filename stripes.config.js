const modules = require("./stripes.modules");

module.exports = {
  okapi: {
    // application gateway
    'url': 'https://folio-stage-api.stanford.edu',
    'uiUrl': 'https://folio-stage.stanford.edu',
    // authentication details: url, secret, clientId
    'authnUrl': 'https://keycloak-folio-stage.stanford.edu',
  },
    config: {
    isEureka: true,
    hasAllPerms: false,
    welcomeMessage: 'FOLIO STAGE Sunflower CSP 7 - Stanford University',
    platformName: 'FOLIO STAGE Sunflower CSP 7',
    helpUrl: 'https://sites.google.com/stanford.edu/folio-training-central/help',
    logCategories: 'core,path,action,xhr',
    useSecureTokens: true,
    idleSessionWarningSeconds: 60,
    logPrefix: '--',
    maxUnpagedResourceCount: 2000,
    showPerms: false,
    aboutInstallDate: '2026-07-01',
    aboutInstallMessage: 'Eureka Stage Sunflower CSP 7',
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
  }
};
