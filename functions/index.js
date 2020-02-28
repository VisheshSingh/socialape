const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

exports.getScreams = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection('screams')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push(doc.data());
      });
      return res.json(screams);
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
});

exports.createScream = functions.https.onRequest((req, res) => {
  if (req.method != 'POST') {
    return res.status(400).json({ error: 'Method not allowed' });
  }
  let newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
