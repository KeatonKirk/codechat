import React, {useState, useEffect} from 'react'
import './App.css';
import ChatWindow from './Components/ChatWindow.js'
import Landing from './Components/Landing.js'

function App() {
  const [messages, setMessages] = useState([])
  const [session, setSession] = useState(null)



  useEffect(()=> {
    
    const checkSession = async () => {
      // hit the server and see if a session id exists.
      const response = await fetch('http://localhost:5000/check-session', {
        method: "GET",
        credentials: 'include',
        mode: 'cors',
        headers: {
            "Content-Type": 'application/json'
        },
    })
  
    if (response.ok){
      const responseData = await response.json()
      console.log({responseData})
      setSession(true)
      setMessages(responseData)
    } else {
      setSession(false)
    }
    return response.ok
  }
  checkSession()
  console.log('app root, messages:', messages)
  }, []);


  return (
    <div>
      {session ? (
          <ChatWindow setMessages={setMessages} messages={messages}/>
        ) : (
          <Landing setSession={setSession} setMessages={setMessages}/>
        )
      }
    </div>
  );
}

export default App;
