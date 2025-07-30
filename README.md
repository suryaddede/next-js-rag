# Next.js RAG Application

A modern RAG (Retrieval Augmented Generation) application built with Next.js, using ChromaDB for vector storage, Voyage AI for embeddings, and Google's Gemini AI for text generation.

## 🌟 Features

- 🚀 **Modern Next.js 15** with App Router
- 🧠 **RAG implementation** with ChromaDB vector database
- 🤖 **Google Gemini AI** integration for intelligent responses
- 🔍 **Voyage AI embeddings** for semantic search and retrieval
- 🎨 **Beautiful UI** with shadcn/ui and Tailwind CSS
- 📱 **Responsive design** with mobile support
- 🔐 **Admin panel** for document management
- 🐳 **Docker support** for easy deployment
- 🌙 **Dark/Light theme** support
- 🔗 **Embeddable widget** for PHP/HTML integration
- 📄 **Multi-format support** (PDF, HTML, JSON)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Google AI API key ([Get one here](https://aistudio.google.com/app/apikey))
- Voyage AI API key ([Get one here](https://dash.voyageai.com/))

### Option 1: Docker Deployment (Recommended)

1. **Clone and setup:**

   ```bash
   git clone <repository-url>
   cd next-js-rag
   ```

2. **Configure environment:**

   ```bash
   # Copy the appropriate environment file
   cp .env.docker.example .env.local

   # Edit .env.local with your API keys
   # GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   # VOYAGE_AI_API_KEY=your_voyage_ai_api_key_here
   ```

3. **Start the application:**

   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   - 🏠 **Main Interface**: [http://localhost:3000](http://localhost:3000)
   - ⚙️ **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - 🎮 **Integration Demo**: [http://localhost:3000/demo](http://localhost:3000/demo)
   - 🗄️ **ChromaDB API**: [http://localhost:8000](http://localhost:8000)

### Option 2: Development Setup

1. **Setup environment:**

   ```bash
   cp .env.development.example .env.local
   # Edit .env.local with your API keys
   ```

2. **Start ChromaDB:**

   ```bash
   docker compose up -d chromadb
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```

## 📖 How to Use

### For End Users

1. **Start Chatting**: Visit [http://localhost:3000](http://localhost:3000) and start asking questions
2. **Upload Documents**: Go to the admin panel to add documents to the knowledge base
3. **Embed Widget**: Use the demo page to learn how to integrate the chat widget into your website

### For Administrators

#### Adding Documents

1. **Access Admin Panel**: Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. **Go to Documents**: Click on "Documents" in the sidebar
3. **Add New Document**: Click "Add Document" and provide:
   - **Title**: A descriptive name for your document
   - **URL**: Link to PDF, webpage, or JSON file
4. **Wait for Processing**: The system will automatically:
   - Download and convert the content to markdown
   - Create embeddings using Voyage AI
   - Store in ChromaDB for retrieval

#### Supported Content Types

| Type     | Examples                          | Description                          |
| -------- | --------------------------------- | ------------------------------------ |
| **PDF**  | Research papers, manuals, reports | Extracted using Google Gemini vision |
| **HTML** | Web pages, documentation          | Content extracted and cleaned        |
| **JSON** | API responses, structured data    | Parsed and formatted for questions   |

### For Developers

#### Project Structure

```
next-js-rag/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── chat/          # Chat API with RAG
│   │   └── admin/         # Admin API routes
│   ├── admin/             # Admin panel pages
│   ├── demo/              # Integration demo
│   └── embed/             # Embeddable chat widget
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── admin/             # Admin panel components
│   └── EmbeddableChatPopup.tsx  # Widget component
├── lib/                   # Utility libraries
│   ├── chroma-db.ts       # ChromaDB operations
│   └── url-to-markdown.ts # Content processing
├── public/                # Static files
│   ├── chat-widget.js     # Embeddable widget script
│   └── example.php        # PHP integration example
└── docker-compose.yaml    # Docker services
```

#### Key Components

- **[`ChatInterface`](components/ChatInterface.tsx)**: Main chat component using Vercel AI SDK
- **[`DocumentModal`](components/admin/DocumentModal.tsx)**: Document upload/edit interface
- **[`EmbeddableChatPopup`](components/EmbeddableChatPopup.tsx)**: Embeddable widget for external sites

#### API Endpoints

| Endpoint              | Method | Description                            |
| --------------------- | ------ | -------------------------------------- |
| `/api/chat`           | POST   | Chat with RAG (retrieval + generation) |
| `/api/admin/document` | GET    | List all documents                     |
| `/api/admin/document` | POST   | Add new document                       |
| `/api/admin/document` | PUT    | Update document                        |
| `/api/admin/document` | DELETE | Remove document                        |

## 🔗 Integration with PHP/HTML

This application can be embedded as a chat widget in any PHP or HTML website.

### Quick Integration

Add this single line to your PHP page:

```html
<script src="http://localhost:3000/chat-widget.js"></script>
```

### Custom Configuration

```javascript
<script>
window.addEventListener('DOMContentLoaded', function() {
    window.RAGChatWidget.init({
        baseUrl: 'http://localhost:3000',
        position: 'bottom-right',        // bottom-right, bottom-left, top-right, top-left
        buttonColor: '#2563eb',          // Custom button color
        title: 'AI Assistant',           // Widget title
        maxWidth: '450px',               // Popup width
        maxHeight: '650px'               // Popup height
    });
});
</script>
<script src="http://localhost:3000/chat-widget.js"></script>
```

### Examples

- **[`public/example.php`](public/example.php)**: Complete PHP integration example
- **[`public/integration-example.html`](public/integration-example.html)**: HTML integration example
- **Demo Page**: [http://localhost:3000/demo](http://localhost:3000/demo) for live examples

For detailed integration instructions, see [`INTEGRATION.md`](INTEGRATION.md).

## 🛠️ Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Rebuild and restart
docker compose down
docker compose up -d --build

# Production deployment
docker compose -f docker-compose.prod.yaml up -d

# Clean up everything
docker compose down --volumes --remove-orphans
```

## 🔧 Environment Configuration

The app supports multiple environment configurations:

| Environment | File                       | Use Case                             |
| ----------- | -------------------------- | ------------------------------------ |
| Development | `.env.development.example` | Local development with `npm run dev` |
| Docker Dev  | `.env.docker.example`      | Development with Docker              |
| Production  | `.env.production.example`  | Production deployment                |

### Required Environment Variables

| Variable                       | Description                           | Required       |
| ------------------------------ | ------------------------------------- | -------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for text generation | ✅ Yes         |
| `VOYAGE_AI_API_KEY`            | Voyage AI API key for embeddings      | ✅ Yes         |
| `CHROMA_URL`                   | ChromaDB connection URL               | ✅ Yes         |
| `NEXT_PUBLIC_APP_URL`          | Public app URL for widgets            | ✅ Yes         |

For detailed environment setup, see [`ENV_SETUP.md`](ENV_SETUP.md).

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    User[User] --> NextJS[Next.js App]
    NextJS --> ChatAPI[Chat API]
    ChatAPI --> ChromaDB[(ChromaDB)]
    ChatAPI --> Gemini[Google Gemini AI]
    ChatAPI --> Voyage[Voyage AI Embeddings]

    Admin[Admin] --> AdminPanel[Admin Panel]
    AdminPanel --> DocumentAPI[Document API]
    DocumentAPI --> ChromaDB
    DocumentAPI --> ContentProcessor[Content Processor]

    Widget[External Website] --> EmbedAPI[Embed API]
    EmbedAPI --> ChatAPI
```

### Data Flow

1. **Document Upload**: Admin uploads document → Content processed → Embeddings created → Stored in ChromaDB
2. **User Question**: User asks question → Similar documents retrieved → Context + question sent to Gemini → Response returned
3. **Widget Integration**: External site loads widget → User chats → Same RAG flow as main interface

### Docker Services

| Service    | Port | Description         |
| ---------- | ---- | ------------------- |
| `next-app` | 3000 | Next.js application |
| `chromadb` | 8000 | Vector database     |

## 🚀 Deployment

### Development

```bash
# Copy environment file
cp .env.docker.example .env.local

# Start services
docker compose up -d
```

### Production

```bash
# Copy production environment
cp .env.production.example .env.local

# Update with production values:
# - Change NEXT_PUBLIC_APP_URL to your domain
# - Use secure ChromaDB password
# - Add production API keys

# Deploy
docker compose -f docker-compose.prod.yaml up -d
```

### Security Considerations

- Change default ChromaDB passwords in production
- Use environment-specific API keys
- Enable HTTPS in production
- Regularly rotate API keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🔍 Troubleshooting

### Common Issues

**Chat not responding:**

- Check if Google AI API key is valid
- Ensure ChromaDB is running (`docker compose ps`)
- Check logs: `docker compose logs -f`

**Documents not uploading:**

- Verify the URL is accessible
- Check if content type is supported (PDF, HTML, JSON)
- Look at admin panel logs

**Widget not showing on external site:**

- Verify the widget script URL is correct
- Check browser console for errors
- Ensure CORS is properly configured

**Database connection failed:**

- For Docker: Use `http://chromadb:8000`
- For local: Use `http://localhost:8000`
- Check if ChromaDB container is running

For more troubleshooting help, see [`ENV_SETUP.md`](ENV_SETUP.md).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
