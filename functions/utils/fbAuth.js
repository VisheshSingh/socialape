const { db, admin } = require('../utils/admin');

exports.FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split(' ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error({ error: err });
      return res.status(403).json({ error: err });
    });
};
