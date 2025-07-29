# Environment Configuration Guide

This guide explains how to set up environment variables for different deployment scenarios.

## 📁 Environment Files Overview

| File                       | Purpose                     | When to Use                          |
| -------------------------- | --------------------------- | ------------------------------------ |
| `.env.development.example` | Development template        | Local development with `npm run dev` |
| `.env.docker.example`      | Docker development template | Development with `docker compose up` |
| `.env.production.example`  | Production template         | Production deployment                |
| `.env.local`               | Your actual config          | Created by you (never committed)     |

## 🚀 Setup Instructions

### 1. For Local Development (npm run dev)

```bash
# Copy the development example
cp .env.development.example .env.local

# Edit .env.local with your actual API keys
# GOOGLE_GENERATIVE_AI_API_KEY=your_actual_key
# VOYAGE_AI_API_KEY=your_actual_key
```

### 2. For Docker Development (docker compose up)

```bash
# Copy the docker example
cp .env.docker.example .env.local

# Edit .env.local with your actual API keys
# Note: CHROMA_URL should be http://chromadb:8000 for Docker internal network
```

### 3. For Production Deployment

```bash
# Copy the production example
cp .env.production.example .env.local

# Edit .env.local with:
# - Your production API keys
# - Your actual domain name
# - Secure ChromaDB password
```

## 🔑 Required API Keys

### Google Generative AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### Voyage AI API Key

1. Visit [Voyage AI Dashboard](https://dash.voyageai.com/)
2. Create an account and get your API key
3. Add it to your `.env.local` file

## 🔧 Environment Variables Explained

### Core Variables

- `CHROMA_URL`: ChromaDB server URL

  - Local dev: `http://localhost:8000`
  - Docker: `http://chromadb:8000`
  - Production: Depends on your setup

- `NEXT_PUBLIC_APP_URL`: Your app's public URL

  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`

- `NODE_ENV`: Environment mode
  - Development: `development`
  - Production: `production`

### Security Variables (Production)

- `CHROMA_AUTH_USER`: ChromaDB username
- `CHROMA_AUTH_PASSWORD`: ChromaDB password (change from default!)
- `DEBUG`: Enable/disable debug logging
- `LOG_LEVEL`: Logging verbosity

## 📋 Quick Start Checklist

- [ ] Copy appropriate `.env.*.example` to `.env.local`
- [ ] Get Google AI API key and add to `.env.local`
- [ ] Get Voyage AI API key and add to `.env.local`
- [ ] Update `NEXT_PUBLIC_APP_URL` for production
- [ ] Change default ChromaDB password for production
- [ ] Test your configuration

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It contains your actual secrets
2. **Use different API keys** for development and production
3. **Change default passwords** in production
4. **Use environment-specific configurations**
5. **Regularly rotate your API keys**

## 🐛 Troubleshooting

### Common Issues

**API keys not working:**

- Check if keys are correctly formatted (no extra spaces)
- Verify keys are valid and have proper permissions
- Ensure you're using the right environment file

**ChromaDB connection failed:**

- Check if ChromaDB is running (`docker compose ps`)
- Verify the `CHROMA_URL` matches your setup
- For Docker: use `http://chromadb:8000`
- For local: use `http://localhost:8000`

**Build fails:**

- Ensure all required environment variables are set
- Check for syntax errors in `.env.local`
- Try removing `.next` folder and rebuilding

## 📞 Getting Help

If you encounter issues:

1. Check this guide first
2. Verify your environment variables
3. Check the application logs
4. Consult the main README.md for additional setup instructions
