// RetrieveJsonData
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client();
const bucketName = 'jsonbucket12';

exports.handler = async () => {
    try {
        // List objects in the specified bucket
        const listParams = {
            Bucket: bucketName
        };
        const listCommand = new ListObjectsV2Command(listParams);
        const s3List = await s3.send(listCommand);

        // Create an array of promises to fetch each object's data
        const allDataPromises = s3List.Contents.map(async (file) => {
            const fileParams = {
                Bucket: bucketName,
                Key: file.Key
            };
            const getCommand = new GetObjectCommand(fileParams);
            const fileData = await s3.send(getCommand);
            
            // Convert the stream to a string and parse as JSON
            const data = await streamToString(fileData.Body);
            return JSON.parse(data);
        });

       
        const allData = await Promise.all(allDataPromises);

        return {
            statusCode: 200,
            body: JSON.stringify(allData)
        };
    } catch (error) {
        console.error("Error retrieving JSON data:", error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error retrieving JSON data",
                error: error.message
            })
        };
    }
};

// Helper function to convert the stream to a string
const streamToString = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
};

