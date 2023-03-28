const express = require('express')
const BD=require('./connexion/BD')
const session = require('express-session')
const bodyParser = require('body-parser')
const multer = require('multer') 
const upload = multer()
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false,maxAge: 2592000000,expires: new Date(Date.now() + 2592000000) }
}))
if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true,maxAge: 2592000000,
    expires: new Date(Date.now() + 2592000000) 
  }
}))

}

// const myLogger = function (req, res, next) {
//   if (req.path=='/') {
//     next()
//   } else {
//   if (req.session.idUser) {
//     next()
//   } else {
//     res.redirect('/')
//   }
//   }

// }

// app.use(myLogger)

const routeUser=require('./model/user')
app.use('',routeUser)

app.get('/', (req, res) => {
  if (req.session.error) {
    res.locals.error=req.session.error
    req.session.error=undefined
  }
  if (req.session.idUser) {
    res.redirect('/home')
  } else {
    res.render('pages/index')
  }
})

app.get('/register', (req, res) => {
  if (req.session.error) {
    res.locals.error=req.session.error
    req.session.error=undefined
  }
  if (req.session.succes) {
    res.locals.succes=req.session.succes
    req.session.succes=undefined
  }
    res.render('pages/register')
})

app.get('*', (req, res) => {
    res.render('pages/error')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})