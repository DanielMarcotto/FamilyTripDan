"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const tslib_1 = require("tslib");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const mime_types_1 = tslib_1.__importDefault(require("mime-types"));
// Initialize S3 client with custom configuration
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3, // Retry up to 3 times
});
const uploadFileToS3 = (fileBuffer, fileName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileNameToLoad = `${fileName}`;
        const contentType = mime_types_1.default.lookup(fileName) || 'application/octet-stream';
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        // Use multipart upload for large files
        const upload = new lib_storage_1.Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: fileNameToLoad,
                Body: fileBuffer,
                ContentType: contentType,
            },
            // Configure part size (5MB) and concurrency
            partSize: 5 * 1024 * 1024, // 5MB parts
            queueSize: 4, // 4 concurrent uploads
        });
        // Perform the upload
        yield upload.done();
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileNameToLoad}`;
        console.log(`File uploaded successfully: ${fileUrl}`);
        return fileUrl;
    }
    catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error(`S3 Upload failed: ${error.message}`);
    }
});
exports.uploadFileToS3 = uploadFileToS3;
