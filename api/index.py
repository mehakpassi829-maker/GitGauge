import sys 
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from backend.app.main import app  # import your Flask app

# def handler(request):
#     return app (request.environ, lambda status, headers:None)