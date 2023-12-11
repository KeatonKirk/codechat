require('dotenv').config()
const OpenAI = require("openai");

const axios = require('axios')
const fs = require('fs')
const express = require('express')

const openai = new OpenAI()
const app = express()


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log('listening on port', PORT)
})


const githubToken = process.env.GITHUB_TOKEN

console.log('token we have:', githubToken)
const repoUrl = "https://api.github.com/repos/SqueezeAILab/LLMCompiler/contents/" // for testing

const ignoreFiles = ['package-lock.json']
const ignoreTypes = ['png', 'svg', 'ico']

const getFileContents = async (url) => {
    // this gets called when we hit a file in the searchRepo function.
    console.log('ATTEMPTING FILE DOWNLOAD', url)
    file = await axios.get(url)

    return file.data
}

const searchRepo = async (path) => {
    // recursive function which calls itself when it encounters a directory.
    console.log('attempting repo search!')
    levelData = await axios.get(repoUrl + path)
    // console.log(`level data for path ${path}`, levelData.data)
    let output = {}
    for (let item of levelData.data) {
        // console.log("Item name:", item.name)
        // console.log("Item type:", item.type)
        // console.log('download url at the item level:', item.download_url)
        // console.log(item)
        // store contents if it's a file
        if (item.type == 'file') {
            console.log('i think its a file, checking if its a valid type', item.name);
            let fileType = ''
            for (let i = item.name.length - 1; i >= 0; i--) {
                if (item.name[i] == '.') break
                fileType = item.name[i] + fileType
            }; 

            if (ignoreFiles.includes(item.name) || ignoreTypes.includes(fileType)) {
                console.log('Ignoring file!!', item.name)
                continue
            } else {
                let contents = await getFileContents(item.download_url)
                output[item.name] = contents
            };

        } else if (item.type == 'dir'){
            console.log('I think its a folder, attempting recursive call', repoUrl + item.path)
            let subResults = await searchRepo(item.path)
            output[item.name] = subResults
        }
    }

    return output
}

const createThread = async (assistantId) => {
    // TO DO add create thread logic.
}

const addMessage = async (threadId) => {
    // TO DO add message logic.
}

const createAssistant = async () => {
    let jsonObj = await searchRepo('/')
    fs.writeFile('json_temp/repoContents.json', JSON.stringify(jsonObj, null, 2), err => {
        if (err){
            console.log('error writing file:', err)
        } else {
            console.log('file write successful!')
        }
    })

    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
        file: fs.createReadStream('json_temp/repoContents.json'),
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

app.get('/repo', async (req, res) => {
    await createAssistant()
    res.send('Request Successful')
})


// TO DO Refactor to best practice node/express setup.
const main = async () => {
   await createAssistant()
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
