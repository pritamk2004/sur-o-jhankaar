from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.classifiers.language_classifier import classify_languages
from app.classifiers.theme_classifier import classify_mood_theme
from app.config import settings

app = FastAPI(
    title="Sur o Jhankaar - Ingestion & Classification Engine",
    description="Internal Python service for metadata resolution, CSV processing, and audio classification",
    version="1.0.0"
)

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized internal request")
    return x_api_key

class ClassificationRequest(BaseModel):
    title: str
    artists: Optional[str] = ""
    playlists: Optional[List[str]] = []

class ClassificationResponse(BaseModel):
    languages: List[str]
    mood_theme: str

class SongImportRequest(BaseModel):
    url: str
    title: Optional[str] = None
    artists: Optional[str] = None
    playlists: Optional[List[str]] = []

class PlaylistImportRequest(BaseModel):
    url: str
    target_playlists: Optional[List[str]] = []

@app.get("/internal/health")
async def health():
    return {
        "status": "HEALTHY",
        "service": "python-ingestion-engine",
        "environment": settings.ENVIRONMENT
    }

@app.post("/internal/classify", response_model=ClassificationResponse, dependencies=[Depends(verify_api_key)])
async def classify_song(req: ClassificationRequest):
    languages = classify_languages(req.playlists or [], req.title, req.artists or "")
    mood_theme = classify_mood_theme(req.playlists or [], req.title)
    return ClassificationResponse(languages=languages, mood_theme=mood_theme)

@app.post("/internal/import/song", dependencies=[Depends(verify_api_key)])
async def internal_import_song(req: SongImportRequest):
    languages = classify_languages(req.playlists or [], req.title or "", req.artists or "")
    mood_theme = classify_mood_theme(req.playlists or [], req.title or "")
    return {
        "success": True,
        "url": req.url,
        "title": req.title or "Ingested Audio Track",
        "languages": languages,
        "mood_theme": mood_theme
    }

@app.post("/internal/import/playlist", dependencies=[Depends(verify_api_key)])
async def internal_import_playlist(req: PlaylistImportRequest):
    return {
        "success": True,
        "url": req.url,
        "status": "QUEUED",
        "target_playlists": req.target_playlists
    }
