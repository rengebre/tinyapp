// Global Functions
/***************************************/

// check if link already in our database. return the existing key if it is, undefined if not.
const checkURLDatabase = function(link, id, dataObj) {
  for (const key in dataObj) {
    if (dataObj[key].longURL === link && dataObj[key].user_id === id) {
      return key;
    }
  }
  return;
};

// check if long url has a leading "http://"
const checkLeadingHttp = function(url) {
  if (url.trim().slice(7) !== "http://") {
    return "http://" + url;
  }
  return url;
};

//generate RandomString of 'n' number of characters. numbers in the if are the gaps between numbers -> capitals -> lower case letters which we do not want to pull from. Skip them and don't count that loop.
const generateRandomString = function(n) {
  let retStr = "";
  const min = 48;
  const max = 122;
  for (let i = 0; i < n; i++) {
    let randNum = Math.floor(Math.random() * (max - min + 1) + min);
    if (!((57 < randNum && randNum < 65) || (90 < randNum && randNum < 97))) {
      retStr += String.fromCharCode(randNum);
    } else {
      i--;
    }
  }
  return retStr;
};

// Get email from the user ID. If user ID doesn't exist return false
const getEmailFromUserID = function(id, userObj) {
  if (!userObj[id]) {
    return false;
  }

  return userObj[id].email;
};

// Get user ID from an email. Return the user ID if email exists, false otherwise
const getUserIDFromEmail = function(email, userObj) {
  for (const key in userObj) {
    if (userObj[key].email === email) {
      return key;
    }
  }

  return false;
};

// Generate a random ID number between 1 & n
const generateUserID = function(n) {
  return Math.floor((Math.random() * n) + 1);
};

// simple check if an email/id exist, used in multiple places, extracted it
const checkUserEmailAndID = function(id, email) {
  if (id && !email) {
    return false;
  }
  return true;
};

// Used to check if cookies are present any time the server restarts. Cleans them up otherwise.
const cleanUpLeftoverCookies = function(id, email, res, req) {
  if (!checkUserEmailAndID(id, email)) {
    req.session = null;
    res.status(400).send("Oops, looks like the user left and forgot his cookies :(.\nI cleaned them up for you, try again.");
    return true;
  }
  return false;
};

module.exports = {
  checkURLDatabase,
  checkUserEmailAndID,
  checkLeadingHttp,
  generateRandomString,
  getEmailFromUserID,
  getUserIDFromEmail,
  generateUserID,
  cleanUpLeftoverCookies
};