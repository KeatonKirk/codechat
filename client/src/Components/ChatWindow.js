import React, {useState} from 'react';
import { ChatItem, MessageBox } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import 'react-chat-elements/dist/main.css';
import './chat-mui.css'

function ChatWindow(props) {

    const messages = [
        { position: 'left', type: 'text', text: 'Hello!', date: new Date() },
        { position: 'right', type: 'text', text: 'Hey there!', date: new Date() }
    ]

    return(
        <div className='chat-window'>
            <div className='chat-body'>
                {
                    messages.map((msg, index) => {
                        return(
                            <MessageBox
                            key={index}
                            position={msg.position}
                            type={msg.type}
                            text={msg.text}
                            date={msg.date}
                            />

                        )
                    })
                }

            </div>
            <div className="input-container">
                <TextField
                    id="outlined-basic-emai"
                    label="enter a repo URL"
                    fullWidth
                    className="input-field"
                />
                <Button variant="contained" color="primary" className="send-button">
                    Send
                </Button>
            </div>
        </div>
    )
}

export default ChatWindow