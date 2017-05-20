var express = require('express')
var app = express()
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var comparar = require('@ull-andrea-carlos/comparar');
var mongoose = require('mongoose');

//permite coger parámetros de la url(query string)
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/usuarios', function(error){
  if (error) {
    throw error; 
  } else {
    console.log('Conectado a MongoDB');
  }
});

// This is our mongoose model for todos
var Schema = mongoose.Schema({
    usuario: String,
    contrasena: String
});

//Creamos el modelo a partir del squema
var Usuarios = mongoose.model('Usuarios', Schema);


app.use(session({
    secret: 'example',
    resave: true,
    saveUninitialized: true
}));

//Comprueba si ya esta autorizado en esta sesion
var auth = function(req, res, next) {

  Usuarios.findOne({usuario: req.session.user}, function (err, result) {
    if (err) {
      console.log(err);
      res.send("ERROR");
    } else {
      if (result != null) {

        if (req.session) {
          return next();
        } else {
          return res.sendStatus(401);
        }

      } else {
        return res.sendStatus(401);
      }

    }

  })

}; 


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/'));
//En la raiz pone las opciones para login y acceder contenido (no deberia poder acceder al no estar autentificado)
app.get('/', function(req, res){
  res.render('formulario/noautentificado');
});

//Muestra la vista con el formulario para log in
app.get('/login', function(req, res){
  res.render('formulario/login');
});

app.get('/registrar', function(req, res){
  res.render('formulario/registrar')
})

var registrar = function (user, pass) {

  console.log(user);
  console.log(pass);

  usuario1 = new Usuarios ({"usuario": user, "contrasena": bcrypt.hashSync(pass)}, function (err, result) {
    if (err) return handleError(err);
  })

  usuario1.save (function (err) {
    if (err) return handleError(err);
  })

};

app.post('/registrar', function(req, res) {

  if (!req.body.username || !req.body.password) { //campos imvalidos o nulos

    console.log('registrar failed');
    res.render('formulario/registrar');

  } else {

    Usuarios.findOne({usuario: req.body.username}, function (err, result) {
      if (err) {
        console.log(err);
        res.send("ERROR");
      } else {

        if (result != null) {

          console.log('Usuario ya registrado')
          console.log(result.usuario)
          res.render('formulario/registrar');

        } else {

          registrar(req.body.username, req.body.password);
          res.render('formulario/noautentificado');

        }

      }

    })
  
  }

});

app.post('/login', function(req, res) {

  if (!req.body.username || !req.body.password) { //campos invalidos o nulos

    console.log('Rellene los campos');
    res.render('formulario/noautentificado');

  } else {

    Usuarios.findOne({usuario: req.body.username}, function (err, result) {
      if (err) {
        console.log(err);
        res.send("ERROR");
      } else {

        if (result != null) {
          
          if (result.username = req.body.username && bcrypt.compareSync(req.body.password, result.contrasena)) {
            req.session.user = req.body.username;
            req.session.admin = true;
            console.log("Usuario correcto");
            console.log(result.usuario);
            res.render('formulario/autentificado');
          }

        } else {
          console.log('login failed');
          res.render('formulario/noautentificado')
        }

      }

    })

  }

});

app.get('/comparar',auth, function(req, res){
  res.render('content/input', { result: ''})
})

app.post('/comparar', function(req, res){
  console.log(req.body.temp);
  var resultado = comparar(req.body.temp);
  res.render('content/input', { result: resultado})
})


  //Borra la sesion.
  app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('formulario/noautentificado' );
  });


  var server = app.listen(process.env.PORT || 8087, ()=> {
	var host = server.address().address
	var port = server.address().port

	console.log('Conectado al puerto 8087')
})
