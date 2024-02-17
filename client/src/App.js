import React, {useState, useEffect} from 'react'
import './App.css';
import ChatWindow from './Components/ChatWindow.js'
import Landing from './Components/Landing.js'

function App() {
  const [messages, setMessages] = useState([])
  const [session, setSession] = useState(null)
  const [url, setUrl] = useState('')
  const [userName, setUserName] = useState('')
  const [repoName, setRepoName] = useState('')
  
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
      const [userName, repoName] = url.replace('https://github.com/', '').split('/')
      const responseData = await response.json()
      console.log({responseData})
      setSession(true)
      setMessages(responseData.messages)
      setUrl(responseData.url)
      setUserName(userName)
      setRepoName(repoName)
    } else {
      setSession(false)
    }
    return response.ok
  }
  checkSession()
  }, [url]);


  return (
    <div>
      <Landing url={url} setSession={setSession} setMessages={setMessages}/>
      {session && 
        <div>
          <h2>Working on {repoName} by {userName}</h2>
          <ChatWindow setMessages={setMessages} messages={messages}/>
        </div>
        }
    </div>
  );
}

export default App;
