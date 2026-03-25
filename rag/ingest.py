"""
Run once to chunk, embed, and store hotel knowledge in Qdrant.
Usage: python ingest.py
"""
import json
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.core.schema import TextNode
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType

load_dotenv()

DATA_DIR = Path(__file__).parent.parent / "data"

qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if qdrant_url:
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    print(f"Using Qdrant Cloud: {qdrant_url}")
else:
    local_path = str(Path(__file__).parent / "qdrant_data")
    client = QdrantClient(path=local_path)
    print(f"Using local Qdrant: {local_path}")

vector_store = QdrantVectorStore(client=client, collection_name="hotels")
embed_model = OpenAIEmbedding(
    model="text-embedding-3-small",
    api_key=os.environ["OPENAI_API_KEY"],
)


def load_nodes() -> list[TextNode]:
    nodes = []
    for json_file in DATA_DIR.glob("*.json"):
        chunks = json.loads(json_file.read_text(encoding="utf-8"))
        for chunk in chunks:
            node = TextNode(
                text=chunk["content"],
                id_=str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk["id"])),
                metadata={
                    "chunk_id": chunk["id"],
                    "hotel_id": chunk.get("hotel_id", "general"),
                    "hotel_name": chunk.get("hotel_name", "DORMERO"),
                    "city": chunk.get("city", ""),
                    "topic": chunk["topic"],
                    "tags": ", ".join(chunk.get("tags", [])),
                    "source_file": json_file.name,
                },
            )
            nodes.append(node)
    return nodes


if __name__ == "__main__":
    nodes = load_nodes()
    print(f"Loaded {len(nodes)} chunks from {DATA_DIR}")

    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(
        nodes,
        storage_context=storage_context,
        embed_model=embed_model,
    )
    # Create payload indexes so Qdrant Cloud allows filtering on these fields
    for field in ("city", "hotel_id"):
        client.create_payload_index("hotels", field, PayloadSchemaType.KEYWORD)
        print(f"Payload index created: {field}")

    destination = qdrant_url if qdrant_url else "local ./qdrant_data"
    print(f"Ingestion complete. Vectors stored in {destination}")
