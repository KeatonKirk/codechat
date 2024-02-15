import dotenv from 'dotenv'
dotenv.config()
import AWS from 'aws-sdk';


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.enve.AWS_SECRET_ACCESS_KEY,
    region: 'us-west' // or whatever the region is
})

const s3 = new AWS.S3();

export async function fileExists(repoUrl){

    const params = {
        Bucket: 'keatons-test-bucket',
        Key: repoUrl
    };

    try {
        await s3.headObject(params).promise()
        return true;
    } catch (err) {
        if (err.code === 'NotFound') {
            return false;
        }
        console.error('Error occurred while checking for file:', err)
        throw err
    }
}

export async function getFile(repoUrl){
    // return the JSON file from AWS
}

export async function uploadCodeFile(file){
    // upload file logic here
    const params = {
        Bucket: 'keatons-test-bucket',
        Key: 'filename',
        Body: file
    }

    try {
        const data = await s3.upload(params).promise()
        console.log('successfully uploaded file')
    } catch (err) {
        console.error('error uploading file:', err)
        throw err
    }
}