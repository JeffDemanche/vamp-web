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
import './commands';
const _ = Cypress._;

Cypress.Commands.add('loginBySingleSignOn', (overrides = {}) => {
    Cypress.log({
      name: 'loginBySingleSignOn',
    })

    const options = {
      method: 'POST',
      url: 'http://localhost:4567/auth/google',
      qs: {
        // use qs to set query string to the url that creates
        redirectTo: 'http://localhost:4567/set_token',
      },
      form: true, // we are submitting a regular form body
      body: {
        username: Cypress.env("googleSocialLoginUsername"),
        password: Cypress.env("googleSocialLoginPassword"),
      },
    }

    // allow us to override defaults with passed in overrides
    _.extend(options, overrides)

    cy.request(options)
  })

  
// now any cookie with the name 'session_id' or 'remember_token'
// will not be cleared before each test runs
Cypress.Cookies.defaults({
    whitelist: Cypress.env("cookieName")
})
  
  
