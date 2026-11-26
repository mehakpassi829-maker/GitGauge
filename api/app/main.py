from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes_analysis import router as analysis_router
import os
import time

app = FastAPI(title="GitGauge", description="Developer Intelligence Platform")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "..", "Frontend", "templates"))
static_dir = os.path.join(BASE_DIR, "..", "Frontend", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/landing", response_class=HTMLResponse)
def landing(request: Request):
    return templates.TemplateResponse("landing.html", {"request": request, "time": time.time()})

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "time": time.time()})

@app.get("/workspace", response_class=HTMLResponse)
def workspace(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "time": time.time()})

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "time": time.time()})

@app.get("/methodology", response_class=HTMLResponse)
def methodology(request: Request):
    return RedirectResponse(url="/landing#methodology")

@app.get("/health")
def health():
    return {"status": "GitGauge Running", "version": "2.0"}

app.include_router(analysis_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

