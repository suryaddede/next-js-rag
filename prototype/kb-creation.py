import os
import tiktoken
import chromadb.utils.embedding_functions as chroma_embedding_function
from langchain.text_splitter import MarkdownHeaderTextSplitter

def chunk_content(markdownized_content, limit=int(os.getenv('CHUNK_SIZE'))):
  encoding = tiktoken.get_encoding('cl100k_base')
  num_tokens = len(encoding.encode(markdownized_content))
  print(f"\nNumber of tokens in content: {num_tokens}")

  headers = [('#', 'Header 1')] if num_tokens <= limit else [('#', 'Header 1'), ('##', 'Header 2')]
  splitter = MarkdownHeaderTextSplitter(headers, strip_headers=False)
  chunked_content = splitter.split_text(markdownized_content)

  return chunked_content

def initialize_embedding_function():
	return chroma_embedding_function.VoyageAIEmbeddingFunction(
		model_name = os.getenv('EMBEDDING_MODEL')
	)

def get_collection(chroma_client, embedding_function):
  collection = chroma_client.get_or_create_collection(
    name='knowledge_base',
    embedding_function=embedding_function,
    configuration={'hnsw:space': 'cosine'}
  )

  return collection

def store_content(markdownized_content, metadata, collection):
  chunked_content = chunk_content(markdownized_content)
  for i, document in enumerate(chunked_content):
    metadatas = {
      'title': metadata['title'],
      'source': metadata['source'],
    }
    collection.upsert(
      documents=[document.page_content],
      metadatas=[metadatas],
      ids=[f'{metadata["title"]}-{i}'],
    )

  return print(f'Successfully stored {metadata["title"]}')