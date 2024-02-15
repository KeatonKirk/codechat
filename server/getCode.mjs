import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'

const ignoreFiles = ['package-lock.json']
const ignoreTypes = ['png', 'svg', 'ico']

const getFileContents = async (url) => {
    // this gets called when we hit a file in the searchRepo function.
    console.log('ATTEMPTING FILE DOWNLOAD', url)
    const token = process.env.GITHUB_TOKEN
    console.log({token})
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
    console.log({token})
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

// export const writeFile = async (repoUrl) => {
//     try {
//         let jsonObj = await searchRepo(repoUrl, '/');
        
//         await fs.writeFile(`./json_temp/repoContents.json`, JSON.stringify(jsonObj, null, 2));
//         console.log('File write successful!');
//     } catch (err) {
//         console.log('Error writing file:', err);
//         throw err; // Propagate error
//     }
// }

export default searchRepo;