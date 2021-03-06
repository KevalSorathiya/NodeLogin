const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DATABASE_NAME}`, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, })
    .then(() => {
        console.log("database connected successfully");
    }).
catch((error) => {
    console.log(error);
});