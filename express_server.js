const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// Global variables
/****************************************/

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// Global Functions
/***************************************/

// check if link already in our database. return the existing key if it is, undefined if not.
const checkURLDatabase = function(link, dataObj) {
  for (const key in dataObj) {
    if (dataObj[key] === link) {
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

// EXPRESS SETS... What to call these?
/********************************************/

// set our template engine
app.set('view engine', 'ejs');

// MIDDLEWARE:
/********************************************/

// parse buffer data
app.use(express.urlencoded({extended: true}));

// parse cookies
app.use(cookieParser());

// ROUTE CONTROL
/*******************************************/

// GET: redirect to urls if trying to access the home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET: request for /urls html page
app.get("/urls", (req, res) => {
  const id = req.cookies['user_id'];
  const email = getEmailFromUserID(id, users);
  const templateVars = {
    urls: urlDatabase,
    email
  };
  res.render("urls_index", templateVars);
});

// POST request for /urls -> creating new shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;

  // check if website entered starts with http:\\, if not, add it for redirect method
  // if (longURL.trim().slice(7) !== "http://") {
  //   longURL = "http://" + longURL;
  // }
  longURL = checkLeadingHttp(longURL);

  // check if website link already has an existing shortURL, act accordingly
  let checkKey = checkURLDatabase(req.body.longURL, urlDatabase);

  if (!checkKey) {
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect(`/urls/${checkKey}`);
  }
});

// GET: request for new URL page
app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const email = getEmailFromUserID(id, users);
  const templateVars = {
    email
  };
  res.render("urls_new", templateVars);
});

// GET: request for shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.cookies['user_id'];
  const email = getEmailFromUserID(id, users);

  if (urlDatabase[shortURL]) {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL],
      email
    };
    res.render('urls_show', templateVars);
    return;
  }
  res.status(404).send("404 - TinyLink does not exist");
});

// GET: redirect to the longURL linked to shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL]);
    return;
  }
  res.status(404).send("404 - TinyLink does not exist");
});

// POST: update longURL if edited
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = checkLeadingHttp(longURL);
  }
  res.redirect("/urls");
});

// POST: request to delete a shortURL/longURL combo in our "database"
app.post("/urls/:shortURL/delete", (req, res) =>{
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
  }
  res.status(404).send("404 - How you get here?? (⊙_☉)");
});

// GET: if the user is trying to manually access delete page, catch this and ponder their life choices
app.get("/urls/:shortURL/delete", (req, res) =>{
  res.status(404).send("404 - Why?... just, why? (⊙_☉)");
});

// User Login/Registry/authentication

// GET: retrieve login page if not logged in
app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];

  if (id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    email: false,
  };
  
  res.render("urls_login", templateVars);
});

// POST: Login, verifying that the email and password match.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    res.status(400).send("Please sir, can I have more..... emails or passwords");
    return;
  }
  
  const id = getUserIDFromEmail(email, users);
  
  if (!id) {
    res.status(403).send("No user account exists for this email");
    return;
  }

  if (users[id].email === email && users[id].password === password) {
    res.cookie('user_id', id);
    res.redirect('/urls');
    return;
  }

  res.status(403).send("Incorrect email or password... stop haxxing");

});

// POST: Delete cookie to logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// GET: get registration page if not logged in
app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  
  if (id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    email: false,
  };

  res.render("urls_register", templateVars);
});

// POST: create a new user if they don't exist
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateUserID(2000);

  if (!email || !password) {
    res.status(400).send("Please sir, can I have more..... emails or passwords");
    return;
  }

  if (getUserIDFromEmail(email, users)) {
    res.status(403).send("User already exists for that email account");
    return;
  }

  if (!users[id]) {
    users[id] = {
      id,
      email,
      password
    };

    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});

// listen on port: PORT.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});