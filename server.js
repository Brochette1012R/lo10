// REQUIRED MODULES
let app         = require('express')()
let Ldap        = require('ldapauth-fork')
let session     = require('express-session')
let bodyParser  = require('body-parser')

// TEMPLATE ENGINE
app.set('view engine', 'ejs')

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

/* ---- authentification ---- */
app.use(session({
    secret: '27101214rgt',
    resave: false,
    saveUninitialized: true
}));

// If the user isn't connected, he is redirected to the login form
var checkAuth = function(req, res){
  if (!req.session.connected)
    res.redirect('/login')
}

var auth = function(req, res) {
  if(req.body.login  == "Brochette" && req.body.pwd == "guylaine") {
    res.session.login = req.body.login
    res.session.connected = true
    res.redirect('/')
  } else{
    res.redirect('/login')
  }
}
/* ---- authentification ---- */

// ROUTES
/* ---- Login endpoint ---- */
app.get('/login', (req, res) => {
  res.render('pages/login')
});

//Called when the authentification form is submitted
app.post('/login/validation', (req, res) => {
  auth(req, res)
});

app.get('/', checkAuth, (req, res) => {
  res.render('pages/index')
})

app.get('/annoucements/available', checkAuth, (req, res) => {
  res.render('pages/objects')
})

app.get('/annoucements/:id', checkAuth, (req, res) => {
  res.render('pages/object')
})

app.get('/annoucements/my_annoucements', checkAuth, (req, res) => {
  res.render('pages/objects')
})

/* ---- Logout endpoint ---- */
app.get('/logout', checkAuth, (req, res) => {
  req.session.destroy();
  res.render('/login');
});

// CONFIG
app.listen(8080)
