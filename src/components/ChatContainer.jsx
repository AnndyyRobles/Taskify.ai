// src/components/ChatContainer.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';

const ChatContainer = ({ onCodeClick }) => {
  const {
    activeChat,
    activeSubchat,
    isTyping,
    sendMessage,
    getActiveChat
  } = useContext(ChatContext);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const currentChat = getActiveChat();
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChat) return;
    
    sendMessage(inputValue, activeChat, activeSubchat);
    setInputValue('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isTyping]);

  // Función para debugueo - verificar mensajes
  useEffect(() => {
    if (currentChat?.messages) {
      console.log("Mensajes actuales:", currentChat.messages);
    }
  }, [currentChat?.messages]);
  
  const renderMessageContent = (message) => {
    if (message.hasCode) {
      // Replace code blocks with clickable elements
      let parts = [];
      let lastIndex = 0;
      
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(message.text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>
              {message.text.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        const language = match[1] || 'plaintext';
        const code = match[2].trim();
        
        parts.push(
          <div
            key={`code-${match.index}`}
            className="code-block"
            onClick={() => onCodeClick(code, language)}
          >
            <div className="code-block-header">
              <span className="code-language">{language}</span>
              <span className="code-view-btn">Ver Código</span>
            </div>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < message.text.length) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {message.text.substring(lastIndex)}
          </span>
        );
      }
      
      return parts;
    } else {
      return message.text;
    }
  };
  
  if (!currentChat) {
    return (
      <div className="chat-container">
        <div className="chat-empty-state">
          <h2>Selecciona un chat o crea uno nuevo</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-title">
          <div className="ai-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21,12A9,9 0 0,1 12,21A9,9 0 0,1 3,12A9,9 0 0,1 12,3A9,9 0 0,1 21,12M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z" />
            </svg>
          </div>
          {currentChat.isSubchat 
            ? `${currentChat.parentChat.title} > ${currentChat.title}`
            : currentChat.title
          }
        </div>
        <div className="chat-actions">
          <button>⋮</button>
        </div>
      </header>
      
      <div className="chat-messages">
        {/* Mensajes del chat - mostrando explícitamente el sender para debug */}
        {currentChat.messages && currentChat.messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'sent' : 'received'} ${message.isError ? 'error' : ''}`}
          >
            {renderMessageContent(message)}
            {/* Comentar o eliminar esta línea después de verificar */}
            <div className="message-debug">[Sender: {message.sender}]</div>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu mensaje..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="send-button">
          <svg viewBox="0 0 24 24">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;