from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes_analysis import router as analysis_router
import os
import time

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "..", "Frontend", "templates"))
static_dir = os.path.join(BASE_DIR, "..", "Frontend", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "time": time.time()})

@app.get("/health")
def health():
    return {"status": "WorkDNA Running"}

@app.get("/commit")
def commit(request: Request):
    return templates.TemplateResponse("commit.html", {"request": request, "time": time.time()})

app.include_router(analysis_router)
