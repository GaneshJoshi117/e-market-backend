const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

//body parser,reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); //cookie parser

const userRoute = require('./routes/userRouter.js');

app.use('/api/v1/users', userRoute);

module.exports = app;
