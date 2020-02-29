const functions = require('firebase-functions');
const express = require('express');
const app = express();

const { getAllScreams, createScream } = require('./routes/screams');
const { signup, login } = require('./routes/auth');

const { FBAuth } = require('./utils/fbAuth');

app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, createScream);

app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
