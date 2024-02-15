import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import fs from 'fs'
// Module imports
import {getFile} from './codeOps.mjs';
import {fileExists, uploadCodeFile} from './fileOps.mjs'
import {setUpAgent} from './setUpAgent.mjs'
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
    console.log("request body:", req.body.url) 
    const url = req.body.url 
    /* TO DO
        I'd like for this create function to basically look like
            get code stuff
            set up agent
            return response
        and then let the client set up separate requests for threads and messages and such.
        this endpoint should just get the ball rolling - initiate the agent process 

    */
    try {
        const codeFile = await getFile(url)
        console.log('got codefile')
       const assistant = await setUpAgent(codeFile, url)
        res.json(assistant.id)
    } catch (error) {
        console.log('error:', error)
        res.status(400).json('something went wrong')
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
