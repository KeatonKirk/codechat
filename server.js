const axios = require('axios')
require('dotenv').config()

const githubToken = process.env.GITHUB_TOKEN

console.log('token we have:', githubToken)
const repoUrl = "https://api.github.com/repos/KeatonKirk/d-stor"

axios.get(repoUrl, {
    headers: {
        'Authorization': 'token ${githubToken}'
    }
})
.then(response => {
    console.log("repo data:", response.data)
})
.catch( error => {
    if (error.response) {
        // request was made, server responded with status code.
        console.error("request made, error stats:", error.response.status)
        console.error("error data:", error.response.data)
    } else if (error.request) {
        // request was made but no response received
        console.error("request was made but received no response:", error.request)
    } else {
        console.error("something went wrong:", error.message)
    }
})