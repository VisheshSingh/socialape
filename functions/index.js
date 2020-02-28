const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

// GET ALL SCREAMS
app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        const { body, userHandle, createdAt } = doc.data();
        screams.push({
          screamId: doc.id,
          body,
          userHandle,
          createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
});

// CREATE SCREAM
app.post('/scream', (req, res) => {
  let newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then(doc => {
      return res.json({ message: `Document ${doc.id} created sucessfully!` });
    })
    .catch(err => {
      res.status(500).json({ error: err });
      console.log('Error getting document', err);
    });
});

exports.api = functions.https.onRequest(app);
