const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 8000;
require('./db/connection');
const path = require('path');
const loginRouter = require('./router/loginRouter');
const hbs = require('hbs');


//all static path
const public_path = path.join(__dirname, "../public");
const partial_path = path.join(__dirname, "../templates/partials");
const views_path = path.join(__dirname, "../templates/views");

//middlewares 
app.use(express.static(public_path));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', views_path);
hbs.registerPartials(partial_path);

app.use(loginRouter);

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