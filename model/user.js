const express = require('express')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const multer  = require('multer');
const uniquid = require('uniquid');
const Schema = mongoose.Schema;
const route = express.Router()

const userSchema = new Schema({
    idUser: { type: String, required:true },
    username: { type: String, required:true },
    email: { type: String, required:true },
    password: { type: String, required:true },
    photo: { type: String, required:true },
});

  const userModel = mongoose.model('user', userSchema);
  module.exports=route

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/photoUser/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname )
    }
})

const upload = multer({
    storage: storage,
    limits:{
        fieldSize:1024*1024*3
    },
    fileFilter:(req, file, cb)=> {
    if (file.mimetype=='image/apng' || file.mimetype=='image/png' || file.mimetype=='image/jpeg' || file.mimetype=='image/gif') {
        cb(null, true)
    } else {
        cb(null, false)
        cb(new Error('Uniquement les fichiers images'))
    }

    }
      
})

route.post('/register', upload.single('file'),(req, res)=>{
    let username=req.body.nom
    let email=req.body.email
    let pass=req.body.pass
    let file=req.file

    if (username=='' || email=='' || pass=='' || file=='') {
      req.session.error=true
      res.redirect('/register')  
    }else{
        let newUser=new userModel({
            idUser:uniquid(),
            username:req.body.nom,
            email:req.body.email,
            photo:req.file.filename,
            password:bcrypt.hashSync(req.body.pass, saltRounds)
        })

        newUser.save()
        .then(() =>{
            req.session.succes=true
            res.redirect('/register') 
        })
        .catch((err) => console.log(+err));
    }
})


route.post('/',(req, res)=>{
   
    let email=req.body.email
    let pass=req.body.pass
    

    if (email=='' || pass=='') {
      req.session.error=true
      res.redirect('/')  
    }else{

      userModel.find({email:req.body.email})
       .then((item) =>{
        if (item.length===0) {
            req.session.error=true
            res.redirect('/') 
        } else {
           if (bcrypt.compareSync(req.body.pass, item[0].password)==true) {
           req.session.idUser=item[0].idUser
           res.redirect('/home')
           }else{
            req.session.error=true
            res.redirect('/') 
           }
        }
       })
       .catch((err) => console.log(err));

     }
})

route.get('/home', (req, res) => {
  userModel.find({idUser:req.session.idUser})
  .then((item)=>{
    res.render('pages/home',{user:item[0]})
  })
  .catch((err)=> console.log(err));
})

route.get('/logout', (req, res) => {
  req.session.idUser=undefined
  res.redirect('/')
})

route.get('/profiluser/:id', (req, res) => {
  userModel.find({idUser:req.params.id})
  .then((item)=>{
    res.render('pages/profiluser',{user:item[0]})
  })
  .catch((err)=> console.log(err));
})

route.get('/updateprofil/:id', (req, res) => {
  if (req.session.error) {
    res.locals.error=req.session.error
    req.session.error=undefined
  }
  userModel.find({idUser:req.params.id})
  .then((item)=>{
    res.render('pages/updateprofil',{user:item[0]})
  })
  .catch((err)=> console.log(err));
})

route.post('/updateprofil/:id', (req, res) => {

  let email=req.body.email
  let username=req.body.nom
  

  if (email=='' || username=='') {
    req.session.error=true
    res.redirect('/updateprofil/'+req.params.id)  
  }else{
    userModel.updateOne({idUser:req.params.id},{username:req.body.nom,email:req.body.email})
    .then((item)=>{
      res.redirect('/profiluser/'+req.params.id)
    })
    .catch((err)=> console.log(err));
  }
})