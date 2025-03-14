// src/components/CodeSnippet.jsx - Versión Avanzada con Iconos Profesionales
import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Importar estilos y lenguajes de Prism.js
import 'prismjs/themes/prism-tomorrow.css'; // Tema oscuro
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';

// Componentes de iconos SVG profesionales
const ThemeIcon = ({ isDark }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {isDark ? (
      // Icono de sol para tema oscuro
      <>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </>
    ) : (
      // Icono de luna para tema claro
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    )}
  </svg>
);

const CopyIcon = ({ copied }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {copied ? (
      // Icono de verificación cuando se ha copiado
      <path d="M20 6L9 17l-5-5"></path>
    ) : (
      // Icono de copiar
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </>
    )}
  </svg>
);

const DownloadIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const CloseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CodeSnippet = ({ code, language, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('dark');
  const codeRef = useRef(null);
  const [lineCount, setLineCount] = useState(0);

  // Mapear el lenguaje a un formato que Prism.js pueda entender
  const getPrismLanguage = (lang) => {
    const langMap = {
      js: 'javascript',
      javascript: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      typescript: 'typescript',
      tsx: 'tsx',
      py: 'python',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'csharp',
      cs: 'csharp',
      bash: 'bash',
      sh: 'bash',
      shell: 'bash',
      sql: 'sql',
      html: 'markup',
      xml: 'markup',
      css: 'css',
      json: 'json',
      go: 'go',
      rust: 'rust',
      rb: 'ruby',
      ruby: 'ruby'
    };
    
    return langMap[lang?.toLowerCase()] || 'javascript';
  };

  // Calcular número de líneas
  useEffect(() => {
    if (code) {
      setLineCount(code.split('\n').length);
    }
  }, [code]);

  // Aplicar el resaltado de sintaxis cuando cambia el código o el tema
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language, theme]);

  // Manejar la copia al portapapeles
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para descargar el código como archivo
  const handleDownload = () => {
    const fileExt = getFileExtension(language);
    const filename = `code-snippet.${fileExt}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determinar la extensión de archivo según el lenguaje
  const getFileExtension = (lang) => {
    const extMap = {
      javascript: 'js',
      js: 'js',
      jsx: 'jsx',
      typescript: 'ts',
      ts: 'ts',
      tsx: 'tsx',
      python: 'py',
      py: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      cs: 'cs',
      html: 'html',
      css: 'css',
      json: 'json',
      bash: 'sh',
      shell: 'sh',
      sql: 'sql',
      ruby: 'rb',
      go: 'go',
      rust: 'rs'
    };
    
    return extMap[lang?.toLowerCase()] || 'txt';
  };

  // Convertir lenguaje a un nombre más descriptivo
  const getLanguageDisplay = (lang) => {
    if (!lang) return 'Plain Text';
    
    const langMap = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      jsx: 'React JSX',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      tsx: 'React TSX',
      py: 'Python',
      python: 'Python',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      csharp: 'C#',
      cs: 'C#',
      bash: 'Bash',
      shell: 'Shell',
      sql: 'SQL',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust'
    };
    
    return langMap[lang?.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  // Crear arreglo para números de línea
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="code-snippet-overlay">
      <div className={`code-snippet-container ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
        <div className="code-snippet-header">
          <div className="code-snippet-header-left">
            <div className="code-language-badge">
              {getLanguageDisplay(language)}
            </div>
            <div className="code-lines-count">
              {lineCount} {lineCount === 1 ? 'línea' : 'líneas'}
            </div>
          </div>
          <div className="code-snippet-header-actions">
            <button 
              className="theme-toggle-btn" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              <ThemeIcon isDark={theme === 'dark'} />
            </button>
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copiar al portapapeles"
            >
              <CopyIcon copied={copied} />
              <span className="btn-text">{copied ? 'copied' : 'copy'}</span>
            </button>
            <button 
              className="download-btn" 
              onClick={handleDownload}
              title="Descargar archivo"
            >
              <DownloadIcon />
            </button>
            <button 
              className="close-btn" 
              onClick={onClose}
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        
        <div className="code-content-wrapper">
          <div className="line-numbers">
            {lineNumbers.map(num => (
              <div key={`line-${num}`} className="line-number">{num}</div>
            ))}
          </div>
          <pre className={`language-${getPrismLanguage(language)}`}>
            <code ref={codeRef} className={`language-${getPrismLanguage(language)}`}>
              {code}
            </code>
          </pre>
        </div>
        
        <div className="code-snippet-footer">
          <div className="code-snippet-info">
            <span>Sintaxis: {getLanguageDisplay(language)}</span>
            <span className="separator">•</span>
            <span>Generated by Taskify.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippet;