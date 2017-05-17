var express = require('express')
var app = express()
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var file = './user.json'
var jsonfile = require('jsonfile');
var users = require('./user.json');
var comparar = require('@ull-andrea-carlos/comparar');
//permite coger parámetros de la url(query string)
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'example',
    resave: true,
    saveUninitialized: true
}));

var registrar = function(user, pass){
  users[user] = bcrypt.hashSync(pass);
}

//Comprueba si ya esta autorizado en esta sesion
var auth = function(req, res, next) {
  if (req.session && req.session.user in users)
    return next();
  else
    return res.render('formulario/noautentificado');
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/'));
//En la raiz pone las opciones para login y acceder contenido (no deberia poder acceder al no estar autentificado)
app.get('/', function(req, res){
  res.render('formulario/noautentificado');
});

/*
app.get('/', function(req, res){
  res.render('noautentificado', { message: 'Para acceder al contenido es necesario autentificarse:' } );
});
*/
//Muestra la vista con el formulario para log in
app.get('/login', function(req, res){
  res.render('formulario/login');
});

//Genera el json con los usuarios especificados en la variable users

jsonfile.writeFile(file, users, {spaces: 2}, (err)=>{
	console.error(err);
});

app.get('/registrar', function(req, res){
  res.render('formulario/registrar')
})

app.get('/comparar',auth, function(req, res){
  res.render('content/input', { result: ''})
})

app.post('/comparar', function(req, res){
  console.log(req.body.temp);
  var resultado = comparar(req.body.temp);
  res.render('content/input', { result: resultado})
})

app.post('/registrar', function(req, res){
  if (!req.body.username || !req.body.password) {
    console.log('registrar failed');
      res.render('formulario/registrar');
  } else if(req.body.username in users) {

    console.log('registrado fallido');
    res.render('formulario/registrar');
  } else {
    registrar(req.body.username, req.body.password)
    res.render('formulario/noautentificado');

    jsonfile.writeFile(file, users, {spaces: 2}, (err)=>{
      console.error(err);
    });
  }
})

//Obtiene la respuesta del formulario y comprueba si es correcto
app.post('/login', function(req, res){
    if (!req.body.username || !req.body.password) {
      console.log('login failed');
        res.render('formulario/noautentificado' );
    } else if(req.body.username in users &&
              bcrypt.compareSync(req.body.password, users[req.body.username])) {
      req.session.user = req.body.username;
      req.session.admin = true;
      res.render('formulario/autentificado' );
    } else {
      console.log('login failed');
      res.render('formulario/noautentificado');
    }
  });
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
