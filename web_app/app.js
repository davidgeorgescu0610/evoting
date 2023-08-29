const express = require('express');
const cors = require('cors');
const https = require('https')
const dotenv = require('dotenv');
const db = require('./models');
const cookieParser = require('cookie-parser');


const app = express();
dotenv.config();

app.use(express.static('frontend'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(cookieParser());

app.use('/', require('./routes/router'));

const sslOptions = {
    key: process.env.PRIVATE_KEY,
    cert: process.env.CERTIFICATE
};

db.sequelize.sync().then(() => {
    https.createServer(sslOptions, app).listen(process.env.PORT, () => console.log('app is running'));
});
