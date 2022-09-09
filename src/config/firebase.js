const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const mongoose = require('mongoose');
const serviceAccount = require('../keys/serviceAccountKey.json');
const { firebaseConfig } = require('./config');
const { queryTicketService } = require('../services');

const firebase = initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REALTIME_DATABASE_URL,
});

const app = admin.messaging();
const db = admin.database();
const messaging = admin.messaging();
const auth = admin.auth();
const storage = admin.storage();
db.ref('/messagingEvents').set({});

const createUpdateQueryTicket = async (snapshot) => {
  const value = snapshot.val();
  console.log('------value-------', value);
  if (value) {
    const { queryId, userId, messages, isNew, title, description, type, orderId, placeId } = value;
    if (isNew) {
      await queryTicketService.createQueryTicket({
        firebaseRealtimeChatId: queryId,
        userId,
        messages: messages.reverse().map((message) => ({ ...message, createdAt: new Date(message._id) })),
        title,
        description,
        type,
        orderId,
        placeId,
      });
    } else {
      await queryTicketService.updateQueryTicket(
        {
          firebaseRealtimeChatId: queryId,
          userId: mongoose.Types.ObjectId(userId),
        },
        {
          $push: { messages: messages[0] },
        }
      );
    }
  }
};

db.ref('/messagingEvents').on('value', createUpdateQueryTicket);

module.exports = {
  app,
  auth,
  storage,
  messaging,
  admin,
  db,
  // firebaseAuth,
  firebase,
};
