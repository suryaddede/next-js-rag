# Next.js RAG Application

A modern RAG (Retrieval Augmented Generation) application built with Next.js, using ChromaDB for vector storage and Google's Gemini AI for text generation.

# Next.js RAG Application

A modern RAG (Retrieval Augmented Generation) application built with Next.js, using ChromaDB for vector storage and Google's Gemini AI for text generation.

## Features

- 🚀 Modern Next.js 15 with App Router
- 🧠 RAG implementation with ChromaDB vector database
- 🤖 Google Gemini AI integration
- 🎨 Beautiful UI with shadcn/ui and Tailwind CSS
- 📱 Responsive design with mobile support
- 🔐 Admin panel for document management
- 🐳 Docker support for easy deployment
- 🌙 Dark/Light theme support

## Getting Started

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository and navigate to the project:**

   ```bash
   cd next-js-rag
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Google AI API key:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   ```

3. **Run the entire application with Docker:**

   ```bash
   docker-compose up -d
   ```

   This will start:

   - ChromaDB on port 8000
   - Next.js application on port 3000

4. **Access the application:**
   - Main chat interface: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)
   - ChromaDB API: [http://localhost:8000](http://localhost:8000)

### Option 2: Development Setup

1. **Copy environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

2. **Start ChromaDB with Docker:**

   ```bash
   docker-compose up -d chromadb
   ```

3. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## Docker Commands

### Build and run everything

```bash
docker-compose up -d
```

### Rebuild the Next.js app

```bash
docker-compose build nextjs-app
docker-compose up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs-app
docker-compose logs -f chromadb
```

### Stop all services

```bash
docker-compose down
```

### Clean up (removes containers and networks)

```bash
docker-compose down --volumes --remove-orphans
```

## Environment Variables

| Variable                       | Description                  | Default                 |
| ------------------------------ | ---------------------------- | ----------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (required) | -                       |
| `CHROMA_URL`                   | ChromaDB connection URL      | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL`          | Public app URL               | `http://localhost:3000` |
| `NODE_ENV`                     | Node environment             | `development`           |

## Architecture

The application consists of two main services:

1. **ChromaDB**: Vector database for document storage and retrieval
2. **Next.js App**: Web application with chat interface and admin panel

### Docker Network

Both services communicate through a custom Docker network (`rag-network`), ensuring:

- Secure internal communication
- Service discovery by name
- Isolation from external networks

### Data Persistence

- ChromaDB data is persisted in `./chroma_data` directory
- The directory is automatically created and mounted as a volume

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── admin/             # Admin-specific components
├── lib/                   # Utility libraries
├── docker-compose.yaml    # Docker services configuration
├── Dockerfile            # Next.js app container
└── .dockerignore         # Docker ignore rules
```

### Building for Production

The Dockerfile uses multi-stage builds for optimization:

1. **Dependencies stage**: Installs only production dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates minimal production image

### Hot Reload in Development

For development with hot reload, uncomment the volume mounts in `docker-compose.yaml`:

```yaml
# Uncomment for development
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
