import os
import sys

import easydict


from waitress import serve
from django.core.wsgi import get_wsgi_application

# 1. Setup Django Environment
# Replace 'your_project_name' with the name of the folder containing settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

def start_backend():
    try:
        # 2. Initialize Django
        print("Starting Django backend...")
        application = get_wsgi_application()

        # 3. Define Port
        # We check for a command line argument, otherwise default to 8000
        port = sys.argv[1] if len(sys.argv) > 1 else '8000'
        
        print(f"Server is running on http://127.0.0.1:{port}")
        
        # 4. Run the Server
        # 'threads' can be adjusted based on expected app load
        serve(application, host='127.0.0.1', port=port, threads=4)
        
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...") # Keeps window open on crash

if __name__ == "__main__":
    start_backend()
