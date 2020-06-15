const assert = require('chai');

describe('Login', ()=> {


  it('is 403 unauthorized without a session cookie', () => {
    /*
      TODO: need to make a 403 page for users accessing private parts
    */
  })

  it('can navigate to the login page from homepage', ()=>{
    cy.visit('/');
    cy.contains('Log In').click()
    cy.contains('Sign In with Google');
  })

  it('can authenticate through Google', ()=>{

    const username = Cypress.env('googleSocialLoginUsername')
    const password = Cypress.env('googleSocialLoginPassword')
    const loginUrl = Cypress.env('loginUrl')
    const cookieName = Cypress.env('cookieName')

    const socialLoginOptions = {
                                username,
                                password,
                                loginUrl,
                                headless: false,
                                logs: true,
                                loginSelector: 'a[href="/auth/google"]',
                                postLoginSelector: 'button[type="button"]'
                                }
    
    Cypress.Cookies.debug(true);                           
    cy.task('GoogleSocialLogin', socialLoginOptions)
      .then((resp)=>{
        expect(resp.status).to.eq(200);
        cy.getCookies()
          .should('have.length', 1)
          .then((cookies)=>{
            expect(cookies[0]).to.have.property('name', 'session_id');
          })
      })                          
    })

    it ('can log out and render the home page', ()=>{

      /*
      TODO: still need to automate logging in correctly
      */
    })
  })
