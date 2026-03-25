"""
Core retrieval logic. Importable by main.py.
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex
from llama_index.core.vector_stores import (
    FilterCondition,
    FilterOperator,
    MetadataFilter,
    MetadataFilters,
)
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

load_dotenv()

TOP_K = 3
MIN_SCORE = 0.3


def _build_index() -> VectorStoreIndex:
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if qdrant_url:  # Cloud (production)
        client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    else:           # Local (development)
        qdrant_local_path = str(Path(__file__).parent / "qdrant_data")
        client = QdrantClient(path=qdrant_local_path)

    vector_store = QdrantVectorStore(client=client, collection_name="hotels")
    embed_model = OpenAIEmbedding(
        model="text-embedding-3-small",
        api_key=os.environ["OPENAI_API_KEY"],
    )
    return VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)


index = _build_index()


def query(question: str, city: str | None = None) -> list[dict]:
    if city:
        # Return chunks for the specific city OR general FAQs (chain-wide)
        filters = MetadataFilters(
            filters=[
                MetadataFilter(key="city", value=city.strip().title(), operator=FilterOperator.EQ),
                MetadataFilter(key="hotel_id", value="general", operator=FilterOperator.EQ),
            ],
            condition=FilterCondition.OR,
        )
        retriever = index.as_retriever(similarity_top_k=TOP_K, filters=filters)
    else:
        retriever = index.as_retriever(similarity_top_k=TOP_K)

    nodes = retriever.retrieve(question)
    return [
        {
            "text": node.text,
            "score": round(node.score, 4),
            "hotel_id": node.metadata.get("hotel_id", ""),
            "hotel_name": node.metadata.get("hotel_name", ""),
            "topic": node.metadata.get("topic", ""),
        }
        for node in nodes
        if node.score >= MIN_SCORE
    ]
