import './chat.css'


function ChatWindow (props) {
    return(
        <div className="chat-window">
            <div className="chat-header">
                <h1>Chat Component</h1>
            </div>
            <div className="chat-body">
                <div className="message-container">
                    messages go here
                </div>
                <div className="user-input-container">
                    <input type="text" placeholder="type a message..." />
                    <button>Send</button>
                </div>
            </div>
            <div className="chat-footer">
                <span>Pick up where you left off!</span>
            </div>
        </div>
    )
}

export default ChatWindow