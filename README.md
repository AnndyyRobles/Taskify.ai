# Taskify.ai

A powerful chat-based application that helps you organize conversations with AI through intelligent subchats. This platform enables you to maintain order in your main discussions while allowing specialized subchats to inherit context from parent conversations.
![Task Screen 3](tsk3.jpeg)

```
taskify-ai/
├── server.js             # Express server and AI model integration
├── public/               # Static assets
├── src/
│   ├── App.jsx           # Main application component
│   ├── styles.css        # Global styles
│   ├── components/       # UI components
│   │   ├── ChatContainer.jsx    # Message display and input
│   │   ├── CodeSnippet.jsx      # Code block viewer
│   │   ├── FileSidebar.jsx      # File management panel
│   │   └── Sidebar.jsx          # Chat navigation
│   └── context/
│       └── ChatContext.jsx      # State management and logic
```

## Features

- **Hierarchical Chat System**: Create subchats that inherit and learn from main conversations
- **Code Snippet Management**: Automatic detection and beautiful display of code blocks
- **File Management**: Track and access all generated and uploaded files in one place
- **Context Preservation**: Subchats maintain awareness of the parent conversation
- **Modern UI**: Clean, intuitive interface with dark mode support

## Screenshots

Here's a glimpse of Taskify.ai in action:

![Task Screen 1](tsk1.jpeg)
![Task Screen 2](tsk2.jpeg)
![Task Screen 3](tsk3.jpeg)
![Task Screen 4](tsk4.jpeg)
![Task Screen 5](tsk5.jpeg)
![Task Screen 6](tsk6.jpeg)

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Context API for state management
- Prism.js for code highlighting
- CSS3 with custom theming

### Backend
- Node.js with Express
- Multiple AI model integration via Hugging Face API:
  - Mistral 7B
  - Phi-2
  - Qwen 1.8B Chat
- Local storage for session persistence
- RESTful API design

## How It Works

### Chat System
Taskify.ai uses a hierarchical chat structure where:
1. Main chats serve as primary conversation threads
2. Subchats can be created from any main chat to focus on specific subtopics
3. All subchats inherit context from their parent chat
4. Updates to the main chat automatically propagate to all subchats

### Context Sharing
When you send a message in a subchat:
- The system includes the relevant parent context when querying the AI
- Responses are specifically tailored to the subchat's focus while maintaining awareness of the main conversation
- This allows for specialized discussions without losing the broader context

### Code Management
- Code blocks are automatically detected in AI responses
- The system extracts code, identifies the language, and generates appropriate filenames
- A professional code viewer provides syntax highlighting, theme switching, and copy/download functionality
- All generated code is accessible through the file sidebar

## Core Functions

The application's functionality is powered by these key mechanisms:

### createNewSubchat()
- Creates a new subchat connected to a parent chat
- Automatically generates a summary of the parent chat
- Stores this summary as `parentContext` for reference by the subchat
- Ensures the subchat has access to all relevant information from its parent

### sendMessage()
- Handles message sending for both main chats and subchats
- For subchats: includes the parent context in API requests to maintain continuity
- Updates the chat's state with user messages immediately while waiting for AI response
- Manages the typing indicator and error handling

### extractCodeBlocks()
- Detects code snippets in AI responses using regex pattern matching
- Parses language information from markdown code block syntax
- Creates structured data objects for each code block
- Enables proper rendering and interaction with code in the UI

### getActiveChat()
- Returns the currently active chat or subchat based on selected IDs
- Determines whether to display main chat or subchat content
- Ensures the right files and context are available for the current view

### Context Update Flow
When a new message is sent to a main chat:
1. The message is processed and the AI response is received
2. The main chat's message history is updated
3. A new summary is created containing all messages
4. This summary is propagated to all subchats as their `parentContext`
5. All subchats now have access to the latest information from the parent

When a new message is sent to a subchat:
1. The system retrieves the parent context
2. This context is included as a system message to the AI
3. The AI's response is tailored to the subchat while maintaining awareness of the main conversation
4. Only the subchat's message history is updated, keeping the main chat clean

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskify-ai.git
cd taskify-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your HuggingFace API key

# Start the development server
npm run dev
```
