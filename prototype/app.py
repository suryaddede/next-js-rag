import chromadb
import chromadb.utils.embedding_functions as chroma_embedding_function
import json
import litellm
import os
import pandas as pd
import time
from dotenv import load_dotenv
from pprint import pprint

# Registering models with litellm
litellm.register_model({
  "openrouter/deepseek/deepseek-r1-0528:free": {
    "max_tokens": 8192,
    "max_input_tokens": 65336,
    "max_output_tokens": 8192,
    "input_cost_per_token": 5.5e-07,
    "input_cost_per_token_cache_hit": 1.4e-07,
    "output_cost_per_token": 2.19e-06,
    "litellm_provider": "openrouter",
    "mode": "chat",
    "supports_function_calling": True,
    "supports_assistant_prefill": True,
    "supports_reasoning": True,
    "supports_tool_choice": True,
    "supports_prompt_caching": True
  },
  "openrouter/deepseek/deepseek-chat-v3-0324:free": {
    "max_tokens": 8192,
    "max_input_tokens": 65336,
    "max_output_tokens": 8192,
    "input_cost_per_token": 2.7e-07,
    "input_cost_per_token_cache_hit": 7e-08,
    "output_cost_per_token": 1.1e-06,
    "litellm_provider": "openrouter",
    "mode": "chat",
    "supports_function_calling": True,
    "supports_assistant_prefill": True,
    "supports_tool_choice": True,
    "supports_prompt_caching": True
  },
})

# Load environment variables from a .env file
load_dotenv()

class PPMBChatbot:
	"""
	A class representing a Retrieval-Augmented Generation (RAG) system
	to answer questions about PPMB in UPN "Veteran" Jawa Timur.
	"""

	# --- System Prompts as Class Attributes ---
	_REWRITER_PROMPT = """
You are a query rewriter that rewrites a query to be more easily understood by a search engine or a question-answering system in Pusat Penerimaan Mahasiswa Baru UPN "Veteran" Jawa Timur.
Given a query, rewrite it to be clearer and more specific.
Here are some guidelines for rewriting queries:

1. Remove unnecessary words or phrases.
2. Use more specific terms.
3. Rephrase the query in a more natural way.
4. Ensure the query is grammatically correct.
5. Response with 3 alternative query without your comment and without numbering in Indonesian language

Example:
Original Query:
Apakah ada ekstra teater di upn?

Rewritten Query:
Apakah UPN "Veteran" Jawa Timur memiliki Unit Kegiatan Mahasiswa (UKM) teater?
Informasi tentang kegiatan teater di UPN "Veteran" Jawa Timur.
Adakah kelompok teater mahasiswa di UPN "Veteran" Jawa Timur?
"""

	# Language-specific configurations
	_LANGUAGE_CONFIG = {
		'Indonesia': {
			'name': 'Indonesian',
			'instruction': 'Respond in Indonesian (Bahasa Indonesia)',
			'example_question': 'Apa persyaratan untuk mendaftar jalur mandiri di UPN Veteran Jawa Timur?',
			'example_answer': 'Untuk mendaftar jalur mandiri di UPN Veteran Jawa Timur, calon mahasiswa harus melengkapi beberapa persyaratan, seperti:'
		},
		'Suroboyoan': {
			'name': 'Suroboyoan',
			'instruction': 'Respond in Javanese (Suroboyoan dialect)',
			'example_question': 'Opo syarate gawe ndaftar jalur mandiri nang UPN Veteran Jawa Timur؟',
			'example_answer': 'Gawe ndaftar jalur mandiri nang UPN Veteran Jawa Timur, calon mahasiswa kudu ngelengkapi beberapa persyaratan, koyok:'
		},
		'English': {
			'name': 'English',
			'instruction': 'Respond in English',
			'example_question': 'What are the requirements for registering for the independent pathway at UPN Veteran Jawa Timur?',
			'example_answer': 'To register for the independent pathway at UPN Veteran Jawa Timur, prospective students must meet several requirements, including:'
		}
	}

	def _get_system_prompt(self, language: str) -> str:
		"""
		Generate a dynamic system prompt based on the specified language.
		"""
		lang_config = self._LANGUAGE_CONFIG.get(language, self._LANGUAGE_CONFIG['Indonesia'])
		
		return f"""
You are an AI assistant tasked with answering questions regarding the New Student Admissions (PPMB) at UPN "Veteran" Jawa Timur.

You will be provided with a question, context, and context metadata to answer the question.

**IMPORTANT: {lang_config['instruction']}. All responses must be in {lang_config['name']}.**

**Steps you must follow:**

1.  **Analyze Context:** Examine each document in the context and identify whether it contains the answer to the question. Assign a relevance score to each document based on how closely it relates to the question.
2.  **Prioritize Documents:** Order the documents by relevance score, with the most relevant documents at the beginning. Ignore documents that are not relevant to the question.
3.  **Create a Summary:** Based on the most relevant documents, create a general summary of the question's topic.
4.  **Provide the Answer:** Give a specific and detailed answer, supported by information from the relevant documents. Ensure your explanation is at least 100 words and is written in {lang_config['name']}.
5.  **Information Limitations:** If the answer cannot be found in the provided context, clearly state that you do not have enough information to answer the question.
6.  **Answer Formatting:**
    *   Do not mention the process you followed to get the answer; just provide the answer directly.
    *   You can use Markdown formatting for your answer.
    *   Include the URLs of the source documents you used to answer the question at the end of the answer.

**Example:**
**Question:** {lang_config['example_question']}
**Answer:**
{lang_config['example_answer']}
... (more detailed explanation of at least 100 words) ...

Related sources:
[Document Name](Source document URL)
[Document Name](Source document URL)
...
"""

	def __init__(self):
		"""
		Initializes the chatbot, setting up clients and database connections.
		"""
		self.chroma_db_path = f'{os.getenv("CHROMA_DB_PATH", "chroma_db")}/{os.getenv("EMBEDDING_MODEL")}'
		if not self.chroma_db_path:
				raise ValueError('ChromaDB path is not provided or set in environment variables.')

		# Fetch model names from environment variables
		self.rewriter_model_name = os.getenv('REWRITER_MODEL')
		if not self.rewriter_model_name:
			raise ValueError('REWRITER_MODEL is not provided or set in environment variables.')
		self.embedding_model_name = os.getenv('EMBEDDING_MODEL')
		if not self.embedding_model_name:
			raise ValueError('EMBEDDING_MODEL is not provided or set in environment variables.')

		# --- Client Initialization ---
		self.chroma_client = chromadb.PersistentClient(path=self.chroma_db_path)

		# --- Embedding and Collection Setup ---
		self.embedding_function = self._initialize_embedding_function()
		self.collection = self._get_collection()

	def _initialize_embedding_function(self):
		"""Initializes the embedding function."""
		return chroma_embedding_function.VoyageAIEmbeddingFunction(
			model_name = os.getenv('EMBEDDING_MODEL')
		)

	def _get_collection(self):
		"""Gets or creates the ChromaDB collection."""
		return self.chroma_client.get_or_create_collection(
			name='knowledge_base',
			embedding_function=self.embedding_function,
			metadata={'hnsw:space': 'cosine'}
		)

	def _rewrite_query(self, query: str, max_retries=5, delay=10) -> str:
		"""Rewrites the user query using a generative model for better search."""
		# print('\nRewriting query...')
		for attempt in range(max_retries):
			try:
				response = litellm.completion(
					model=self.rewriter_model_name,
					messages=[
						{'role': 'system', 'content': self._REWRITER_PROMPT},
						{'role': 'user', 'content': query}
					]
				).choices[0].message.content
				rewritten_query = [query]
				rewritten_query.extend([line.strip() for line in response.strip().split('\n') if line.strip()])
				return rewritten_query
			except Exception as e:
				error_message = f'ERROR: Could not rewrite query with model {self.rewriter_model_name}. Details: {e}'
				print(error_message)
				if attempt < max_retries - 1:
					print(f'Retrying... ({attempt + 1}/{max_retries})')
					time.sleep(delay)

	def _similarity_search(self, rewritten_query: list[str]) -> dict:
		"""Performs similarity search and returns unique retrieved documents."""
		# print('\nPerforming similarity search...')
		results = self.collection.query(
			query_texts=rewritten_query,
			n_results=int(os.getenv('RETRIEVAL_RESULTS')),
		)

		unique_information = {}
		if results and results.get('ids'):
			for i in range(len(results['ids'])):
				for j in range(len(results['ids'][i])):
					doc_id = results['ids'][i][j]
					if doc_id not in unique_information:
						unique_information[doc_id] = {
							'document': results['documents'][i][j],
							'metadata': results['metadatas'][i][j]
						}

		unique_ids = list(unique_information.keys())
		unique_documents = [unique_information[doc_id]['document'] for doc_id in unique_ids]
		unique_metadatas = [unique_information[doc_id]['metadata'] for doc_id in unique_ids]

		retrieved_information = {
			'ids': unique_ids,
			'documents': unique_documents,
			'metadatas': unique_metadatas
		}

		return retrieved_information

	def _create_user_prompt(self, query: str, retrieved_information: dict) -> str:
		"""Constructs the final prompt for the generation model."""
		return f"""
Context:
{retrieved_information['documents']}
Metadata:
{retrieved_information['metadatas']}

Original Query: {query}
"""

	def generate_answer(self, user_prompt: str, generation_model_name: str, language: str = 'Indonesia', max_retries=3, delay=65) -> str:
		"""
		Generates the final answer using a specified generative model.
		"""
		# print('\nGenerating final answer...')
		system_prompt = self._get_system_prompt(language)
		
		for attempt in range(max_retries):
			try:
				response = litellm.completion(
					model=generation_model_name,
					messages=[
						{'role': 'system', 'content': system_prompt},
						{'role': 'user', 'content': user_prompt}
					]
				)
				return response
			except Exception as e:
				error_message = f'ERROR: Could not generate answer with model {generation_model_name}. Details: {e}'
				print(error_message)
				if attempt < max_retries - 1:
					print(f'Retrying... ({attempt + 1}/{max_retries})')
					time.sleep(delay)
		return "Failed to generate answer after multiple retries."