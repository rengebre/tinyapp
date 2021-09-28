const express = require("express");
// const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; // default port 8080


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// check if link already in our database. return the existing key if it is, undefined if not.
const checkURLDatabase = function(link, dataObj) {
  for (const key in dataObj) {
    if (dataObj[key] === link) {
      return key;
    }
  }
  return;
};

//generate RandomString of 'n' number of characters. numbers in the if are the gaps between numbers -> capitals -> lower case letters which we do not want to pull from. Skip them and don't count that loop.
const generateRandomString = function(n) {
  let retStr = "";
  const min = 48;
  const max = 122;
  for (let i = 0; i < n; i++) {
    randNum = Math.floor(Math.random() * (max - min + 1) + min);
    if (!((57 < randNum && randNum < 65) || (90 < randNum && randNum < 97))) {
      retStr += String.fromCharCode(randNum);
    } else { 
      i--;
    }
  }
  return retStr;
}
// set our template engine
app.set('view engine', 'ejs');

// Middleware -> express urlencoded to parse buffer data
app.use(express.urlencoded({extended: true}));

// GET: request the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// GET: request for /urls html page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// POST request for /urls -> creating new shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;

  // check if website entered starts with http:\\, if not, add it for redirect method
  if (longURL.trim().slice(7) !== "http://") {
    longURL = "http://" + longURL;
  }

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
  res.render("urls_new");
});

// GET: request for shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if(urlDatabase[shortURL]) {
    const templateVars = { shortURL, longURL: urlDatabase[shortURL]};
    res.render('urls_show', templateVars);
    return;
  }
  res.status(404).send("404 - TinyLink does not exist");
});

// GET: redirect to the longURL linked to shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL]);
    return;
  }
  res.status(404).send("404 - TinyLink does not exist");
});

// POST: request to delete a shortURL/longURL combo in our "database"
app.post("/urls/:shortURL/delete", (req, res) =>{
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
  }
  res.status(404).send("404 - How you get here?? (⊙_☉)")
});

// GET: if the user is trying to manually access delete page, catch this and ponder their life choices
app.get("/urls/:shortURL/delete", (req, res) =>{
  res.status(404).send("404 - Why?... just, why? (⊙_☉)")
});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});