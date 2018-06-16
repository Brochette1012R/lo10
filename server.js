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

/* ---- session ---- */
app.use(session({
    secret: '27101214rgt',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

/* ---- authentification ---- */
// On applique ce middleware à toutes les routes de l'appli, sauf celles précisés dans les conditions
app.use('/*',function(req, res, next){
    if('/login' === req.path || '/login/validation' === req.path){
        return next()
    }
    if('/login' === req.originalUrl || '/login/validation' === req.originalUrl){
        return next()
    }
    if (!req.session.connected){
        return res.redirect('/login')
    }
    return next()
});

// fonction d'authenficiation, à remplacer par le système LDAP à priori
var auth = function(req, res) {
    req.session.login = req.body.login
    if(req.body.login  === "Brochette" && req.body.pwd === "guylaine") {
        req.session.connected = true
        res.redirect('/')
    } else{
        req.session.errorAuth = "Identifiants non valides"
        res.redirect('/login')
    }
}

// ROUTES
/* ---- Login endpoint ---- */
app.get('/login', (req, res) => {
  let values = {};
  req.session.errorAuth ? values.errorAuth  = req.session.errorAuth : undefined
  req.session.login ? values.login  = req.session.login : undefined
  req.session.errorAuth = undefined
  req.session.login = undefined
  res.render('pages/login', values);
});

//Called when the authentification form is submitted
app.post('/login/validation', (req, res) => {
  auth(req, res)
});

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/annoucements/available', (req, res) => {
  res.render('pages/objects')
})

app.get('/annoucements/:id', (req, res) => {
  res.render('pages/object')
})

app.get('/annoucements/my_annoucements', (req, res) => {
  res.render('pages/objects')
})

/* ---- Logout endpoint ---- */
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// CONFIG
app.listen(8080)
