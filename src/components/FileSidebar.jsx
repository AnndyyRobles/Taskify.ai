// src/components/FileSidebar.jsx
import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const FileSidebar = ({ onCodeClick }) => {
  const { getActiveChat } = useContext(ChatContext);
  
  const currentChat = getActiveChat();
  const files = currentChat?.files || { uploaded: [], generated: [] };
  
  const handleFileClick = (file) => {
    if (file.type === 'code') {
      onCodeClick(file.content, file.language);
    }
    // Other file types would have different handlers
  };
  
  const getFileIcon = (file) => {
    if (file.type === 'code') {
      const langIcons = {
        js: '📄 JS',
        jsx: '📄 JSX',
        ts: '📄 TS',
        tsx: '📄 TSX',
        html: '📄 HTML',
        css: '📄 CSS',
        python: '📄 PY',
        py: '📄 PY',
        java: '📄 JAVA',
        json: '📄 JSON',
        default: '📄'
      };
      
      return langIcons[file.language] || langIcons.default;
    } else if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📑';
    } else if (file.type.includes('spreadsheet') || file.type.includes('csv')) {
      return '📊';
    } else {
      return '📁';
    }
  };
  
  return (
    <aside className="sidebar" style={{ borderLeft: '1px solid rgba(236, 236, 236, 0.1)', borderRight: 'none' }}>
      <h3>Archivos</h3>
      
      {(files.uploaded.length > 0 || files.generated.length > 0) ? (
        <div className="file-list">
          {files.uploaded.length > 0 && (
            <div className="file-section">
              <h4>Archivos Subidos</h4>
              {files.uploaded.map((file) => (
                <div
                  key={file.id}
                  className="file-item"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="file-icon">{getFileIcon(file)}</div>
                  <div className="file-name">{file.name}</div>
                </div>
              ))}
            </div>
          )}
          
          {files.generated.length > 0 && (
            <div className="file-section">
              <h4>Archivos Generados</h4>
              {files.generated.map((file) => (
                <div
                  key={file.id}
                  className="file-item"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="file-icon">{getFileIcon(file)}</div>
                  <div className="file-name">{file.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="no-files-message">
          <p>No hay archivos en este chat.</p>
          <p>Los archivos aparecerán aquí cuando los subas o cuando el AI genere código.</p>
        </div>
      )}
    </aside>
  );
};

export default FileSidebar;