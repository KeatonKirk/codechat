import React, {useState, useRef, useEffect} from 'react';
import { ChatItem, MessageBox } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import 'react-chat-elements/dist/main.css';
import './chat-mui.css'

function ChatWindow(props) {
    const [message, setMessage] = useState('')
    const chatEndRef = useRef(null)
    // TO DO load up actual messages
    // set position based on the role in the message object
    // const messages = [
    //     { position: 'left', type: 'text', text: 'Hello!', date: new Date() },
    //     { position: 'right', type: 'text', text: 'Hey there!', date: new Date() }
    // ]

    async function onChange(e) {
        e.preventDefault()
        let value = e.target.value
        setMessage(value)
    }
    async function onClick(){
        console.log('gonna send this:', message)
        const body = {
            message: message
        }
        const response = await fetch('http://localhost:5000/send-message', {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const responseData = await response.json()
        console.log('data back from send message attempt:', responseData)
        props.setMessages(responseData)
        setMessage('')
    }
    //console.log('messages from parent:', props.messages)

    useEffect(()=>{
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },[props.messages])
    return(
        <div className='chat-window'>
            <div className='chat-body'>
                {
                    props.messages.map((msg, index) => {
                        const messageText = msg.content[0].text.value
                        //console.log('chat window, individual msg:', msg.content[0].text)
                        const position = msg.role === 'user' ? 'right' : 'left';
                        const title = msg.role === 'user' ? 'you' : 'CodeChat'
                        return(
                            <MessageBox
                            title ={title}
                            key={index}
                            position={position}
                            type={'text'}
                            text={messageText}
                            />

                        )
                    })
                }

            </div>
            <div className="input-container">
                <TextField
                    id="outlined-basic-emai"
                    label="ask a question"
                    fullWidth
                    className="input-field"
                    onChange={onChange}
                />
                <Button onClick={onClick} variant="contained" color="primary" className="send-button">
                    Send
                </Button>
            </div>

        </div>
    )
}

export default ChatWindow