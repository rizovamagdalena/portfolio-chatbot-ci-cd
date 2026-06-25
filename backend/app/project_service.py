import asyncio
import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List

import openai
from motor.motor_asyncio import AsyncIOMotorClient

from app.vector_store import VectorStore

CHUNK_TYPES = ["Purpose", "Architecture", "Tech Stack", "Functionality", "AI Usage"]
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGODB_DB", "project_portfolio")
OPENAI_MODEL = os.getenv("OPENAI_PROJECT_MODEL", "gpt-4o-mini")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_PROJECT_MAX_TOKENS", "500"))

PROJECT_CHUNK_PROMPT = """You are a software portfolio assistant helping index a developer's projects.

Given a project name and description, return exactly one JSON array containing five objects.
Each object must contain the keys:
- type
- text

The objects must appear in this order:
1. Purpose
2. Architecture
3. Tech Stack
4. Functionality
5. AI Usage

CRITICAL RULES:
- Extract ONLY information explicitly stated in the description. Do NOT infer, assume, or add anything.
- If the description does not mention something for a category, write exactly what is known or state "Not specified in the project description."
- For "AI Usage": if the description says no AI is used, state that explicitly. Never assume AI is used unless clearly mentioned.
- For "Tech Stack": list only technologies explicitly named. Do not add frameworks or tools not mentioned.
- Keep each text value to 1-2 sentences maximum.
- Do not embellish, expand, or improve the description — only extract and summarize what is written.

Respond with valid JSON only. Do not include any extra explanation or markdown.

Project Name: {project_name}
Project Description: {description}
"""


class ProjectService:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.mongo_client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.mongo_client[MONGO_DB]

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("Set your OPENAI_API_KEY in .env!")
        openai.api_key = openai_api_key

    async def add_project(self, name: str, description: str) -> str:
        project_name = name.strip()
        project_description = description.strip()

        if not project_name:
            raise ValueError("Project name cannot be empty")
        if not project_description:
            raise ValueError("Project description cannot be empty")

        project_id = uuid.uuid4().hex
        project_doc = {
            "project_id": project_id,
            "name": project_name,
            "description": project_description,
            "created_at": datetime.utcnow()
        }

        await self.db.projects.insert_one(project_doc)

        chunks = await self.generate_project_chunks(project_name, project_description)
        await self._save_chunks(project_id, chunks)
        await self._add_chunks_to_chroma(project_id, project_name, chunks)

        return project_id

    async def generate_project_chunks(self, project_name: str, description: str) -> List[Dict[str, str]]:
        prompt = PROJECT_CHUNK_PROMPT.format(project_name=project_name, description=description)
        raw_response = await asyncio.to_thread(self._create_openai_completion, prompt)
        return self._parse_chunks(raw_response)

    def _create_openai_completion(self, prompt: str) -> str:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=OPENAI_MAX_TOKENS,
        )
        return response.choices[0].message.content

    def _parse_chunks(self, raw_response: str) -> List[Dict[str, str]]:
        raw_text = raw_response.strip()
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            match = re.search(r"(\[.*\])", raw_text, re.S)
            if not match:
                raise ValueError("OpenAI returned invalid JSON for project chunks")
            parsed = json.loads(match.group(1))

        if not isinstance(parsed, list):
            raise ValueError("Chunk generation response must be a JSON list")

        chunk_map: Dict[str, str] = {}
        for item in parsed:
            if not isinstance(item, dict):
                raise ValueError("Each chunk must be an object with type and text")
            chunk_type = self._normalize_chunk_type(item.get("type"))
            chunk_text = item.get("text")
            if not chunk_type or not chunk_text or not isinstance(chunk_text, str):
                raise ValueError("Each chunk must include a non-empty type and text")
            if chunk_type in chunk_map:
                raise ValueError(f"Duplicate chunk type returned: {chunk_type}")
            chunk_map[chunk_type] = chunk_text.strip()

        if set(chunk_map.keys()) != set(CHUNK_TYPES):
            missing = [t for t in CHUNK_TYPES if t not in chunk_map]
            raise ValueError(f"Chunk generation did not return all required types: {missing}")

        return [{"type": chunk_type, "text": chunk_map[chunk_type]} for chunk_type in CHUNK_TYPES]

    def _normalize_chunk_type(self, raw_type: Any) -> str:
        if not raw_type or not isinstance(raw_type, str):
            return ""
        normalized = raw_type.strip().lower().replace("_", " ")
        for canonical in CHUNK_TYPES:
            if canonical.lower() == normalized or canonical.lower() == normalized.replace(" ", ""):
                return canonical
        return ""

    async def _save_chunks(self, project_id: str, chunks: List[Dict[str, str]]) -> None:
        chunk_documents = []
        for chunk in chunks:
            chunk_documents.append({
                "project_id": project_id,
                "type": chunk["type"],
                "text": chunk["text"],
                "created_at": datetime.utcnow(),
            })
        await self.db.chunks.insert_many(chunk_documents)

    async def _add_chunks_to_chroma(self, project_id: str, project_name: str, chunks: List[Dict[str, str]]) -> None:
        await asyncio.to_thread(self._add_chunks_to_chroma_sync, project_id, project_name, chunks)

    def _add_chunks_to_chroma_sync(self, project_id: str, project_name: str, chunks: List[Dict[str, str]]) -> None:
        for idx, chunk in enumerate(chunks):
            doc_id = f"{project_id}_{idx}"
            metadata = {
                "project_id": project_id,
                "project_name": project_name,
                "chunk_type": chunk["type"],
                "doc_id": doc_id,
            }
            self.vector_store.add_document(doc_id=doc_id, text=chunk["text"], metadata=metadata)

    async def list_projects(self) -> List[Dict]:
        cursor = self.db.projects.find({}, {"_id": 0, "project_id": 1, "name": 1, "description": 1, "created_at": 1})
        projects = []
        async for doc in cursor:
            projects.append(doc)
        return projects

    async def update_project(self, project_id: str, name: str, description: str) -> str:
        existing = await self.db.projects.find_one({"project_id": project_id})
        if not existing:
            raise ValueError(f"Project {project_id} not found")

        # Update MongoDB project doc
        await self.db.projects.update_one(
            {"project_id": project_id},
            {"$set": {"name": name.strip(), "description": description.strip()}}
        )

        # Delete old chunks from MongoDB
        await self.db.chunks.delete_many({"project_id": project_id})

        # Delete old chunks from ChromaDB
        await self._delete_chunks_from_chroma(project_id)

        # Re-generate and re-embed
        chunks = await self.generate_project_chunks(name, description)
        await self._save_chunks(project_id, chunks)
        await self._add_chunks_to_chroma(project_id, name, chunks)

        return project_id

    async def delete_project(self, project_id: str) -> None:
        existing = await self.db.projects.find_one({"project_id": project_id})
        if not existing:
            raise ValueError(f"Project {project_id} not found")

        await self.db.projects.delete_one({"project_id": project_id})
        await self.db.chunks.delete_many({"project_id": project_id})
        await self._delete_chunks_from_chroma(project_id)

    async def _delete_chunks_from_chroma(self, project_id: str) -> None:
        await asyncio.to_thread(self._delete_chunks_from_chroma_sync, project_id)

    def _delete_chunks_from_chroma_sync(self, project_id: str) -> None:
        collection = self.vector_store.vector_store._collection
        # Get all doc IDs for this project
        results = collection.get(where={"project_id": project_id}, include=[])
        ids_to_delete = results.get("ids", [])
        if ids_to_delete:
            collection.delete(ids=ids_to_delete)