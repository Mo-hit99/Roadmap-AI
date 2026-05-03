import json
from flask import Blueprint, request, jsonify, session
from models.db import SessionLocal, CareerToolHistory
from sqlalchemy import desc
from services.roadmap_generator import (
    mentor_chat,
    match_job_roles,
    generate_resume,
    generate_daily_plan,
    analyze_skill_gaps,
)

mentor_bp = Blueprint("mentor", __name__)


def _require_auth():
    user_id = session.get("user_id")
    if not user_id:
        return None, (jsonify({"message": "Authentication required"}), 401)
    return user_id, None


def _save_tool_history(user_id, tool_type, title, content):
    db = SessionLocal()
    try:
        history = CareerToolHistory(
            user_id=user_id,
            tool_type=tool_type,
            title=title,
            content=json.dumps(content, ensure_ascii=False)
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        return history
    except Exception as e:
        db.rollback()
        print(f"Error saving {tool_type} history: {e}")
        return None
    finally:
        db.close()


@mentor_bp.route("/chat", methods=["POST"])
def chat():
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])
    hours = data.get("hours", 10)
    deadline = data.get("deadline", "")
    progress = data.get("progress", "")
    message = (data.get("message") or "").strip()

    if not goal or not message:
        return jsonify({"message": "Goal and message are required"}), 400

    reply = mentor_chat(goal, skills, hours, deadline, progress, message)
    _save_tool_history(user_id, "mentor_chat", f"Chat about {goal}", {"message": message, "reply": reply})

    return jsonify({"reply": reply})


@mentor_bp.route("/job-match", methods=["POST"])
def job_match():
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])

    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    result = match_job_roles(goal, skills)
    _save_tool_history(user_id, "job_match", f"Job Matching for {goal}", result)

    return jsonify(result)


@mentor_bp.route("/resume", methods=["POST"])
def resume():
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])
    projects = (data.get("projects") or "").strip()

    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    result = generate_resume(goal, skills, projects)
    history = _save_tool_history(
        user_id,
        "resume",
        f"Resume for {goal}",
        {
            "goal": goal,
            "skills": skills,
            "projects": projects,
            "resume": result,
        },
    )

    return jsonify({"resume": result, "history_id": history.id if history else None})


@mentor_bp.route("/resume/<int:history_id>", methods=["PATCH"])
def update_resume(history_id):
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    resume_content = (data.get("resume") or "").rstrip()
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])
    projects = (data.get("projects") or "").strip()

    if not resume_content:
        return jsonify({"message": "Resume content is required"}), 400

    db = SessionLocal()
    try:
        history = db.query(CareerToolHistory).filter_by(
            id=history_id,
            user_id=user_id,
            tool_type="resume",
        ).first()
        if not history:
            return jsonify({"message": "Resume not found"}), 404

        try:
            content = json.loads(history.content)
        except json.JSONDecodeError:
            content = {}

        existing_goal = content.get("goal", "")
        content["resume"] = resume_content
        content["goal"] = goal or existing_goal
        content["skills"] = skills if isinstance(skills, list) else content.get("skills", [])
        content["projects"] = projects if projects else content.get("projects", "")

        title_goal = content["goal"] or "Saved Resume"
        history.title = f"Resume for {title_goal}"
        history.content = json.dumps(content, ensure_ascii=False)
        db.commit()

        return jsonify({
            "history_id": history.id,
            "title": history.title,
            "resume": content["resume"],
        })
    except Exception as e:
        db.rollback()
        print(f"Error updating resume history: {e}")
        return jsonify({"message": "Failed to update resume"}), 500
    finally:
        db.close()


@mentor_bp.route("/daily-plan", methods=["POST"])
def daily_plan():
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])
    hours = data.get("hours", 10)

    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    result = generate_daily_plan(goal, skills, hours)
    _save_tool_history(user_id, "daily_plan", f"7-Day Plan: {goal}", result)

    return jsonify(result)


@mentor_bp.route("/skill-gap", methods=["POST"])
def skill_gap():
    user_id, err = _require_auth()
    if err:
        return err

    data = request.json or {}
    goal = (data.get("goal") or "").strip()
    skills = data.get("skills", [])

    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    result = analyze_skill_gaps(goal, skills)
    _save_tool_history(user_id, "skill_gap", f"Skill Gap for {goal}", result)

    return jsonify(result)


@mentor_bp.route("/history", methods=["GET"])
def get_history():
    user_id, err = _require_auth()
    if err:
        return err

    db = SessionLocal()
    try:
        history_list = db.query(CareerToolHistory).filter_by(user_id=user_id).order_by(desc(CareerToolHistory.created_at)).all()
        results = []
        for h in history_list:
            try:
                content = json.loads(h.content)
            except json.JSONDecodeError:
                content = {"raw": h.content}
            results.append({
                "id": h.id,
                "tool_type": h.tool_type,
                "title": h.title,
                "content": content,
                "created_at": h.created_at.isoformat()
            })
        return jsonify({"history": results})
    finally:
        db.close()
