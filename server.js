//variables que importan todas las propiedades de los recursos llamados en los parentesis
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Body Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
//DB Congif (variable para guardar la ruta de la conexion de bases de datos)
const db = require('./config/keys').mongoURI;

//Connect to MongoDB ()
mongoose
.connect(db)
//funciona como un if  donde si se realiza la conexion exitosamente mostrara en msj en consola 
.then(() => console.log('MongoDB Connected'))
// si no se realiza correctamente mostrara el error en consola
.catch(err => console.error(err));

//mensaje que se muestra cada que se haga una peticion a la app web
//Passport Middeware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);

//Use Routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on por ${port}`));