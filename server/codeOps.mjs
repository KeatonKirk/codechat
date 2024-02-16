import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'
import {fileExists, uploadCodeFile} from './fileOps.mjs'
const ignoreFiles = ['package-lock.json']
const ignoreTypes = ['png', 'svg', 'ico', 'jpg', 'jpeg', 'gif', 'zip', 'rar', '7z', 'mp3', 'wav', 'mp4', 'avi', 'pdf', 'doc', 'git', 'svn', 'jar', 'ipynb', 'sh']


const getFileContents = async (url) => {
    // this gets called when we hit a file in the searchRepo function.
    console.log('ATTEMPTING FILE DOWNLOAD', url)
    const token = process.env.GITHUB_TOKEN
    let file = await axios.get(url, {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    
    return file.data
}

const searchRepo = async (repoUrl, path='') => {
    // recursive function which calls itself when it encounters a directory.
    console.log('attempting repo search!', repoUrl + path)
    const token = process.env.GITHUB_TOKEN
    let levelData = await axios.get(repoUrl + path, {
        headers: {
            'Authorization': `token ${token}`
        }
    }) // ** API call
    
    let output = {}
    
    try{
        
        for (let item of levelData.data) {
            
            // store contents if it's a file
            if (item.type == 'file') {
                console.log('i think its a file, checking if its a valid type', item.name);
                let fileType = ''
                for (let i = item.name.length - 1; i >= 0; i--) {
                    // iterate through the item and get it's suffix
                    if (item.name[i] == '.') break
                    fileType = item.name[i] + fileType
                }; 
                
                if (ignoreFiles.includes(item.name) || ignoreTypes.includes(fileType)) {
                    // don't want to log this file
                    console.log('Ignoring file!!', item.name)
                    continue
                } else {
                    let contents = await getFileContents(item.download_url)
                    output[item.name] = contents
                };
                
            } else if (item.type == 'dir'){
                console.log('I think its a folder, attempting recursive call', repoUrl + item.path)
                let subResults = await searchRepo(repoUrl, item.path)
                output[item.name] = subResults
            }
        }
    } catch (error) {
        console.log('search error:', error)
    }
    
    return output
}

export async function getCode(url){
    try {
        const codeFile = await fileExists(url)
        if (codeFile){
            const objectContent = codeFile.Body.toString('utf-8'); // Convert buffer to string
            const jsonObject = JSON.parse(objectContent); // Parse the string as JSON
            return jsonObject
        } else {
            const [userName, repoName] = url.replace('https://github.com/', '').split('/')
            const urlString = `https://api.github.com/repos/${userName}/${repoName}/contents/`
            const code = await searchRepo(urlString) // only need to do this if file doesn't already exist in s3
            return code
        }
    } catch (error) {
        console.log('error:', error)
    }
}
