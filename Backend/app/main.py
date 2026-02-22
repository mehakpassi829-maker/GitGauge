from fastapi import FastAPI
from app.api.routes_analysis import router as analysis_router

app = FastAPI(
    title="WorkDNA API",
    description="Behavioral coding intelligence from GitHub",
    version="1.0"
)

@app.get("/health")
def health():
    return {"status": "WorkDNA Running"}

app.include_router(analysis_router)