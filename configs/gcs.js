const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GCS_KEY_PATH
})

async function createBucket(bucketName) {
  let bucket = null;
  try {
    bucket = await storage.bucket(bucketName);
    bucket.makePublic();
  } catch (e) {
    const bucket = await storage.createBucket(bucketName);
    bucket.makePublic();
    console.log(e.message);
  }
}

// createBucket(process.env.GCS_BUCKET_NAME)
//   .then(() => {
//     console.log("Bucket created successfully created");
//   })

module.exports = storage;