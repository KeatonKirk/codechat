import dotenv from 'dotenv'
dotenv.config()
//const axios = require('axios')
import axios from 'axios'
import fs from 'fs'
import express from 'express'
import OpenAI from 'openai'

// Module imports
import * as getCode from './getCode.mjs';


const githubToken = process.env.GITHUB_TOKEN
const app = express()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log('listening on port', PORT)
})


const repoUrl = "https://api.github.com/repos/KeatonKirk/d-stor/contents/" // for testing



app.get('/create', async (req, res) => {
    console.log(req) // need to get the URL from here
    const url = req.body // or something like this

   await getCode.writeFile(url) // replace this with calling imported function
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
const main = async () => {
   await getCode.writeFile(repoUrl)
   //app.close()
}


try {
    main()
} catch (error) {
    if (error.response) {
        // request was made, server responded with status code.
        console.error("request made, error stats:", error.response.status)
        console.error("error data:", error.response.data)
    } else if (error.request) {
        // request was made but no response received
        console.error("request was made but received no response:") // TO DO add error message
    } else {
        // some other kind of error
        console.error("something went wrong:") // TO DO add error message
    }
}
