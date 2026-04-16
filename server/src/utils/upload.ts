import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import mime from 'mime-types';

// Initialize S3 client with custom configuration
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
  maxAttempts: 3, // Retry up to 3 times
  
});


const uploadFileToS3 = async (fileBuffer: Buffer | ReadableStream, fileName: string): Promise<string> => {
  try {
    const fileNameToLoad = `${fileName}`;
    const contentType = mime.lookup(fileName) || 'application/octet-stream';
    const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

    // Use multipart upload for large files
    const upload = new Upload({
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
    await upload.done();

    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileNameToLoad}`;
    console.log(`File uploaded successfully: ${fileUrl}`);
    return fileUrl;
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    throw new Error(`S3 Upload failed: ${error.message}`);
  }
};

export {
  uploadFileToS3
}