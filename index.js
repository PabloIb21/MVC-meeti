const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const router = require('./routes');
require('dotenv').config({ path: 'variables.env' });

const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meetis');
require('./models/Comentarios');
db.sync().then(() => console.log('BD conectada')).catch(err => console.log(err));

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(expressLayouts);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.usuario = { ...req.user } || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

app.use('/', router());

app.listen(process.env.PORT, () => {
    console.log(`Servidor funcionando en el puerto: ${process.env.PORT}`);
});
