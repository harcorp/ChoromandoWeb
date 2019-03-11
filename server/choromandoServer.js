let express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  https = require('https'),
  fs = require('fs'),
  admin = require('firebase-admin');

const serviceAccount = require('./choromando');
let port = process.env.PORT || 7171;
const SSL_SERVER = true;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://choromando-ba719.firebaseio.com'
});

let db = admin.firestore();
db.settings({timestampsInSnapshots: true});
let usersRef = db.collection('users');
let codesRef = db.collection('codes');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

app.use(morgan('dev'));

app.get('/', (req, res) => {
  // res.send('Welcome to the home page');
  res.send('die 1');
});

let apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  next();
});

apiRouter.get('/', (req, res) => {
  res.json({
    message: 'woah check out this json'
  });
});

apiRouter.route('/code/:code')
  .get((req, res) => {
    let code = req.params.code;
    if (code) {
      codesRef.where('code', '==', code).limit(1).get()
        .then(snap => {
          if (snap.size > 0) {
            snap.forEach(code => {
              let codigo = code.data();
              if (codigo.uidUser === null) {
                res.json({
                  codigo: codigo,
                  id: code.id,
                });
              } else {
                res.status(500).send("not exist");
              }
            });

          } else {
            res.status(500).send("not exist");
          }
        });
    }
  });


apiRouter.route('/users/register')
  .post((req, res) => {
    let usuario = req.body.usuario;
    let codigo = req.body.codigo;
    codesRef.where('code', '==', codigo).limit(1).get()
      .then(snap => {
        if (snap.size > 0) {
          usersRef.doc(usuario.uid).get()
            .then(snapshot => {
              let user = snapshot.data();
              if (user === undefined) {
                snap.forEach(code => {
                  let codigo = code.data();
                  if (codigo.uidUser === null) {
                    let newUser = {
                      uid: usuario.uid,
                      displayName: usuario.displayName,
                      registerDate: new Date(),
                      updateDate: new Date(),
                      uidCode: code.id,
                      role: 1,
                      email: usuario.email
                    };
                    let batch = db.batch();
                    let userDoc = usersRef.doc(usuario.uid);
                    batch.set(userDoc, newUser);
                    let codeDoc = codesRef.doc(code.id);
                    batch.set(codeDoc, {
                      uidUser: newUser.uid,
                      updateDate: new Date(),
                      activateDate: new Date()
                    }, {merge: true});
                    batch.commit().then(r => {
                      res.status(200).json('correct-creation');
                    }).catch(error => {
                      handleError(res, error.message, 'Failed');
                    });
                  } else {
                    res.status(500).json({
                      error: 'code/other-user-code'
                    });
                  }
                });
              } else {
                res.status(200).json({
                  message: 'user/user-registered'
                });
              }
            });
        } else {
          res.status(500).json({
            error: 'code/not-exist'
          });
        }
      });
  });

apiRouter.route('/user/registerUnity')
  .post((req, res) => {
    let user = req.body;
    let newUser = {
      uid: user.uid,
      displayName: user.displayName,
      registerDate: new Date(),
      updateDate: new Date(),
      uidCode: user.uidCode,
      role: 1,
      email: user.email
    };
    let batch = db.batch();
    let userDoc = usersRef.doc(user.uid);
    batch.set(userDoc, newUser);
    let codeDoc = codesRef.doc(user.uidCode);
    batch.set(codeDoc, {
      uidUser: newUser.uid,
      updateDate: new Date(),
      activateDate: new Date()
    }, {merge: true});
    batch.commit().then(r => {
      res.json('correct-creation');
    }).catch(error => {
      handleError(res, error.message, 'Failed');
    });
  });


apiRouter.route('/user/:uid')
  .get((req, res) => {
    let uid = req.params.uid;
    if (uid) {
      usersRef.where('uid', '==', uid).get()
        .then(snapshot => {
          res.json(snapshot.size);
        })
    }
  });

apiRouter.route('/users')
  .get((req, res) => {
    let documentos = [];
    usersRef.where('role', '==', 1).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          documentos.push(doc.data());
        });
        res.json(documentos);
      })
  })
  .post((req, res) => {
    let newUser = req.body;
    admin.auth().createUser({
      email: newUser.email,
      displayName: `${newUser.firstName} ${newUser.lastName}`,
      password: newUser.matching_passwords.password,
      disabled: false
    }).then(respuesta => {
      newUser.matching_passwords = null;
      newUser.uid = respuesta.uid;
      newUser.registerDate = new Date();
      newUser.updateDate = new Date();
      let batch = db.batch();
      let userDoc = usersRef.doc(respuesta.uid);
      batch.set(userDoc, newUser);
      if (newUser.uidCode) {
        let codeDoc = codesRef.doc(newUser.uidCode);
        batch.set(codeDoc, {
          uidUser: newUser.uid,
          updateDate: new Date(),
          activateDate: new Date()
        }, {merge: true});
      }
      batch.commit().then(r => {
        res.json(r);
      }).catch(error => {
        handleError(res, error.message, 'Failed');
      });
    }).catch(error => {
      handleError(res, error.message, 'Failed', error.code);
    })
  });

apiRouter.route('/users/editar/:uid')
  .post((req, res) => {
    let uid = req.params.uid;
    let user = req.body;
    admin.auth().updateUser(uid, {
      email: user.email,
      displayName: `${user.firstName} ${user.lastName}`
    }).then(respuesta => {
      user.updateDate = new Date();
      usersRef.doc(uid).set(user, {
        merge: true
      }).then(r => {
        res.json(r);
      }).catch(error => {
        handleError(res, error.message, 'Failed');
      });
    }).catch(error => {
      handleError(res, error.message, 'Failed', error.code);
    });
  });

apiRouter.route('/users/:uid')
  .delete((req, res) => {
    let uid = req.params.uid;
    let batch = db.batch();
    usersRef.doc(uid).get()
      .then(doc => {
        if (doc.exists) {
          if (doc.data().uidCode) {
            let codeRef = codesRef.doc(doc.data().uidCode);
            batch.set(codeRef, {
              uidUser: null,
              updateDate: new Date(),
              activateDate: null
            }, {merge: true});
            let userRef = usersRef.doc(uid);
            batch.delete(userRef);

            batch.commit().then(r => {
              admin.auth().deleteUser(uid)
                .then(respuesta => {
                  res.json({
                    message: 'Eliminado correctamente'
                  });
                }).catch(error => {
                handleError(res, e.message, 'Failed', e.code);
              });
            })
              .catch(error => {
                handleError(res, e.message, 'Failed');
              })
          } else {
            usersRef.doc(uid).delete().then(r => {
              admin.auth().deleteUser(uid)
                .then(respuesta => {
                  res.json({
                    message: 'Eliminado correctamente'
                  });
                }).catch(error => {
                handleError(res, e.message, 'Failed', e.code);
              });
            })
          }
        }
      });
  });

app.use('/api', apiRouter);

if (SSL_SERVER) {
  let sslOptions = {
    key: fs.readFileSync('./encryption/privkey.pem'),
    cert: fs.readFileSync('./encryption/cert.pem'),
    ca: fs.readFileSync('./encryption/chain.pem')
  };
  https.createServer(sslOptions, app).listen(port);
} else {
  app.listen(port);
}
console.log('port: ', port);

function handleError(res, reason, message, fireCode) {
  console.log("ERROR: " + reason);
  res.status(500).json({
    "error": fireCode
  });
}
