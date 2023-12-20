import React, {useState} from 'react'
import logo from './logo.svg';
import './App.css';
import ChatWindow from './Components/chat-mui.js'
import LandingPage from './Components/landing.js'

function App() {
  const [currUrl, setCurrUrl] = useState('')
  return (
    <div>
      {currUrl ? (
          <ChatWindow currUrl={currUrl}/>
        ) : (
          <LandingPage setCurrUrl={setCurrUrl}/>
        )
      }
    </div>
  );
}

export default App;
