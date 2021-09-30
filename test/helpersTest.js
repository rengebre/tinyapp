const { assert } = require('chai');

const { getUserIDFromEmail, getEmailFromUserID } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserIDFromEmail', function() {
  it('should return a user ID with valid email', function() {
    const user = getUserIDFromEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });

  it('should return false with an invalid email', function() {
    const user = getUserIDFromEmail("user3@example.com", testUsers);
    assert.isFalse(user);
  });
});

describe('getEmailFromUserID', function() {
  it('should return the correct email provided a valid user ID', function() {
    const email = getEmailFromUserID("user2RandomID", testUsers);
    const expectedOutput = "user2@example.com";
    // Write your assert statement here
    assert.strictEqual(email, expectedOutput);
  });

  it('should return false with an invalid ID', function() {
    const email = getEmailFromUserID("user3RandomID", testUsers);
    assert.isFalse(email);
  });
});