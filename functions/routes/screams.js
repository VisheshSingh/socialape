const { db } = require('../utils/admin');

exports.getAllScreams = (req, res) => {
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
};

exports.createScream = (req, res) => {
  let newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
};
