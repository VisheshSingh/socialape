const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: 'AIzaSyBho0gRpfAeJDhTYTQ0PLBF3Xt00jzPIO4',
  authDomain: 'socialape-bde9c.firebaseapp.com',
  databaseURL: 'https://socialape-bde9c.firebaseio.com',
  projectId: 'socialape-bde9c',
  storageBucket: 'socialape-bde9c.appspot.com',
  messagingSenderId: '1076908125187',
  appId: '1:1076908125187:web:fa341be5e9216e3ac93236',
  measurementId: 'G-8HNMJZSQ27'
};

admin.initializeApp();
const app = express();
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

// GET ALL SCREAMS
app.get('/screams', (req, res) => {
  db.collection('screams')
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
  db.collection('screams')
    .add(newScream)
    .then(doc => {
      return res.json({ message: `Document ${doc.id} created sucessfully!` });
    })
    .catch(err => {
      res.status(500).json({ error: err });
      console.log('Error getting document', err);
    });
});

const isEmpty = field => {
  if (field.trim() === '') return true;
  return false;
};

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  return false;
};

// SIGNUP
app.post('/signup', (req, res) => {
  let newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // VALIDATE DATA
  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Email is not valid';
  }

  if (isEmpty(newUser.password)) {
    errors.password = 'Password cannot be empty';
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = 'Handle must not be empty';
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Password must match';
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  // CREATE USER DOC AND ISSUE A TOKEN
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ message: 'User already exists 🕵️‍♂️' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => res.status(201).json({ token }))
    .catch(function(error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/email-already-in-use') {
        return res.status(400).json({ message: 'Email already exists!' });
      }
      return res.status(500).json({ error: errorCode, errorMessage });
    });
});

// LOGIN
app.post('/login', (req, res) => {
  let user = {
    email: req.body.email,
    password: req.body.password
  };

  // VALIDATE DATA
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(user.email)) {
    errors.email = 'Email is not valid';
  }

  if (isEmpty(user.password)) {
    errors.password = 'Password cannot be empty';
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => data.user.getIdToken())
    .then(token => res.status(200).json({ token }))
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        return res.status(403).json({ message: 'Forbidden access 😡' });
      }
      return res.status(500).json({ error: errorCode, errorMessage });
    });
});

exports.api = functions.https.onRequest(app);
