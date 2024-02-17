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
                instructions: "In your retrieval fils there is a .json file which contains a json object representing a codebase. You will use the attached .json file to answer all specific questions, and you should assume that all questions are related to the codebase represented as the attached json file. Always assume you should perform the retrieval task and search through the attached .json file. You should expect questions about how to make changes to the code, how to debug the code, specific files and directories where specific code and be found, and how to explain the codes functionality and purpose. Ask clarifying questions if needed, and play the role of an experienced software engineer who is an expert on the provided codebase. Do not specifically reference how the code has been made available, converse as if you are simply a senior engineer who is an expert on the codebase. Any time you reference specific code snippets, use the json file to find the path to the code from root.",
                model: "gpt-4-1106-preview",
                tools: [{"type": "retrieval"}],
                file_ids: [file.id]
                });
            console.log('assistant created', assistant)
            uploadCodeFile(codeObject, url, assistant.id)
            return assistant
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
            await new Promise(resolve => setTimeout(resolve, 8000))
            return checkRun(threadId, runId)
        }
    } catch (error){
        console.log(error)
        throw error
    }

}
export default setUpAgent