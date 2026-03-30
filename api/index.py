import sys
import os

# Add your backend folder to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../Backend'))

from app.main import app  # import your Flask app