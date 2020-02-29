const { db } = require('../utils/admin');
const fbConfig = require('../utils/fbconfig');
const firebase = require('firebase');
firebase.initializeApp(fbConfig);

const {
  validateSignupDetails,
  validateLoginDetails
} = require('../utils/validators');

exports.signup = (req, res) => {
  let newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignupDetails(newUser);

  if (!valid) return res.status(400).json({ errors });

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
};

exports.login = (req, res) => {
  let user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginDetails(user);

  if (!valid) return res.status(400).json({ errors });

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
};
