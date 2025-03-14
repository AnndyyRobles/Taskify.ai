// App.jsx - Integración del nuevo componente CodeSnippet
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import FileSidebar from './components/FileSidebar';
import CodeSnippet from './components/CodeSnippet'; // Importar el nuevo componente
import { ChatProvider } from './context/ChatContext';
import './styles.css';

function App() {
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeSnippetContent, setCodeSnippetContent] = useState(null);

  const handleCodeClick = (code, language) => {
    setCodeSnippetContent({ code, language });
    setShowCodeSnippet(true);
    
    // También podemos añadir esta línea para registrar la interacción
    console.log(`Visualizando código en ${language || 'texto plano'}, longitud: ${code.length} caracteres`);
  };

  const handleCloseCodeSnippet = () => {
    setShowCodeSnippet(false);
    // Opcional: podemos añadir un pequeño retardo antes de limpiar el contenido
    setTimeout(() => setCodeSnippetContent(null), 300);
  };

  return (
    <ChatProvider>
      <div className="app-container">
        <Sidebar />
        <ChatContainer onCodeClick={handleCodeClick} />
        <FileSidebar onCodeClick={handleCodeClick} />
        
        {/* El nuevo CodeSnippet profesional */}
        {showCodeSnippet && codeSnippetContent && (
          <CodeSnippet 
            code={codeSnippetContent.code} 
            language={codeSnippetContent.language || 'javascript'} 
            onClose={handleCloseCodeSnippet} 
          />
        )}
      </div>
    </ChatProvider>
  );
}

export default App;