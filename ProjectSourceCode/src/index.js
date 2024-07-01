const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const hostname = '0.0.0.0';
const port = 1234;

// -------------------------------------  APP CONFIG   ----------------------------------------------
// Serve static files from the 'src/resources' directory
app.use('/resources', express.static(path.join(__dirname, 'resources')));
// Create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set Session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with your own secret
    saveUninitialized: false,
    resave: false,
  })
);


// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB, // Replace with your database name
  user: process.env.POSTGRES_USER, // Replace with your database user
  password: process.env.POSTGRES_PASSWORD, // Replace with your database password
};
const db = pgp(dbConfig);

// DB Test
db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR', error.message || error);
  });

// Middleware to pass user session data to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});
// ------------------------------------- Defining User login credentials --------------------------------------
const user = {
  user_id: undefined,
  username: undefined,
  password: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined
};

// -------------------------------------  ROUTES for home.hbs   ----------------------------------------------
// ROUTES
app.get('/', (req, res) => {
  const sessionUser = req.session.user;
  res.render('pages/home');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

// -------------------------------------  ROUTES for login.hbs   ----------------------------------------------
app.get('/login', (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const query = 'SELECT * FROM userinfo WHERE username = $1 and password = $2 LIMIT 1';
  const values = [username, password];

  // Get the student_id based on the emailid
  db.one(query, values)
    .then(data => {
      user.user_id = data.user_id;
      user.username = username;
      user.password = password;
      user.first_name = data.first_name;
      user.last_name = data.last_name;
      user.email = data.email;

      req.session.user = user;

      res.redirect('/profile');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    });
});


// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Profile route
app.get('/profile', auth, (req, res) => {
  res.render('pages/profile');
});

// Route for sports data
app.get('/data', (req, res) => {
  res.render('pages/data');
});

// Route for stocks
app.get('/stocks', (req, res) => {
  res.render('pages/stocks');
});

// Route for store
app.get('/store', (req, res) => {
  res.render('pages/store');
});

// Apply auth middleware only to marketplace route
app.get('/marketplace', auth, (req, res) => {
  res.render('pages/marketplace');
});
// -------------------------------------  ROUTES for logout.hbs   ----------------------------------------------

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// -------------------------------------  START THE SERVER   ----------------------------------------------

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
