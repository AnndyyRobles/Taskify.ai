// src/context/ChatContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('taskify-chats');
    return savedChats ? JSON.parse(savedChats) : [
      {
        id: 'welcome',
        title: 'Bienvenido a Taskify.ai',
        messages: [
          {
            id: 'msg1',
            text: '¡Bienvenido a Taskify.ai! ¿Cómo puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date().toISOString(),
          }
        ],
        subchats: [],
        files: {
          uploaded: [],
          generated: []
        },
        lastUpdated: new Date().toISOString()
      }
    ];
  });
  
  const [activeChat, setActiveChat] = useState(null);
  const [activeSubchat, setActiveSubchat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
    }
    
    // Save chats to localStorage whenever they change
    localStorage.setItem('taskify-chats', JSON.stringify(chats));
  }, [chats, activeChat]);

  const createNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'Nuevo Chat',
      messages: [
        {
          id: `msg-${Date.now()}`,
          text: '¿En qué puedo ayudarte hoy?',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        }
      ],
      subchats: [],
      files: {
        uploaded: [],
        generated: []
      },
      lastUpdated: new Date().toISOString()
    };
    
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
    setActiveSubchat(null);
    return newChat.id;
  };

  const createNewSubchat = (parentId, title = 'Nuevo Subchat') => {
    const parentChat = chats.find(chat => chat.id === parentId);
    if (!parentChat) return null;

    // Crear un resumen del chat principal para alimentar el contexto del subchat
    const parentSummary = parentChat.messages
      .filter(msg => msg.sender === 'bot' || msg.sender === 'user')
      .map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`)
      .join('\n');

    const newSubchat = {
      id: `subchat-${Date.now()}`,
      title,
      parentId,
      messages: [
        {
          id: `msg-${Date.now()}`,
          text: `Este es un subchat relacionado con "${title}". Tengo acceso a toda la información del chat principal.`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        }
      ],
      lastUpdated: new Date().toISOString(),
      parentContext: parentSummary
    };
    
    setChats(chats.map(chat => {
      if (chat.id === parentId) {
        return {
          ...chat,
          subchats: [...chat.subchats, newSubchat]
        };
      }
      return chat;
    }));
    
    setActiveChat(parentId);
    setActiveSubchat(newSubchat.id);
    return newSubchat.id;
  };

  const renameChat = (chatId, newTitle) => {
    setChats(chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          title: newTitle,
          lastUpdated: new Date().toISOString()
        };
      }
      return chat;
    }));
  };

  const deleteChat = (chatId) => {
    setChats(chats.filter(chat => chat.id !== chatId));
    
    // If the active chat is deleted, set the first available chat as active
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
      } else {
        setActiveChat(null);
      }
      setActiveSubchat(null);
    }
  };

  const renameSubchat = (parentId, subchatId, newTitle) => {
    setChats(chats.map(chat => {
      if (chat.id === parentId) {
        return {
          ...chat,
          subchats: chat.subchats.map(subchat => {
            if (subchat.id === subchatId) {
              return {
                ...subchat,
                title: newTitle,
                lastUpdated: new Date().toISOString()
              };
            }
            return subchat;
          }),
          lastUpdated: new Date().toISOString()
        };
      }
      return chat;
    }));
  };

  const deleteSubchat = (parentId, subchatId) => {
    setChats(chats.map(chat => {
      if (chat.id === parentId) {
        return {
          ...chat,
          subchats: chat.subchats.filter(subchat => subchat.id !== subchatId),
          lastUpdated: new Date().toISOString()
        };
      }
      return chat;
    }));
    
    // If the active subchat is deleted, set only the parent chat as active
    if (activeSubchat === subchatId && activeChat === parentId) {
      setActiveSubchat(null);
    }
  };

  // Utility for extracting code blocks
  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }
    
    return codeBlocks;
  };

  // Nueva función para generar nombres descriptivos de archivos
  const generateDescriptiveFilename = (code, language, conversationContext = '') => {
    // Normalizar el lenguaje
    const normalizedLang = language ? language.toLowerCase() : 'text';
    
    // 1. Verificar si hay un título o descripción en el contexto de la conversación
    // Buscar patrones como "función para", "componente que", "script de", etc.
    let descriptiveName = '';
    
    if (conversationContext) {
      // Buscar frases descriptivas comunes
      const contextPatterns = [
        /(?:funcion|función)\s+(?:para|que)\s+(\w+(?:\s+\w+){0,3})/i,
        /(?:componente|component)\s+(?:de|para|que)\s+(\w+(?:\s+\w+){0,3})/i,
        /(?:script|código|code)\s+(?:para|de|que)\s+(\w+(?:\s+\w+){0,3})/i,
        /(?:implementación|implementacion|implementation)\s+(?:de|para)\s+(\w+(?:\s+\w+){0,3})/i,
        /(?:crear|create|building)\s+(?:un|una|a)\s+(\w+(?:\s+\w+){0,3})/i,
        /(?:aquí|aqui|here).+(?:para|de)\s+(\w+(?:\s+\w+){0,3})/i
      ];
      
      for (const pattern of contextPatterns) {
        const match = conversationContext.match(pattern);
        if (match && match[1]) {
          descriptiveName = match[1].trim();
          break;
        }
      }
    }
    
    // 2. Si no encontramos nada en el contexto, buscar en el propio código
    if (!descriptiveName) {
      // Buscar declaraciones de funciones, clases, componentes según el lenguaje
      if (['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx'].includes(normalizedLang)) {
        // Buscar componentes React
        const reactComponentMatch = code.match(/function\s+(\w+)|class\s+(\w+)|const\s+(\w+)\s*=\s*[\(\{]/);
        if (reactComponentMatch) {
          descriptiveName = reactComponentMatch[1] || reactComponentMatch[2] || reactComponentMatch[3];
        }
      } else if (['python', 'py'].includes(normalizedLang)) {
        // Buscar funciones o clases Python
        const pythonMatch = code.match(/def\s+(\w+)|class\s+(\w+)/);
        if (pythonMatch) {
          descriptiveName = pythonMatch[1] || pythonMatch[2];
        }
      } else if (['java', 'c', 'cpp', 'csharp', 'cs'].includes(normalizedLang)) {
        // Buscar clases o funciones en lenguajes como Java, C#, etc.
        const classMatch = code.match(/class\s+(\w+)|void\s+(\w+)|public\s+\w+\s+(\w+)/);
        if (classMatch) {
          descriptiveName = classMatch[1] || classMatch[2] || classMatch[3];
        }
      } else if (['html', 'markup'].includes(normalizedLang)) {
        // Buscar título en HTML
        const titleMatch = code.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
          descriptiveName = titleMatch[1];
        }
      }
    }
    
    // 3. Procesar el nombre para hacerlo adecuado como nombre de archivo
    if (descriptiveName) {
      // Convertir a camelCase o snake_case según convención del lenguaje
      descriptiveName = descriptiveName
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Eliminar caracteres especiales
        .trim()
        .replace(/\s+/g, '_'); // Reemplazar espacios con guiones bajos
      
      // Acortar si es demasiado largo
      if (descriptiveName.length > 30) {
        descriptiveName = descriptiveName.substring(0, 30);
      }
    } else {
      // Si no pudimos generar un nombre, usar algo genérico pero mejor que "code_snippet_X"
      const langMap = {
        js: 'javascript',
        jsx: 'react_component',
        ts: 'typescript',
        tsx: 'react_tsx_component',
        py: 'python_script',
        java: 'java_class',
        cpp: 'cpp_program',
        c: 'c_program',
        cs: 'csharp_program',
        html: 'html_document',
        css: 'stylesheet',
        sql: 'database_query',
        bash: 'shell_script',
        ruby: 'ruby_script',
        go: 'go_program',
        rust: 'rust_program',
        json: 'json_data'
      };
      
      descriptiveName = langMap[normalizedLang] || `code_${normalizedLang}`;
      descriptiveName += '_' + Math.floor(Date.now() % 10000); // Añadir un número único
    }
    
    // 4. Añadir una extensión de archivo adecuada según el lenguaje
    const fileExt = getFileExtension(language);
    
    return `${descriptiveName}.${fileExt}`;
  };

  const getFileExtension = (language) => {
    const extensionMap = {
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
      html: 'html',
      css: 'css',
      json: 'json',
      plaintext: 'txt',
      text: 'txt',
      txt: 'txt',
    };
    
    return extensionMap[language] || 'txt';
  };

  const sendMessage = async (text, chatId, subchatId = null) => {
    // Crear objeto de mensaje del usuario
    const userMessageId = `msg-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    console.log("⚠️ Enviando mensaje de usuario:", userMessage);
    
    // Actualizar inmediatamente el estado con el mensaje del usuario
    if (subchatId) {
      // Agregar mensaje al subchat
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              subchats: chat.subchats.map(subchat => {
                if (subchat.id === subchatId) {
                  return {
                    ...subchat,
                    messages: [...subchat.messages, userMessage],
                    lastUpdated: new Date().toISOString()
                  };
                }
                return subchat;
              }),
              lastUpdated: new Date().toISOString()
            };
          }
          return chat;
        });
        return updatedChats;
      });
    } else {
      // Agregar mensaje al chat principal
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, userMessage],
              lastUpdated: new Date().toISOString()
            };
          }
          return chat;
        });
        return updatedChats;
      });
    }
    
    // Mostrar indicador de escritura
    setIsTyping(true);
    
    try {
      // Obtener el historial del chat para proporcionar contexto a la API
      let chatHistory = [];
      let contextualPrompt = '';
      const currentChat = chats.find(c => c.id === chatId);
      
      if (currentChat) {
        // Convertir historial del chat al formato esperado por la API
        chatHistory = [...currentChat.messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))];
        
        if (subchatId) {
          const subchat = currentChat.subchats.find(s => s.id === subchatId);
          if (subchat) {
            // Añadir contexto padre como mensaje del sistema si es un subchat
            if (subchat.parentContext) {
              contextualPrompt = `Este es un subchat relacionado con el chat principal. 
              Historia del chat principal:
              ${subchat.parentContext}
              
              Por favor, responde considerando la información del chat principal.`;
              
              chatHistory.unshift({
                role: 'system',
                content: contextualPrompt
              });
            }
            
            // Añadir mensajes del subchat
            chatHistory = [
              ...chatHistory,
              ...subchat.messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              }))
            ];
          }
        }
      }
      
      // Añadir el mensaje más reciente del usuario
      chatHistory.push({
        role: 'user',
        content: text
      });
      
      console.log('Enviando mensaje a la API:', text);
      
      // Llamar a nuestro endpoint de API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatHistory }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta recibida:', data);
      
      // Extraer texto de la respuesta
      const botResponse = { text: data.choices[0].message.content };
      
      // Detectar si la respuesta contiene código
      const codeBlocks = extractCodeBlocks(botResponse.text);
      let responseText = botResponse.text;
      let generatedFiles = [];
      
      if (codeBlocks.length > 0) {
        // Crear entradas de archivos para cada bloque de código con nombres descriptivos
        generatedFiles = codeBlocks.map((block, index) => {
          // Extraer el texto que precede al bloque de código para contexto
          const codeIndex = responseText.indexOf("```" + block.language);
          const precedingText = codeIndex > 0 
            ? responseText.substring(Math.max(0, codeIndex - 200), codeIndex).trim() 
            : "";
          
          // Generar un nombre descriptivo para el archivo
          const fileName = generateDescriptiveFilename(
            block.code, 
            block.language, 
            precedingText
          );
          
          return {
            id: `file-${Date.now()}-${index}`,
            name: fileName,
            type: 'code',
            language: block.language,
            content: block.code,
            timestamp: new Date().toISOString(),
          };
        });
      }
      
      // Crear mensaje del bot
      const botMessageId = `msg-${Date.now()}`;
      const botMessage = {
        id: botMessageId,
        text: responseText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        hasCode: codeBlocks.length > 0,
        codeBlocks
      };
      
      // Actualizar el estado con la respuesta del bot
      if (subchatId) {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === chatId) {
              // Actualizar archivos del chat principal y mensajes del subchat
              const updatedChat = {
                ...chat,
                files: {
                  ...chat.files,
                  generated: [...chat.files.generated, ...generatedFiles]
                },
                subchats: chat.subchats.map(subchat => {
                  if (subchat.id === subchatId) {
                    // Actualizar el parentContext con el nuevo mensaje
                    const updatedParentContext = subchat.parentContext ? 
                      `${subchat.parentContext}\nUsuario: ${text}\nAsistente: ${responseText}` : 
                      '';
                      
                    return {
                      ...subchat,
                      messages: [...subchat.messages, botMessage],
                      parentContext: updatedParentContext,
                      lastUpdated: new Date().toISOString()
                    };
                  }
                  return subchat;
                }),
                lastUpdated: new Date().toISOString()
              };
              
              // Actualizar parentContext en otros subchats para mantener la sincronización
              updatedChat.subchats = updatedChat.subchats.map(subchat => {
                if (subchat.id !== subchatId) {
                  // Añadir el nuevo mensaje al contexto de otros subchats
                  const currentContext = subchat.parentContext || '';
                  const updatedContext = `${currentContext}\nUsuario: ${text}\nAsistente: ${responseText}`;
                  
                  return {
                    ...subchat,
                    parentContext: updatedContext
                  };
                }
                return subchat;
              });
              
              return updatedChat;
            }
            return chat;
          });
          return updatedChats;
        });
      } else {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, botMessage],
                files: {
                  ...chat.files,
                  generated: [...chat.files.generated, ...generatedFiles]
                },
                lastUpdated: new Date().toISOString()
              };
              
              // Actualizar todos los subchats con el nuevo contexto principal
              if (updatedChat.subchats.length > 0) {
                // Crear un resumen del chat principal para los subchats
                const parentSummary = updatedChat.messages
                  .filter(msg => msg.sender === 'bot' || msg.sender === 'user')
                  .map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`)
                  .join('\n');
                  
                // Actualizar el parentContext de cada subchat
                updatedChat.subchats = updatedChat.subchats.map(subchat => ({
                  ...subchat,
                  parentContext: parentSummary
                }));
              }
              
              return updatedChat;
            }
            return chat;
          });
          return updatedChats;
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Añadir mensaje de error
      const errorMessage = {
        id: `msg-${Date.now()}`,
        text: `Error: ${error.message || 'Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.'}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      if (subchatId) {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                subchats: chat.subchats.map(subchat => {
                  if (subchat.id === subchatId) {
                    return {
                      ...subchat,
                      messages: [...subchat.messages, errorMessage],
                      lastUpdated: new Date().toISOString()
                    };
                  }
                  return subchat;
                }),
                lastUpdated: new Date().toISOString()
              };
            }
            return chat;
          });
          return updatedChats;
        });
      } else {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, errorMessage],
                lastUpdated: new Date().toISOString()
              };
            }
            return chat;
          });
          return updatedChats;
        });
      }
    } finally {
      // Ocultar indicador de escritura
      setIsTyping(false);
    }
  };

  const addUploadedFile = (chatId, file) => {
    const fileObj = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      timestamp: new Date().toISOString(),
    };
    
    setChats(chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          files: {
            ...chat.files,
            uploaded: [...chat.files.uploaded, fileObj]
          },
          lastUpdated: new Date().toISOString()
        };
      }
      return chat;
    }));
    
    return fileObj.id;
  };

  const getActiveChat = () => {
    const chat = chats.find(c => c.id === activeChat);
    if (!chat) return null;
    
    if (activeSubchat) {
      const subchat = chat.subchats.find(s => s.id === activeSubchat);
      if (subchat) {
        return {
          ...subchat,
          isSubchat: true,
          parentChat: chat,
          files: chat.files // Files are always from the parent chat
        };
      }
    }
    
    return chat;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeSubchat,
        isTyping,
        setActiveChat,
        setActiveSubchat,
        createNewChat,
        createNewSubchat,
        renameChat,
        deleteChat,
        renameSubchat,
        deleteSubchat,
        sendMessage,
        addUploadedFile,
        getActiveChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};