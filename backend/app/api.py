from fastapi import APIRouter, HTTPException
from app.schemas import (
    QueryRequest,
    QueryResponse,
    HealthResponse,
    ProjectInfo,
    CreateProjectRequest,
    CreateProjectResponse, UpdateProjectRequest,
)
from app.vector_store import VectorStore
from app.llm import LLM
from app.project_service import ProjectService
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

_vector_store = None
_llm = None
_project_service = None


def get_vector_store():
    global _vector_store
    if _vector_store is None:
        CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "chroma_db")
        _vector_store = VectorStore(persist_dir=CHROMA_PERSIST_DIR)
    return _vector_store


def get_llm():
    global _llm
    if _llm is None:
        _llm = LLM()
    return _llm


def get_project_service():
    global _project_service
    if _project_service is None:
        _project_service = ProjectService(get_vector_store())
    return _project_service

def classify_query(query: str, known_projects: dict) -> tuple:
    query_lower = query.lower()
    for project_id, project_name in known_projects.items():
        # Check full name
        if project_name.lower() in query_lower:
            return "specific", project_id
        # Check each word, stripping punctuation (catches "StyleCast" from "(StyleCast)")
        for word in project_name.split():
            clean_word = word.strip("()[].,!?").lower()
            if len(clean_word) > 4 and clean_word in query_lower:
                return "specific", project_id
    return "general", None

@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        vector_store = get_vector_store()
        all_projects = vector_store.list_all_projects()
        collection = vector_store.vector_store._collection
        total_docs = collection.count()
        return HealthResponse(
            status="healthy",
            total_documents=total_docs,
            available_projects=all_projects
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def query_projects(request: QueryRequest):
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        vector_store = get_vector_store()
        llm = get_llm()

        docs, metadatas, distances = vector_store.query(request.query, top_k=request.top_k)

        # Get known projects for query classification
        known_projects = vector_store.list_all_projects()

        # Classify the query
        query_type, matched_project_id = classify_query(request.query, known_projects)

        if query_type == "specific":
            # Get ALL chunks for this specific project
            docs, metadatas, distances = vector_store.query_by_project(matched_project_id)
        else:
            # General query — search all chunks, best match per project
            docs, metadatas, distances = vector_store.query_general(request.query)

        if not docs:
            return QueryResponse(
                answer="I don't have information about that in my project database.",
                sources=[],
                projects_searched=[]
            )

        projects_searched = list(set(m["project_name"] for m in metadatas))
        answer = llm.ask_with_context(request.query, docs, metadatas=metadatas)

        sources = []
        for doc, meta, dist in zip(docs, metadatas, distances):
            sources.append(ProjectInfo(
                project_id=meta['project_id'],
                project_name=meta['project_name'],
                chunk_type=meta['chunk_type'],
                relevance_score=round(1 / dist if dist > 0 else 100, 2),
                content=doc
            ))

        return QueryResponse(answer=answer, sources=sources, projects_searched=projects_searched)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects")
async def list_projects():
    try:
        project_service = get_project_service()
        projects = await project_service.list_projects()
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects", response_model=CreateProjectResponse)
async def add_project(request: CreateProjectRequest):
    try:
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        if not request.description.strip():
            raise HTTPException(status_code=400, detail="Description cannot be empty")

        project_service = get_project_service()
        project_id = await project_service.add_project(request.name, request.description)
        return CreateProjectResponse(project_id=project_id)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/projects/{project_id}", response_model=CreateProjectResponse)
async def update_project(project_id: str, request: UpdateProjectRequest):
    try:
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        if not request.description.strip():
            raise HTTPException(status_code=400, detail="Description cannot be empty")

        project_service = get_project_service()
        updated_id = await project_service.update_project(project_id, request.name, request.description)
        return CreateProjectResponse(project_id=updated_id)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    try:
        project_service = get_project_service()
        await project_service.delete_project(project_id)
        return {"message": f"Project {project_id} deleted successfully"}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))