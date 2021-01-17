/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
describe('Indexpage', function () {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:8008/api/testing/reset');
  });

  it('Indexpage can be opened', function () {
    cy.visit('http://localhost:3000');
    cy.contains('TravelBlogs');
    cy.contains('Login');
  });

  it('User can signup', function () {
    cy.get('#indexpage-signup-button').click();
    cy.get('#signup-username-textfield').type('testuser');
    cy.get('#signup-password-textfield').type('testpassword');
    cy.get('#signup-form-button').click();
  });

  it('User can login', function () {
    cy.get('.indexpage-login-link').click();
    cy.get('#login-username-textfield').type('testuser');
    cy.get('#login-password-textfield').type('testpassword');
    cy.get('#login-form-button').click();
    cy.contains('BLOGS');
    cy.contains('GALLERY');
  });
});
