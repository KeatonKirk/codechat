import React, {useState} from 'react';
import { ChatItem, MessageBox } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import 'react-chat-elements/dist/main.css';

function LandingPage(props){
    const [url, setUrl] = useState('')

    function onChange(e){
        e.preventDefault()

        setUrl(e.target.value)
    }

    async function onClick(){
        // send the url to the server
        // update state

        console.log('grabbing url from state:', url)
        const body = {
            url: url
        }
        const response = await fetch('http://localhost:5000/create', {
                method: "POST",
                mode: 'cors',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(body)
            })
        const responseData = await response.json()
        console.log({responseData})
    }
    return (
        <div className="input-container">
            <TextField
                id="outlined-basic-emai"
                label="enter a repo URL"
                fullWidth
                className="input-field"
                onChange={onChange}
            />
            <Button onClick={onClick} variant="contained" color="primary" className="send-button">
                Send
            </Button>
        </div>
    )
}

export default LandingPage