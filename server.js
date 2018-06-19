// REQUIRED MODULES
let app         = require('express')()
let Ldap        = require('ldapauth-fork')
let session     = require('express-session')
let bodyParser  = require('body-parser')
let moment      = require('moment');
let mail        = require('./mail.js')
let Annoucement = require("./models/announcement")
let Request = require("./models/request")
let Object = require("./models/object")
let uuidv4 = require('uuid/v4');

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
app.use(function(req, res, next){
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
var auth = function(req, res, next) {
    req.session.login = req.body.login
    if(req.body.login  === "berauxre" && req.body.pwd === "guylaine") {
        req.session.surname = "Beraux"
        req.session.givenName = "Rémi"
        req.session.mail = "remi.beraux@utt.fr"
        req.session.connected = true
        res.redirect('/')

    }else if(req.body.login  === "stenekgu" && req.body.pwd === "guylaine") {
        req.session.surname = "Stenek"
        req.session.givenName = "Guillaume"
        req.session.mail = "guillaume.stenek@utt.fr"
        req.session.connected = true
        res.redirect('/')
    } else{
        req.session.errorAuth = "Identifiants non valides"
        res.redirect('/login')
    }
}

var auth_ldap = function(req,res) {
    let directory = new Ldap({
        url: 'ldap://ldap.utt.fr',
        searchBase: 'ou=People,dc=utt,dc=fr',
        searchFilter: '(uid={{username}})'
    });
    req.session.login = req.body.login
    if(req.body.login  === "" || req.body.pwd === "" || req.body.login  === undefined || req.body.pwd === undefined){
        req.session.errorAuth = "Identifiants non valides"
        res.redirect('/login')
    }

    directory.authenticate(req.body.login, req.body.pwd, function(err, user) {
        if(err){
            res.redirect('/login')
        }else{
            req.session.connected = true
            req.session.givenName = user.givenName
            req.session.surname = user.sn
            req.session.mail = user.mail
            res.redirect("/")
        }
    });
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
})

// Called when the authentification form is submitted
app.post('/login/validation', (req, res) => {
  auth(req, res)
  //auth_ldap(req, res)
})

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/announcements/available', (req, res) => {
  Annoucement.getAllWithObjects(function(err,body){
      if(err){
        throw err
      }{
          res.render('pages/objects',values = {listOfAnnouncements: body, moment: moment})
      }
  })

})

app.get('/announcements/my_announcements', (req, res) => {
  res.render('pages/my_objects')
})

app.get('/announcements/my_borrows', (req, res) => {
    Request.getRequestForBorrower(req.session.login,function(err,body){
        if(err){
            throw err
        }{
            res.render('pages/my_borrows',values = {listOfMyBorrows: body,moment:moment})
        }
    })
})

app.get('/announcement/add', (req, res) => {
    let values = {datestart: moment().format("YYYY-MM-DD"),dateend: (moment().add(7,'d')).format("YYYY-MM-DD")};
  res.render('pages/add',values)
})

app.post('/announcement/add/validation', (req, res) => {
    if(req.body.name  === undefined || req.body.name  === '') {
        res.redirect('/announcement/add')
    }
    if(req.body.description  === undefined || req.body.description  === '') {
        res.redirect('/announcement/add')
    }
    if(req.body.datestart  === undefined || req.body.datestart  === '') {
        res.redirect('/announcement/add')
    }
    if(req.body.dateend  === undefined || req.body.dateend  === '') {
        res.redirect('/announcement/add')
    }
    let docid_object = uuidv4();
    let docid_announcement = uuidv4();
    Object.creates(docid_object,req.body.name,req.body.description,function(err,body){
        if(err){
            res.redirect('/announcement/add')
        }   else{
            Annoucement.creates(docid_announcement,req.session.login,body.id,req.body.datestart,req.body.dateend, req.session.surname, req.session.givenName, req.session.mail,function(err,body) {
                if(err){

                }else{

                }
            })
        }
    })
    res.redirect('/announcement/add')
    //TODO : res.redirect('/announcement/:id');
})

app.get('/announcement/:id', (req, res) => {
    Annoucement.getById(req.params.id,function(err,body){
        if(err){
            res.redirect('/announcements/available')
        }else{
            let error = 0;
            if(body.requests !== undefined){
                for (let i=0; i < body['requests'].length; i++) {
                    if (body['requests'][i]['borrower']['login'] === req.session.login) {
                        error = 1;
                        break;
                    }
                }
            }
            let canRequest = undefined
            if(error === 0) {
                canRequest = true
            }
            res.render('pages/object', values = {announcement: body, session : req.session, moment:moment, canRequest: canRequest})
        }
    })
})

app.post('/announcement/request/validation/:id', (req, res) => {

    Request.addRequest(req.params.id,req.session.login, req.session.surname, req.session.givenName, req.session.mail, function(err, body) {
        if (err) {
            res.redirect('/announcement/'+req.params.id)
        } else {
            res.redirect('/announcement/'+req.params.id)
        }
    })
})

/* ---- Logout endpoint ---- */
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


// CONFIG
app.listen(8080)

// Pour envoyer un mail il faut appeller ces deux lignes (sans oublier les paramètres qui sont décrites dans le fichier mail.js).
/*var mailContent = mail.buildMail(requestSender, objectOwner, annoucement, 'request')
mail.sendMail(mail.buildMessage(mailContent))*/
