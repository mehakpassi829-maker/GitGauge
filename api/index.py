import sys
import os

# Add your backend folder to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app  # import your Flask app