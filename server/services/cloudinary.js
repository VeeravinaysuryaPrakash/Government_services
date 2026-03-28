const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'government_services',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    if (file.buffer) {
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    } else if (file.data) {
      // Handle base64 or other formats
      uploadStream.end(Buffer.from(file.data));
    } else {
      reject(new Error('Invalid file format'));
    }
  });
};

module.exports = { uploadImage };

