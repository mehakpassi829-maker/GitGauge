from backend.app.main import app  # import your Flask app
def handler(request):
    return app (request.environ, lambda status, headers:None)