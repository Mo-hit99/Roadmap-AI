from flask import Blueprint, request, jsonify, session
from services.predictor import predict_success
from services.roadmap_generator import generate_roadmap, suggest_skills
from models.db import SessionLocal, RoadmapHistory

roadmap_bp = Blueprint("roadmap", __name__)

@roadmap_bp.route("/suggest-skills", methods=["POST"])
def generate_skill_suggestions():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    suggestions = suggest_skills(goal)
    if isinstance(suggestions, dict) and suggestions.get("error"):
        return jsonify({"message": suggestions["error"]}), 500

    return jsonify({"skills": suggestions})

@roadmap_bp.route("/generate", methods=["POST"])
def generate():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Authentication required"}), 401

    data = request.json
    goal = data['goal']
    skills = data['skills']
    hours = data['hours']
    deadline = data['deadline']

    success = predict_success(hours, skills)
    roadmap = generate_roadmap(goal, skills, hours, deadline)

    # Save to database
    db = SessionLocal()
    try:
        history = RoadmapHistory(
            user_id=user_id,
            goal=goal,
            skills=", ".join(skills) if isinstance(skills, list) else skills,
            hours=hours,
            deadline=deadline,
            success_score=float(success),
            roadmap_content=roadmap
        )
        db.add(history)
        db.commit()
    except Exception as e:
        print(f"Error saving to DB: {e}")
    finally:
        db.close()

    return jsonify({
        "success": success,
        "roadmap": roadmap
    })

@roadmap_bp.route("/history", methods=["GET"])
def get_history():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Authentication required"}), 401

    db = SessionLocal()
    try:
        history = db.query(RoadmapHistory).filter(RoadmapHistory.user_id == user_id).order_by(RoadmapHistory.created_at.desc()).all()
        return jsonify([{
            "id": h.id,
            "goal": h.goal,
            "skills": h.skills,
            "hours": h.hours,
            "deadline": h.deadline,
            "success": h.success_score,
            "roadmap": h.roadmap_content,
            "created_at": h.created_at.isoformat()
        } for h in history])
    finally:
        db.close()
