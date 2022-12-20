
const fcm_admin = require("firebase-admin");

const serviceAccount = require("../store-backend-project-firebase-adminsdk.json"); 
// console.log("serviceAccount",serviceAccount);


fcm_admin.initializeApp({
  // credential: fcm_admin.credential.cert(process.env.FIREBASE_KEY_PATH)
  credential: fcm_admin.credential.cert(serviceAccount),
  databaseURL: "https://store-backend-default-rtdb.asia-southeast1.firebasedatabase.app"
});



module.exports = fcm_admin;