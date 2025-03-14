// server.js - Versión optimizada con modelos populares y confiables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Ruta principal para verificar que el servidor esté funcionando
app.get('/', (req, res) => {
  res.json({ status: 'Servidor Taskify.ai funcionando correctamente' });
});

// Configuración de modelos probados y confiables
const MODELS = [
  {
    id: "mistralai/Mistral-7B-Instruct-v0.2",
    name: "Mistral 7B",
    formatPrompt: (messages) => {
      let prompt = "<s>";
      
      // Incluimos los últimos 10 mensajes para mantener el contexto conciso
      const recentMessages = messages.slice(-10);
      
      for (const msg of recentMessages) {
        if (msg.role === 'system') {
          prompt += `[INST] ${msg.content} [/INST]`;
        } else if (msg.role === 'user') {
          prompt += `[INST] ${msg.content} [/INST]`;
        } else if (msg.role === 'assistant') {
          prompt += ` ${msg.content} </s>`;
        }
      }
      
      // Asegurarnos de tener el último mensaje del usuario y preparar para la respuesta
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg && !prompt.endsWith(lastUserMsg.content)) {
        prompt += `[INST] ${lastUserMsg.content} [/INST]`;
      }
      
      return prompt;
    },
    parameters: {
      max_new_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false
    }
  },
  {
    id: "microsoft/phi-2",
    name: "Phi-2",
    formatPrompt: (messages) => {
      // Phi-2 usa un formato de instrucción más simple
      let prompt = "";
      
      // Añadir un mensaje de sistema al principio
      prompt += "You are Taskify.ai, a helpful and friendly AI assistant. Answer the questions accurately and concisely.\n\n";
      
      // Incluir solo los últimos 5 mensajes para no sobrecargar el modelo pequeño
      const recentMessages = messages.slice(-5);
      
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          prompt += `Human: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      }
      
      // Preparar para la respuesta
      prompt += "Assistant:";
      
      return prompt;
    },
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false
    }
  },
  {
    id: "Qwen/Qwen1.5-1.8B-Chat",
    name: "Qwen 1.8B Chat",
    formatPrompt: (messages) => {
      let formattedPrompt = "";
      
      // Añadir un mensaje de sistema al principio
      formattedPrompt += "<|im_start|>system\nYou are a helpful assistant called Taskify.ai.<|im_end|>\n";
      
      // Incluir los mensajes recientes
      const recentMessages = messages.slice(-6);
      
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          formattedPrompt += `<|im_start|>user\n${msg.content}<|im_end|>\n`;
        } else if (msg.role === 'assistant') {
          formattedPrompt += `<|im_start|>assistant\n${msg.content}<|im_end|>\n`;
        }
      }
      
      // Preparar para la respuesta
      formattedPrompt += "<|im_start|>assistant\n";
      
      return formattedPrompt;
    },
    parameters: {
      max_new_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false
    }
  }
];

// Endpoint para el chat - Hugging Face API con modelos confiables
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Obtener el último mensaje del usuario para logging
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userContent = lastUserMessage ? lastUserMessage.content : '';
    
    console.log('Mensaje recibido:', userContent.substring(0, 100) + (userContent.length > 100 ? '...' : ''));
    
    // Intentamos con cada modelo en secuencia hasta obtener una respuesta
    let modelResponse = null;
    let modelUsed = null;
    
    for (const model of MODELS) {
      try {
        console.log(`Intentando con modelo: ${model.name}`);
        
        // Formatear el prompt según el modelo específico
        const formattedPrompt = model.formatPrompt(messages);
        
        // Tiempo de inicio para medir la duración
        const startTime = Date.now();
        
        // Llamada a la API de Hugging Face
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model.id}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: formattedPrompt,
              parameters: model.parameters
            }),
            // Un timeout generoso para permitir que el modelo cargue
            timeout: 60000  // 60 segundos
          }
        );
        
        // Si la respuesta no es OK, lanzamos un error para probar con el siguiente modelo
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Error con ${model.name}:`, errorText);
          throw new Error(`Error en el modelo ${model.name}: ${response.status} ${errorText}`);
        }
        
        // Parseamos la respuesta
        const data = await response.json();
        const endTime = Date.now();
        console.log(`Respuesta de ${model.name} recibida en ${(endTime - startTime) / 1000} segundos`);
        
        // Extraer la respuesta generada según la estructura de respuesta
        if (data.generated_text) {
          modelResponse = data.generated_text;
          modelUsed = model.name;
          break;  // Salimos del bucle si obtenemos una respuesta válida
        } else if (data[0] && data[0].generated_text) {
          modelResponse = data[0].generated_text;
          modelUsed = model.name;
          break;  // Salimos del bucle si obtenemos una respuesta válida
        } else {
          console.log(`Estructura de respuesta inesperada de ${model.name}:`, data);
          throw new Error(`Estructura de respuesta inesperada de ${model.name}`);
        }
        
      } catch (modelError) {
        console.log(`Error al intentar con ${model.name}:`, modelError.message);
        // Continuamos con el siguiente modelo
        continue;
      }
    }
    
    // Si no obtuvimos una respuesta de ningún modelo, enviamos un error
    if (!modelResponse) {
      throw new Error("No se pudo obtener una respuesta de ningún modelo");
    }
    
    console.log(`Respuesta enviada desde modelo: ${modelUsed}`);
    
    // Enviamos la respuesta al frontend en formato OpenAI
    res.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: modelResponse
          }
        }
      ],
      model: modelUsed
    });
    
  } catch (error) {
    console.error('Error general:', error.message);
    
    res.status(500).json({ 
      error: 'Error al procesar la solicitud', 
      message: error.message 
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Accede a tu aplicación en: http://localhost:${PORT}`);
});