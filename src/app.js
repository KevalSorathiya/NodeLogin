const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 8000;
require('./db/connection');
const path = require('path');
const loginRouter = require('./router/loginRouter');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');

//all static path
const public_path = path.join(__dirname, "../public");
const newpassword_public_path = path.join(__dirname, "../../public");
const favicon_path = path.join(__dirname, "../favicon");
const upload_path = path.join(__dirname, "../uploads");
const partial_path = path.join(__dirname, "../templates/partials");
const views_path = path.join(__dirname, "../templates/views");

//middlewares 
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', views_path);
hbs.registerPartials(partial_path);
app.use(express.static(public_path));
app.use(express.static(newpassword_public_path));
app.use(express.static(favicon_path));
app.use(express.static(upload_path));
app.use(cookieParser());
app.use(loginRouter);



// hbs.registerHelper('token', function() {
//     const jwtToken = req.cookies.jwt;
//     if (jwtToken) {
//         return true;
//     } else {
//         return false;
//     }
// });

app.get('/', (req, res) => {
    res.status(201).render('index');
});

//page not found api
app.get('*', (req, res) => {
    res.status(404).render('pageNotFound');
});

//listen port 
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});