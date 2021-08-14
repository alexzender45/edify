const multer = require('multer');
const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION, FILE_SIZE, UPLOAD_TIMEOUT, CONNECTION_TIMEOUT } = require('../core/config');
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    maxRetries: 3,
    httpOptions: {
        timeout: Number(UPLOAD_TIMEOUT),
        connectTimeout: Number(CONNECTION_TIMEOUT)
    }
});

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '')
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: FILE_SIZE
    }
}).single('image');

module.exports = { s3, upload }