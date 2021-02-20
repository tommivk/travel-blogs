const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage({ keyFilename: process.env.FB_CREDENTIALS });
const bucketName = process.env.BUCKET_NAME;

const uploadImage = async (file, userID, path, type) => new Promise((resolve, reject) => {
  const maxSize = 2 * 1024 * 1024;
  const accessToken = uuidv4();

  if (!file) {
    reject('no file');
  }

  if (file.buffer.byteLength >= maxSize) {
    reject({ name: 'ImageUploadValidationError', message: 'Maximum allowed file size is 2MB' });
  }

  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
    reject({ name: 'ImageUploadValidationError', message: 'Only JPG, JPEG and PNG file types allowed' });
  }

  const newFileName = (type && type === 'avatar') ? 'avatar' : uuidv4();
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const fileUpload = bucket.file(`${path}${userID}/${newFileName}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: accessToken,
      },
    },
  });

  blobStream.on('error', (error) => {
    reject(error);
  });

  blobStream.on('finish', () => {
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(`${path}${userID}/${newFileName}`)}?alt=media&token=${accessToken}`;
    resolve({ imgURL: url, firebaseID: newFileName });
  });

  blobStream.end(file.buffer);
});

module.exports = uploadImage;
