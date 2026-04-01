import sys
import os

# Add the root directory to Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_dir)

# Also add /var/task explicitly for Vercel
sys.path.insert(0, '/var/task')

from backend.app.main import app
