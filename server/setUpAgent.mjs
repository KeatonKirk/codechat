import OpenAI from 'openai'

const openai = new OpenAI()

const createAssistant = async () => {

    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
        file: fs.createReadStream('/serverjson_temp/repoContents.json'),
        purpose: "assistants",
    });

    const assistant = await openai.beta.assistants.create({
        instructions: "You are a senior engineer with deep expertise on the code base represented in the attached file. Your primary goal is to provide specific answers about the codebase in the attached file. The code is represented as a .json file. Always perform knowledge retrieval and reference the document in your knowledge base as opposed to providing general answers",
        model: "gpt-4-1106-preview",
        tools: [{"type": "retrieval"}],
        file_ids: [file.id]
        });

    // TO DO remove the file from storage and maybe add to a database.
    // - could maybe store it directly as JSON and then be able to grab parts of it
    // - maybe also store the assistant id?

}