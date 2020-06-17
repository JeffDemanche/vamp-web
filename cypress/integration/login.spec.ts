describe("Login", () => {
  it("is 403 unauthorized without a session cookie", () => {
    /*
      TODO: need to make a 403 page for users accessing private parts
    */
  });

  it("can navigate to the login page from homepage and log in", () => {
    const cookieName = String(Cypress.env("cookieName"));
    const cookieValue = String(Cypress.env("coookieValue"));
    cy.setCookie(cookieName, cookieValue);
    cy.visit("/");
    cy.contains("Log In").click();
    cy.contains("Sign In with Google");

    // cy.logInBySingleSignOn({}).then(resp => {
    //   expect(resp.status).to.eq(200);
    // });

    cy.visit("http://localhost:4567/v/5eea6891ce9370192da90c13");

    cy.getCookie(cookieName).should("exist");
  });

  it("can log out and render the home page", () => {
    /*
      TODO: still need to automate logging in correctly
      */
  });
});
