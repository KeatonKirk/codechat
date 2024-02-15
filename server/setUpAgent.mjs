import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI()

export async function setUpAgent (inputFile, url) {
    let tempFilePath;
    try {
        console.log('creating file')
        const encodedUrl = encodeURIComponent(url)
        const jsonString = JSON.stringify(inputFile);
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
            instructions: "You are a senior engineer with deep expertise on the code base represented in the attached file. Your primary goal is to provide specific answers about the codebase in the attached file. The code is represented as a .json file. Always perform knowledge retrieval and reference the document in your knowledge base as opposed to providing general answers",
            model: "gpt-4-1106-preview",
            tools: [{"type": "retrieval"}],
            file_ids: [file.id]
            });
        console.log('assistant created', assistant)
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

export default setUpAgent