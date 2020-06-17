/* eslint-disable no-undef */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
const _ = Cypress._;

Cypress.Commands.add("dataCy", value => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("logInBySingleSignOn", (overrides = {}) => {
  Cypress.log({
    name: "logInBySingleSignOn"
  });

  const options = {
    method: "POST",
    url: "http://localhost:4567/auth/google",
    qs: {
      redirectTo: "http://localhost:4567/set_token"
    },
    form: true,
    body: {
      username: Cypress.env("googleSocialLoginUsername"),
      password: Cypress.env("googleSocialLoginPassword")
    },
    auth: {
      username: Cypress.env("googleSocialLoginUsername"),
      password: Cypress.env("googleSocialLoginPassword")
    }
  };

  _.extend(options, overrides);
  const resp = cy.request(options);
  return resp;
});

Cypress.Commands.add("logInWithGoogle", () => {
  Cypress.log({
    name: "logInWithGoogle"
  });
  const username = Cypress.env("googleSocialLoginUsername");
  const password = Cypress.env("googleSocialLoginPassword");
  const loginUrl = Cypress.env("loginUrl");
  const cookieName = Cypress.env("cookieName");
  const socialLoginOptions = {
    username,
    password,
    loginUrl,
    headless: false,
    logs: true,
    loginSelector: 'a[href = "/auth/google"]',
    getAllBrowserCookies: true,
    postLoginSelector: 'button[type="button"]'
  };
  return cy
    .task("GoogleSocialLogin", socialLoginOptions)
    .then(({ cookies }) => {
      cy.clearCookies();
      const cookie = cookies.filter(cookie => cookie.name === cookieName).pop();
      if (cookie) {
        cy.setCookie(cookie.name, cookie.value, {
          domain: cookie.domain,
          expiry: cookie.expires,
          httpOnly: cookie.httpOnly,
          path: cookie.path,
          secure: cookie.secure
        });

        Cypress.Cookies.defaults({
          whitelist: cookieName
        });
      }
    });
});
