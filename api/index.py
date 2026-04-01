import sys
import os
import importlib.util

# Get absolute path to main.py
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
main_path = os.path.join(base, 'Backend', 'app', 'main.py')

# Add all necessary paths
sys.path.insert(0, base)
sys.path.insert(0, os.path.join(base, 'Backend'))
sys.path.insert(0, os.path.join(base, 'Backend', 'app'))

# Load main.py directly
spec = importlib.util.spec_from_file_location('main', main_path)
module = importlib.util.module_from_spec(spec)
sys.modules['main'] = module
spec.loader.exec_module(module)

app = module.app
