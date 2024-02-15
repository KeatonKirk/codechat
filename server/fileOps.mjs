import dotenv from 'dotenv'
dotenv.config()
import AWS from 'aws-sdk';


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2' // or whatever the region is
})

const s3 = new AWS.S3();

export async function fileExists(repoUrl){
    // checks if the file exists
    console.log('in fileOps/fileExists')
    const encodedUrl = encodeURIComponent(repoUrl) + '.json'
    const params = {
        Bucket: 'keatons-test-bucket',
        Key: encodedUrl
    };

    try {
        await s3.headObject(params).promise()
        const objectData = await s3.getObject(params).promise()
        console.log('found file')
        return objectData; // return the file instead
    } catch (err) {
        if (err.code === 'NotFound') {
            console.log('file not found')
            return false;
        }
        console.error('Error occurred while checking for file:', err)
        throw err
    }
}

export async function uploadCodeFile(file, url){
    // upload file logic here
    const encodedUrl = encodeURIComponent(url) + '.json'
    const params = {
        Bucket: 'keatons-test-bucket',
        Key: encodedUrl,
        Body: JSON.stringify(file),
        ContentType: 'application/json'
    }

    try {
        await s3.upload(params).promise()
        console.log('successfully uploaded file')
    } catch (err) {
        console.error('error uploading file:', err)
        throw err
    }
}