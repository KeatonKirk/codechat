import React, {useState, useRef, useEffect} from 'react';
import { ChatItem, MessageBox } from 'react-chat-elements';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton'
import ReactMarkdown from 'react-markdown';
//import rehypeRaw from 'rehype-raw';
import 'react-chat-elements/dist/main.css';
import './chat-mui.css'

function ChatWindow(props) {
    const [message, setMessage] = useState('')
    const [typing, setTyping] = useState(false)
    const chatEndRef = useRef(null)

    async function onChange(e) {
        e.preventDefault()
        let value = e.target.value
        setMessage(value)
    }
    async function onClick(){
        console.log('gonna send this:', message)
        const newMessage = {
            "id": "msg_abc123",
            "object": "thread.message",
            "created_at": 1699017614,
            "thread_id": "thread_abc123",
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": {
                  "value": message,
                  "annotations": []
                }
              }
            ],
            "file_ids": [],
            "assistant_id": null,
            "run_id": null,
            "metadata": {}
          }
          
        const updatedThread = [...props.messages, newMessage]
        console.log('chat window: updated Thread!', updatedThread)
        props.setMessages(updatedThread)
        setMessage('')
        setTyping(true)
        const body = {
            message: message
        }

        try {

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
        } catch (error) {
            console.log('error sending message:', error)
        }
        setTyping(false)
    }

    useEffect(()=>{
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },[props.messages])
    return (
        <>
            {props.fetching ? (
                <>
                    <Skeleton variant="text" width="40%" height={50} style={{ marginBottom: 6 }} />
                    <div className='chat-window'>
                        <div>
                            <div>
                                <Skeleton variant="rectangular" width="80%" height={60} style={{ marginBottom: 6 }} />
                            </div>
                            <div >
                                <Skeleton variant="rectangular" width="80%" height={60} style={{ marginBottom: 6 }} />
                            </div>
                            <div >
                                <Skeleton variant="rectangular" width="80%" height={60} style={{ marginBottom: 6 }} />
                            </div>
                            <div >
                                <Skeleton variant="rectangular" width="80%" height={60} style={{ marginBottom: 6 }} />
                            </div>
                        </div>
                    </div>
                </>

            ) : (
                <>
                <h2>Working on {props.repoName} by {props.userName}</h2>
                <div className='chat-window'>
                    <div className='chat-body'>
                        {
                            props.messages.map((msg, index) => {
                                const messageText = msg.content[0].text.value;
                                const position = msg.role === 'user' ? 'right' : 'left';
                                const title = msg.role === 'user' ? 'You' : 'CodeChat';
                                return (
                                    <MessageBox
                                        title={title}
                                        key={index}
                                        position={position}
                                        type={'text'}
                                        text={<ReactMarkdown children={messageText} />}
                                        margin='10px'
                                    />
                                );
                            })
                        }
                        { typing && (
                            <MessageBox
                                title='CodeChat'
                                position='left'
                                type={'text'}
                                text={
                                    <div>
                                        <Skeleton animation="wave" />
                                        <Skeleton animation="wave" />
                                    </div>
                                }
                                margin='10px'
                            />
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="input-container">
                        <TextField
                            label="ask a question"
                            fullWidth
                            className="input-field"
                            maxRows={6}
                            multiline
                            value={message}
                            onChange={onChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !typing) {
                                    e.preventDefault(); 
                                    onClick(); 
                                }
                            }}
                        />
                        <Button disabled={typing} onClick={onClick} variant="contained" color="primary" className="send-button">
                            Send
                        </Button>
                    </div>
                    
                    </div>
                </>
            )}
        </>
    );
    
}

export default ChatWindow