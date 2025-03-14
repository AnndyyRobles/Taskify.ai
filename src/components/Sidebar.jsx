// src/components/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';

const Sidebar = () => {
  const {
    chats,
    activeChat,
    activeSubchat,
    setActiveChat,
    setActiveSubchat,
    createNewChat,
    createNewSubchat,
    renameChat,
    deleteChat,
    renameSubchat,
    deleteSubchat
  } = useContext(ChatContext);
  
  const [chatTitleEdit, setChatTitleEdit] = useState({ id: null, title: '', isSubchat: false });
  const [showContextMenu, setShowContextMenu] = useState({ id: null, isSubchat: false, x: 0, y: 0 });
  
  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    setActiveSubchat(null);
  };
  
  const handleSubchatClick = (chatId, subchatId) => {
    setActiveChat(chatId);
    setActiveSubchat(subchatId);
  };
  
  const handleAddSubchat = (chatId, e) => {
    e.stopPropagation();
    const title = prompt('Nombre del nuevo subchat:');
    if (title && title.trim()) {
      createNewSubchat(chatId, title.trim());
    }
  };
  
  const handleChatTitleDoubleClick = (chatId, title, isSubchat, parentId = null) => {
    setChatTitleEdit({ id: chatId, title, isSubchat, parentId });
  };
  
  const handleChatTitleChange = (e) => {
    setChatTitleEdit({ ...chatTitleEdit, title: e.target.value });
  };
  
  const handleChatTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (chatTitleEdit.isSubchat) {
        renameSubchat(chatTitleEdit.parentId, chatTitleEdit.id, chatTitleEdit.title);
      } else {
        renameChat(chatTitleEdit.id, chatTitleEdit.title);
      }
      setChatTitleEdit({ id: null, title: '', isSubchat: false, parentId: null });
    } else if (e.key === 'Escape') {
      setChatTitleEdit({ id: null, title: '', isSubchat: false, parentId: null });
    }
  };
  
  const handleContextMenu = (e, id, isSubchat, parentId = null) => {
    e.preventDefault();
    setShowContextMenu({ id, isSubchat, parentId, x: e.clientX, y: e.clientY });
  };
  
  const handleRenameClick = () => {
    const { id, isSubchat, parentId } = showContextMenu;
    const chatToRename = isSubchat 
      ? chats.find(c => c.id === parentId)?.subchats.find(s => s.id === id)
      : chats.find(c => c.id === id);
    
    if (chatToRename) {
      setChatTitleEdit({ 
        id, 
        title: chatToRename.title, 
        isSubchat, 
        parentId 
      });
    }
    
    setShowContextMenu({ id: null, isSubchat: false, parentId: null, x: 0, y: 0 });
  };
  
  const handleDeleteClick = () => {
    const { id, isSubchat, parentId } = showContextMenu;
    
    if (isSubchat) {
      if (window.confirm('¿Estás seguro de que quieres eliminar este subchat?')) {
        deleteSubchat(parentId, id);
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres eliminar este chat y todos sus subchats?')) {
        deleteChat(id);
      }
    }
    
    setShowContextMenu({ id: null, isSubchat: false, parentId: null, x: 0, y: 0 });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    const chatDate = new Date(chat.lastUpdated);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey;
    
    if (chatDate.toDateString() === today.toDateString()) {
      groupKey = 'Hoy';
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groupKey = 'Ayer';
    } else {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (chatDate >= sevenDaysAgo) {
        groupKey = 'Últimos 7 días';
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (chatDate >= thirtyDaysAgo) {
          groupKey = 'Últimos 30 días';
        } else {
          groupKey = 'Más antiguos';
        }
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(chat);
    return groups;
  }, {});

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showContextMenu.id) {
        setShowContextMenu({ id: null, isSubchat: false, parentId: null, x: 0, y: 0 });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContextMenu]);

  return (
    <aside className="sidebar">
      <button className="new-chat-btn" onClick={createNewChat}>Nuevo Chat</button>
      <div className="chat-list">
        {Object.entries(groupedChats).map(([groupName, groupChats]) => (
          <div className="chat-group" key={groupName}>
            <div className="chat-group-label">{groupName}</div>
            {groupChats.map((chat) => (
              <div
                className={`chat-item ${activeChat === chat.id && !activeSubchat ? 'active' : ''}`}
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                onContextMenu={(e) => handleContextMenu(e, chat.id, false)}
              >
                <div className="chat-item-content">
                  {chatTitleEdit.id === chat.id && !chatTitleEdit.isSubchat ? (
                    <input
                      type="text"
                      value={chatTitleEdit.title}
                      onChange={handleChatTitleChange}
                      onKeyDown={handleChatTitleKeyDown}
                      onBlur={() => setChatTitleEdit({ id: null, title: '', isSubchat: false })}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="chat-item-title"
                      onDoubleClick={() => handleChatTitleDoubleClick(chat.id, chat.title, false)}
                    >
                      {chat.title}
                    </span>
                  )}
                  <button
                    className="add-subchat-btn"
                    onClick={(e) => handleAddSubchat(chat.id, e)}
                    title="Añadir subchat"
                  >
                    +
                  </button>
                </div>
                {chat.subchats.length > 0 && (
                  <div className="subchat-list">
                    {chat.subchats.map((subchat) => (
                      <div
                        className={`subchat-item ${activeSubchat === subchat.id ? 'active' : ''}`}
                        key={subchat.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubchatClick(chat.id, subchat.id);
                        }}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, subchat.id, true, chat.id);
                        }}
                      >
                        <div className="chat-item-content">
                          {chatTitleEdit.id === subchat.id && chatTitleEdit.isSubchat ? (
                            <input
                              type="text"
                              value={chatTitleEdit.title}
                              onChange={handleChatTitleChange}
                              onKeyDown={handleChatTitleKeyDown}
                              onBlur={() => setChatTitleEdit({ id: null, title: '', isSubchat: false })}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className="chat-item-title"
                              onDoubleClick={() => handleChatTitleDoubleClick(subchat.id, subchat.title, true, chat.id)}
                            >
                              {subchat.title}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Context Menu */}
      {showContextMenu.id && (
        <div 
          className="context-menu" 
          style={{
            position: 'fixed',
            top: `${showContextMenu.y}px`,
            left: `${showContextMenu.x}px`,
            zIndex: 1000
          }}
        >
          <ul>
            <li onClick={handleRenameClick}>Renombrar</li>
            <li onClick={handleDeleteClick}>Eliminar</li>
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;