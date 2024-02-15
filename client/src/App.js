import React, {useState} from 'react'
import logo from './logo.svg';
import './App.css';
import ChatWindow from './Components/ChatWindow.js'
import Landing from './Components/Landing.js'

function App() {
  const [currUrl, setCurrUrl] = useState('')
  return (
    <div>
      {currUrl ? (
          <ChatWindow currUrl={currUrl}/>
        ) : (
          <Landing setCurrUrl={setCurrUrl}/>
        )
      }
    </div>
  );
}

export default App;
