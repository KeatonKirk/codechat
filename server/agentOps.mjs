import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import {fileExists, uploadCodeFile} from './fileOps.mjs'
const openai = new OpenAI()

async function agentExists(url){
    console.log('in agentExists')
    try {
        let object = await fileExists(url) // returns false or the s3 object

        if (object) {
            let assistantId = object.Metadata.assistant_id
            console.log({assistantId})
            let assistant = await openai.beta.assistants.retrieve(assistantId)
            return assistant
        } else {
            console.log('couldnt find agent')
            return false
        }
    } catch(error) {
        console.log('error trying to retrieve the assistant', error)
    }


}

export async function setUpAgent (codeObject, url) {
    let agent = await agentExists(url)
    let tempFilePath;
    if (agent){ //returns the assistant id if it the agent exists.
        console.log('found existing agent, returning the whole assistant object')
        return agent
    } else {
        try {
            console.log('creating file')
            const encodedUrl = encodeURIComponent(url)
            const jsonString = JSON.stringify(codeObject);
            tempFilePath = path.join('json_temp', `${encodedUrl}.json`);
            console.log('attempting local file write')
            fs.writeFileSync(tempFilePath, jsonString);
    
            // Upload a file with an "assistants" purpose
            console.log('attempting local file read')
            const fileStream = fs.createReadStream(tempFilePath);
            const file = await openai.files.create({
                file: fileStream,
                purpose: "assistants",
            });
            console.log('file created')
    
            const assistant = await openai.beta.assistants.create({
                description: "Experienced software engineer that will help provide engineering best practices and specific code instructions based on a provided json object representing a codebase.",
                instructions: "You are a senior engineer with deep expertise on the code base represented in the attached file. Your primary goal is to provide specific answers about the codebase in the attached file. The code is represented as a .json file. Always perform knowledge retrieval and reference the document in your knowledge base as opposed to providing general answers",
                model: "gpt-4-1106-preview",
                tools: [{"type": "retrieval"}],
                file_ids: [file.id]
                });
            console.log('assistant created', assistant)
            uploadCodeFile(codeObject, url, assistant.id)
            return assistant
            // TO DO remove the file from storage and maybe add to a database.
            // - could maybe store it directly as JSON and then be able to grab parts of it
            // - maybe also store the assistant id?
        } catch(error) {
            console.log(error)
            throw error
        } finally {
            fs.unlinkSync(tempFilePath)
            console.log('successfully deleted file')
        }
    }
    

}

export async function listMessages(threadId){
    let threadMessages = await openai.beta.threads.messages.list(threadId, {order: 'asc'})
    console.log('messages from list func:', threadMessages)
    return threadMessages.data
}

export async function createThread () {
    const thread = await openai.beta.threads.create()
    return thread
}


export async function addMessage(message, assistantId, threadId){
    console.log('agent ops add message:', message, assistantId, threadId)
    const threadMessage = await openai.beta.threads.messages.create(
        threadId,
         {role: 'user', content: message}
        );
    console.log('message added', threadMessage)

    const run = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId}
        )

    await checkRun(threadId, run.id)

    const updatedMessages = await openai.beta.threads.messages.list(threadId, {order: 'asc'})
    console.log('thread after sending message:', updatedMessages.data)
    return updatedMessages.data
}

// helpers, not exported
async function checkRun(threadId, runId){

    try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId)

        if (run.status === 'completed'){
            console.log('run completed')
            return run
        } else if (run.status === 'failed'){
            throw new Error('run failed')
        } else {
            console.log('run still working, status:', run.status)
            await new Promise(resolve => setTimeout(resolve, 3000))
            return checkRun(threadId, runId)
        }
    } catch (error){
        console.log(error)
        throw error
    }

}
export default setUpAgent