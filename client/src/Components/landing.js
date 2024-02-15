import React, {useState} from 'react';
import { ChatItem, MessageBox } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import 'react-chat-elements/dist/main.css';

function LandingPage(props){
    const [url, setUrl] = useState('')
    const [isValid, setIsValid] = useState(true)

    function onChange(e){
        e.preventDefault()
        const value = e.target.value
        const regex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
        setIsValid(regex.test(value))
        setUrl(value)
    }

    async function onClick(){
        // send the url to the server
        // update state

        console.log('grabbing url from state:', url)
        const body = {
            url: url
        }
        try {
            const response = await fetch('http://localhost:5000/create', {
                    method: "POST",
                    mode: 'cors',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(body)
                })

            if (!response.ok){
                throw new Error('error in fetch request')
            }
            const responseData = await response.json()
            props.setCurrUrl(responseData)
            console.log({responseData})
        } catch(error){
            console.log('got to error:', error)
        }
    }
    return (
        <div className="input-container">

            {!isValid ? (

                <TextField
                error
                id="outlined-basic-emai"
                label="enter a repo URL"
                fullWidth
                className="input-field"
                helperText = "Please enter the root URL for a public Repo."
                onChange={onChange}
                />
            ) : (
            <>
            <TextField
                id="outlined-basic-emai"
                label="enter a repo URL"
                fullWidth
                className="input-field"
                onChange={onChange}
            />
            <Button onClick={onClick} variant="contained" color="primary" className="send-button">
                Submit
            </Button>
            </>
            )
            }
        </div>
    )
}

export default LandingPage