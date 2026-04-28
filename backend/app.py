import os
from flask import Flask, session
from flask_cors import CORS
from flask_session import Session
from routes.roadmap import roadmap_bp
from routes.auth import auth_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Security & CORS
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-12345')
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"])


# Session Configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
Session(app)

# Register Blueprints
app.register_blueprint(roadmap_bp, url_prefix='/api/roadmap')
app.register_blueprint(auth_bp, url_prefix='/api/auth')


@app.route('/')
def health_check():
    return {"status": "healthy", "message": "AI Roadmap Generator API is running"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
