import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'

// Module imports
import searchRepo from './getCode.mjs';
import {fileExists, uploadCodeFile, getFile} from './fileOps.mjs'

const githubToken = process.env.GITHUB_TOKEN
const app = express()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log('listening on port', PORT)
})
app.use(express.json())
app.use(cors())

// const repoUrl = "https://api.github.com/repos/KeatonKirk/d-stor/contents/" // for testing

app.post('/create', async (req, res) => {
    console.log("request body:", req.body) // need to get the URL from here
    const url = req.body.url // or something like this

    try {
        const fileExists = await fileExists(url)
        if (fileExists){
            const file = await getFile(url)
            // then set up assistant
        } else {
            const [userName, repoName] = url.replace('https://github.com/', '').split('/')
            const urlString = `https://api.github.com/repos/${userName}/${repoName}/contents/`
            const file = await searchRepo(urlString) // only need to do this if file doesn't already exist in s3
            await uploadCodeFile(file)
        }
        res.send('got the code, nice!')
    } catch {
        res.status(400).send('something went wrong')
    }
})

const createThread = async (assistantId) => {
    // TO DO add create thread logic.
}

const addMessage = async (threadId) => {
    // TO DO add message logic.
}


app.get('/repo', async (req, res) => {
    await getCode.writeFile(req.body) // or something
    res.send('Request Successful')
})


// TO DO Refactor to best practice node/express setup.
// const main = async () => {
//    await getCode.writeFile(repoUrl)
//    //app.close()
// }


// try {
//     main()
// } catch (error) {
//     if (error.response) {
//         // request was made, server responded with status code.
//         console.error("request made, error stats:", error.response.status)
//         console.error("error data:", error.response.data)
//     } else if (error.request) {
//         // request was made but no response received
//         console.error("request was made but received no response:") // TO DO add error message
//     } else {
//         // some other kind of error
//         console.error("something went wrong:") // TO DO add error message
//     }
// }
