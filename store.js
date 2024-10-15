// storeJsonFunction

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client();
const BUCKET_NAME = 'jsonbucket12';

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));

    try {
       
        if (!event || !event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No input data provided." }),
            };
        }

        let body;
        // Parse the body to extract the JSON payload
        try {
            body = JSON.parse(event.body); 
        } catch (jsonError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid JSON input.", error: jsonError.message }),
            };
        }

        const timestamp = Date.now();
        const fileName = `file-${timestamp}.json`;

        // Prepare the parameters for the S3 put operation
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(body), 
            ContentType: 'application/json'
        };

        // Create a PutObjectCommand and send it
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                e_tag: data.ETag,
                url: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
            }),
        };
    } catch (error) {
        console.error("Error storing data:", error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};


