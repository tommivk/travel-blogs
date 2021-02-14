/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import 'cypress-iframe';

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

describe('User can create new blog', function () {
  it('New blog can be created', function () {
    cy.get('#header-user-avatar').click();
    cy.contains('Create New Blog');
    cy.get('#create-new-blog').click();
    cy.contains('Set Title');
    cy.contains('Write Content');
    cy.contains('Add Locations');
    cy.contains('Preview And Submit');
    cy.get('#new-blog-title-textfield').type('Test blog');
    cy.get('#new-blog-description-textfield').type('Description for test blog');
    cy.get('#new-blog-next-button').click();
    cy.contains('Set Title');
    cy.contains('Write Content');
    cy.contains('Add Locations');
    cy.contains('Preview And Submit');
    cy.contains('File');
    cy.contains('Edit');
    cy.contains('View');
    cy.contains('Format');
    cy.get('.tox-notification__dismiss').click();
    cy.frameLoaded();
    cy.iframe().type('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');
    cy.get('#new-blog-next-button').click();
    cy.contains('Set Title');
    cy.contains('Write Content');
    cy.contains('Add Locations');
    cy.contains('Preview And Submit');
    cy.contains('Locations selected');
    cy.get('#location-search-textfield').type('Tokyo');
    cy.get('#new-blog-search-button').click();
    cy.contains('Japan');
    cy.contains('Japan');
    cy.get('.location-result-select-button').click();
    cy.get('#new-blog-next-button').click();
    cy.contains('Set Title');
    cy.contains('Write Content');
    cy.contains('Add Locations');
    cy.contains('Preview And Submit');
    cy.get('#new-blog-preview-button').click();
    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');
    cy.get('#new-blog-preview-submit-button').click();
    cy.get('#header-blogs-link').click();
    cy.contains('By testuser');
    cy.contains('TEST BLOG');
    cy.contains('Description for test blog');
  });
  describe('Blog content', function () {
    it('Blog content is displayed', function () {
      cy.get('#main-blog-link').click();
      cy.contains('Test blog');
      cy.contains('Description for test blog');
      cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');
    });
    describe('Blogs on user page', function () {
      it('Blog content is displayed on user page', function () {
        cy.get('#header-user-avatar').click();
        cy.get('#my-page-menulink').click();
        cy.contains('TEST BLOG');
        cy.contains('Description for test blog');
      });
      it('Blog deleting works', function () {
        cy.get('#userpage-blog-delete-button').click();
        cy.get('#confirm-dialog-ok-button').click();
        cy.contains('TEST BLOG').should('not.exist');
        cy.contains('Description for test blog').should('not.exist');
        cy.get('#header-blogs-link').click();
        cy.contains('TEST BLOG').should('not.exist');
        cy.contains('Description for test blog').should('not.exist');
        cy.reload();
        cy.contains('TEST BLOG').should('not.exist');
        cy.contains('Description for test blog').should('not.exist');
        cy.get('#header-user-avatar').click();
        cy.get('#my-page-menulink').click();
        cy.contains('TEST BLOG').should('not.exist');
        cy.contains('Description for test blog').should('not.exist');
      });
    });
  });
});
