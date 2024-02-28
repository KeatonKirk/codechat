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
        const apiUrl = process.env.REACT_APP_API_URL
        console.log('grabbing url from state:', url)
        const body = {
            url: url
        }

        props.setFetching(true)
        try {
            const response = await fetch(`${apiUrl}/create-session`, {
                    method: "POST",
                    credentials: 'include',
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
            console.log({responseData})
            props.setMessages(responseData.messages)
            props.setSession(true)
            props.setUrl(responseData.url)
            props.setFetching(false)
        } catch(error){
            console.log('repo input error:', error)
        }
    }

    console.log(props.url)
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
                label={props.url ? 'try a different repo!' : 'enter a repo url'}
                fullWidth
                className="input-field"
                onChange={onChange}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !props.fetching) {
                        e.preventDefault(); 
                        onClick(); 
                    }
                }}
            />
            <Button disabled={props.fetching} onClick={onClick} variant="contained" color="primary" className="send-button">
                Submit
            </Button>
            </>
            )
            }
        </div>
    )
}

export default LandingPage