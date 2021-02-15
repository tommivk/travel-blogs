/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
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

describe('Gallery uploading', function () {
  it('User can upload image to gallery', function () {
    cy.get('[href="/gallery"] > .header-link > h1').click();
    cy.get('.gallery-upload-images-button').click();
    cy.fixture('../images/testpicture.jpg').as('picture');

    cy.get('input[type=file]').then(function (el) {
      const blob = Cypress.Blob.base64StringToBlob(this.picture, 'image/jpg');

      const file = new File([blob], 'images/picture.jpg', { type: 'image/jpg' });
      const list = new DataTransfer();

      list.items.add(file);
      const myFileList = list.files;

      el[0].files = myFileList;
      el[0].dispatchEvent(new Event('change', { bubbles: true }));
    });

    cy.get('#upload-modal-next-button-first').click();
    cy.get('#image-upload-title-input').type('Test title');
    cy.get('#upload-modal-next-button').click();
    cy.get('#upload-modal-search-input').type('helsinki');
    cy.get('#upload-modal-search-button').click();
    cy.contains('Helsinki');
    cy.contains('Finland');
    cy.get('.location-result-select-button').click();
    cy.contains('Publish This Image To Gallery?');
    cy.get('#upload-modal-yes-button').click();
    cy.contains('Preview');
    cy.contains('Image Info');
    cy.contains('Title:');
    cy.contains('Test title');
    cy.contains('Public');
    cy.contains('Yes');
    cy.contains('Location');
    cy.contains('Country:');
    cy.contains('Finland');
    cy.contains('Helsinki');
    cy.get('#image-modal-upload-button').click();
    cy.get('body').click(4, 50);
    cy.contains('Test title');
    cy.get('.gallery-card').click();
    cy.contains('Test title');
  });

  it('Location info is shown', function () {
    cy.get('.image-toggle-button').click();
    cy.get('.picture-container img').should('be.visible');
    cy.contains('Helsinki');
    cy.contains('Finland');
    cy.get('#picture-location-info-map-icon').should('be.visible');
  });

  it('User can post new comment', function () {
    cy.get('.comment-input-field').type('new comment');
    cy.get('.comment-submit-button').click();
    cy.contains('new comment');
    cy.contains('testuser');
    cy.contains('less than a minute ago');
  });

  it('User can delete comment', function () {
    cy.get('.comment-delete-button').click();
    cy.get('#confirm-dialog-ok-button').click();
    cy.contains('new comment').should('not.exist');
  });

  it('Picture is shown on user page', function () {
    cy.get('#header-user-avatar').click();
    cy.get('#my-page-menulink').click();
    cy.get('#userpage-pictures-radio').click();
    cy.contains('Test title');
    cy.get('.gallery-card > img').should('be.visible');
  });

  it('User can delete picture', function () {
    cy.get('#userpage-picture-delete-button').click();
    cy.get('#confirm-dialog-ok-button').click();
    cy.contains('Test title').should('not.exist');
    cy.get('.gallery-card > img').should('not.exist');
    cy.contains('My Uploaded Pictures');
    cy.contains('No pictures uploaded yet');
  });
});

describe('Updating user', function () {
  it('User can change username', function () {
    cy.get('#header-user-avatar').click();
    cy.get('#my-page-menulink').click();
    cy.get('#edit-profile-button').click();
    cy.get('.username-edit-container').click();
    cy.get('.username-change-input > input').clear();
    cy.get('.username-change-input > input').type('new username');
    cy.get('#profile-update-submit-button').click();
    cy.get('.MuiAlert-message').contains('Profile updated');
    cy.contains('new username');
    cy.reload();
    cy.contains('new username');
    cy.contains('Member Since:');
    cy.contains('Created Blogs:');
    cy.contains('Uploaded Pictures:');
  });

  it('Avatar can be changed', function () {
    cy.get('#edit-profile-button').click();

    cy.fixture('../images/testpicture.jpg').as('picture');

    cy.get('input[type=file]').then(function (el) {
      const blob = Cypress.Blob.base64StringToBlob(this.picture, 'image/jpg');

      const file = new File([blob], 'images/picture.jpg', { type: 'image/jpg' });
      const list = new DataTransfer();

      list.items.add(file);
      const myFileList = list.files;

      el[0].files = myFileList;
      el[0].dispatchEvent(new Event('change', { bubbles: true }));
    });
    cy.get('#profile-update-submit-button').click();
    cy.get('.user-page-main-container').scrollTo('top');
    cy.get('.MuiAlert-message').contains('Profile updated');
    cy.get('.userpage-avatar-image').should('be.visible');
    cy.contains('new username');
    cy.contains('Member Since:');
    cy.contains('Created Blogs:');
    cy.contains('Uploaded Pictures:');
  });

  it('Username and avatar can be changed at the same time', function () {
    cy.get('#header-user-avatar').click();
    cy.get('#my-page-menulink').click();
    cy.get('#edit-profile-button').click();
    cy.get('.username-edit-container').click();
    cy.get('.username-change-input > input').clear();
    cy.get('.username-change-input > input').type('testuser');

    cy.fixture('../images/testpicture.jpg').as('picture');

    cy.get('input[type=file]').then(function (el) {
      const blob = Cypress.Blob.base64StringToBlob(this.picture, 'image/jpg');

      const file = new File([blob], 'images/picture.jpg', { type: 'image/jpg' });
      const list = new DataTransfer();

      list.items.add(file);
      const myFileList = list.files;

      el[0].files = myFileList;
      el[0].dispatchEvent(new Event('change', { bubbles: true }));
    });

    cy.get('#profile-update-submit-button').click();
    cy.get('.MuiAlert-message').contains('Profile updated');
    cy.contains('testuser');
    cy.contains('Member Since:');
    cy.contains('Created Blogs:');
    cy.contains('Uploaded Pictures:');
    cy.get('.user-page-main-container').scrollTo('top');
    cy.get('.userpage-avatar-image').should('be.visible');
    cy.reload();
    cy.get('.user-page-main-container').scrollTo('top');
    cy.contains('testuser');
    cy.contains('Member Since:');
    cy.contains('Created Blogs:');
    cy.contains('Uploaded Pictures:');
    cy.get('.userpage-avatar-image').should('be.visible');
  });
});

describe('Deleting user', function () {
  it('User can be deleted', function () {
    cy.get('#header-user-avatar').click();
    cy.get('#my-page-menulink').click();
    cy.get('#edit-profile-button').click();
    cy.get('#user-delete-icon').click();
    cy.get('#confirm-dialog-ok-button').click();
    cy.get('.MuiAlert-message').contains('User deleted');
    cy.contains('TravelBlogs');
    cy.contains('Login');
    cy.get('#indexpage-signup-button').should('be.visible');
  });
});
