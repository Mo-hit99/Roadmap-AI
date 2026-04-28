from flask import Blueprint, request, jsonify, session
from models.db import SessionLocal, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            return jsonify({"message": "User already exists"}), 400

        user = User(email=email)
        user.set_password(password)
        db.add(user)
        db.commit()
        return jsonify({"message": "User created successfully"}), 201
    finally:
        db.close()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user and user.check_password(password):
            session["user_id"] = user.id
            return jsonify({"message": "Login successful", "user": {"id": user.id, "email": user.email}}), 200
        return jsonify({"message": "Invalid email or password"}), 401
    finally:
        db.close()

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Not authenticated"}), 401

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return jsonify({"user": {"id": user.id, "email": user.email}}), 200
        return jsonify({"message": "User not found"}), 404
    finally:
        db.close()
