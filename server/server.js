import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import {randomBytes} from 'crypto'
import redis from 'redis'
// Module imports
import {getCode} from './codeOps.mjs';
import {fileExists, uploadCodeFile} from './fileOps.mjs'
import {setUpAgent, listMessages, createThread, addMessage} from './agentOps.mjs'

const app = express()
const redisClient = redis.createClient()
redisClient.on('error', (err)=> console.log('redis error:', err))

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('connected to redis')
    } catch(error){
        console.log(error)
        process.exit(1)
    }
}

const PORT = process.env.PORT || 5000

const startServer = async () => {
    await connectRedis();
    app.listen(PORT, () => {
        console.log('listening on port', PORT)
    })
    
}

const getSessionInfo = async (req) => {
    if (!req.headers.cookie) return false
    const cookieString = req.headers.cookie 
    const sessionId = cookieString.replace('sessionId=', '')
    const sessionExists = await redisClient.exists(sessionId)
    if (!sessionExists) return false
    console.log('sesh id:', sessionId)
    const sessionInfoString = await redisClient.get(sessionId)
    const sessionInfo = JSON.parse(sessionInfoString)
    return sessionInfo
}
app.use(express.json())

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with the URL of your frontend application
    credentials: true, // This allows cookies and credentials to be included in cross-origin requests
  };

app.use(cors(corsOptions))

startServer().catch(err => {
    console.log('error starting the server:', err)
})

// should only be called from the landing page i.e. we don't know what repo user wants to work with.
app.post('/create-session', async (req, res) => {
    console.log("request body:", req.body.url) 
    const url = req.body.url 
    try {
        const codeObject = await getCode(url) // this will return the code as a json object in memory
        const assistant = await setUpAgent(codeObject, url)
        const thread = await createThread()
        const messages = await listMessages(thread.id)
        const sessionId = randomBytes(32).toString('hex')
        const sessionData = {
            assistant_id: assistant.id,
            thread_id: thread.id,
            display_url: url
        }
        redisClient.set(sessionId, JSON.stringify(sessionData), { EX: 86400 })
        console.log('set redis session info')
        console.log('got messages:', messages)
        res.cookie('sessionId', sessionId, { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.json({messages: messages, url: url})
    } catch (error) {
        console.log('error:', error)
        res.status(400).json('something went wrong')
    }
})

app.get('/check-session', async (req, res) => {
    console.log('check session:', req.headers.cookie)
    const sessionInfo = await getSessionInfo(req)
    console.log('check session info check:', sessionInfo)
    if (!sessionInfo){
        console.log('no matching session found')
        res.status(400, 'no session found')
    } else {
        console.log('assistantId:', sessionInfo.assistant_id, 'thread id:', sessionInfo.thread_id)
        const messages = await listMessages(sessionInfo.thread_id)
        const url =  sessionInfo.display_url
        console.log(messages.data)
        res.json({messages: messages, url: url})
    }

})

app.post('/send-message', async (req, res) => {
    console.log('message from client:', req.body.message)
    const sessionInfo = await getSessionInfo(req)
    console.log({sessionInfo})
    const newMessages = await addMessage(req.body.message,sessionInfo.assistant_id, sessionInfo.thread_id)
    res.json(newMessages)
})

