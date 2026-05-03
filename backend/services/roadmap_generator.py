import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client with Ollama configuration
client = OpenAI(
    base_url=os.getenv("OLLAMA_BASE_URL"),
    api_key=os.getenv("OLLAMA_API_KEY", "ollama"), # Default to 'ollama' if not provided
)

def _chat(messages):
    model = os.getenv("OLLAMA_MODEL")
    response = client.chat.completions.create(
        model=model,
        messages=messages
    )
    return response.choices[0].message.content

def _chat_json(messages):
    """Chat wrapper that attempts to parse JSON from the response."""
    raw = _chat(messages) or ""
    # Try to extract JSON from markdown code blocks
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}

def generate_roadmap(goal, skills, hours, deadline):
    prompt = f"""
    As an expert career coach and technical architect, create a practical, human-readable learning roadmap.

    User Profile:
    - Primary Goal: {goal}
    - Current Skills: {skills}
    - Weekly Commitment: {hours} hours
    - Target Deadline: {deadline}

    Return clean Markdown only. Use simple language and avoid long paragraphs.

    Required structure:

    # Roadmap Summary
    3-4 short bullets explaining the plan, timeline, and expected outcome.

    # Technology Timeline
    Create a Markdown table with these exact columns:
    | Phase | Timeline | Technologies | Outcome |
    Include 4 to 6 phases. Technologies must be comma-separated. Timeline should use weeks or months.

    # Weekly Plan
    Use clear week ranges, for example:
    ## Week 1-2: Foundation
    - Learn:
    - Build:
    - Proof of progress:

    # Projects
    List 2-4 practical projects with the technologies used.

    # Resources
    List important documentation, tools, courses, or practice sources.

    # Success Tips
    List concrete habits and checkpoints.
    """

    try:
        return _chat([
            {"role": "system", "content": "You are a professional roadmap generator. Produce concise, actionable, well-structured Markdown with a technology timeline table and weekly milestones."},
            {"role": "user", "content": prompt}
        ])
    except Exception as e:
        return f"Error generating roadmap: {str(e)}"

def suggest_skills(goal):
    prompt = f"""
    Suggest 8 to 12 practical skills someone should have or start learning for this primary goal:
    {goal}

    Return only a comma-separated list of skill names.
    Keep each skill short and specific.
    Do not include numbering, headings, or explanations.
    """

    try:
        content = _chat([
            {"role": "system", "content": "You suggest concise, role-relevant skills. Return only comma-separated skill names."},
            {"role": "user", "content": prompt}
        ]) or ""
        return [skill.strip(" -\n\r\t") for skill in content.split(",") if skill.strip()]
    except Exception as e:
        return {"error": f"Error generating skills: {str(e)}"}


# ─── New AI Service Functions ────────────────────────────────────────

def predict_success_ai(goal, skills, hours, timeline):
    """AI-powered success probability calculator."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    prompt = f"""
Analyze this career plan and calculate a realistic success probability.

Goal: {goal}
Current Skills: {skills_str}
Weekly Hours Available: {hours}
Timeline: {timeline}

Steps:
1. Evaluate difficulty of the goal
2. Compare required vs current skills
3. Evaluate time availability vs what's needed
4. Calculate probability (0-100%)

Return ONLY valid JSON in this exact format:
{{
  "score": <number 0-100>,
  "reasoning": "<2-3 sentences explaining the score>",
  "risk_factors": ["<risk1>", "<risk2>", "<risk3>"],
  "improvements": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
}}

Be brutally honest. No sugarcoating. If the plan is unrealistic, say so.
"""
    try:
        result = _chat_json([
            {"role": "system", "content": "You are a career success analyst. Return only valid JSON. Be realistic and critical."},
            {"role": "user", "content": prompt}
        ])
        if "score" in result:
            return result
        # Fallback if JSON parsing failed
        return {
            "score": 50,
            "reasoning": result.get("raw", "Could not parse AI response."),
            "risk_factors": ["Unable to fully analyze — try again"],
            "improvements": ["Provide more specific skills and timeline"]
        }
    except Exception as e:
        return {
            "score": 50,
            "reasoning": f"Analysis error: {str(e)}",
            "risk_factors": ["Service temporarily unavailable"],
            "improvements": ["Try again in a moment"]
        }


def mentor_chat(goal, skills, hours, deadline, progress, user_message):
    """AI Mentor chat — context-aware career advisor."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    system_prompt = f"""You are a personal AI career mentor. You are direct, practical, and slightly strict.

User Context:
- Goal: {goal}
- Current Skills: {skills_str}
- Weekly Hours: {hours}
- Target Date: {deadline}
- Current Progress: {progress or "Not specified"}

Rules:
- Answer based ONLY on the user's roadmap context
- Give actionable, short advice
- If the user asks "what to do today", give 2-3 concrete tasks
- If user is behind schedule, warn them honestly
- Suggest improvements or shortcuts where needed
- Keep responses under 200 words
- Use bullet points for tasks

Tone: Friendly but strict. Focus on execution, not motivation."""

    try:
        return _chat([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ])
    except Exception as e:
        return f"Mentor unavailable: {str(e)}"


def match_job_roles(goal, skills):
    """Match user skills to real job roles with readiness assessment."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    prompt = f"""
You are an AI career matcher. Based on the user's goal and skills, suggest 3-5 realistic job roles.

Goal: {goal}
Current Skills: {skills_str}

For each role, provide:
- Job title (real, commonly posted on job boards)
- Readiness level (0-100%)
- List of missing skills they need
- 1-2 specific improvement suggestions

Return ONLY valid JSON in this exact format:
{{
  "roles": [
    {{
      "title": "<Job Title>",
      "readiness": <number 0-100>,
      "missing_skills": ["<skill1>", "<skill2>"],
      "suggestions": ["<improvement1>", "<improvement2>"]
    }}
  ]
}}

Focus on real-world hiring requirements. Be realistic about readiness levels.
"""
    try:
        result = _chat_json([
            {"role": "system", "content": "You are a job market analyst. Return only valid JSON. Be realistic about job requirements."},
            {"role": "user", "content": prompt}
        ])
        if "roles" in result:
            return result
        return {"roles": [], "error": "Could not parse job matches"}
    except Exception as e:
        return {"roles": [], "error": str(e)}


def generate_resume(goal, skills, projects):
    """Generate an ATS-friendly resume in markdown."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    prompt = f"""
Generate a professional, ATS-friendly resume in clean Markdown format.

Target Role: {goal}
Skills: {skills_str}
Projects: {projects}

Structure:
# [Full Name - placeholder]

## Professional Summary
2-3 sentences targeting the role. Strong action verbs. Fresher-friendly.

## Technical Skills
Organized by category (Languages, Frameworks, Tools, etc.)

## Projects
For each project:
### Project Name
- **Tech Stack**: ...
- Impact-based bullet points using action verbs and metrics where possible
- 2-3 bullets per project

## Education
[Placeholder for user to fill]

## Certifications
Suggest 2-3 relevant certifications for the role.

Rules:
- Use strong action verbs (Built, Developed, Implemented, Optimized)
- Make it ATS-friendly (no tables, no columns, no graphics)
- Focus on impact and outcomes
- Keep it to 1 page worth of content
- Make it strong for freshers with no experience
"""
    try:
        return _chat([
            {"role": "system", "content": "You are a professional resume writer specializing in tech roles. Create clean, ATS-optimized markdown resumes."},
            {"role": "user", "content": prompt}
        ])
    except Exception as e:
        return f"Error generating resume: {str(e)}"


def generate_daily_plan(goal, skills, hours):
    """Generate a 7-day actionable study/work plan."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    daily_hours = round(int(hours) / 7, 1) if hours else 1
    prompt = f"""
Create a realistic 7-day learning plan.

Goal: {goal}
Current Skills: {skills_str}
Daily time available: ~{daily_hours} hours

For each day, provide:
- Learning topic (what to study)
- Practice task (what to build/do)
- Expected outcome (what you'll have done)

Return ONLY valid JSON in this exact format:
{{
  "days": [
    {{
      "day": 1,
      "label": "<Day theme, e.g. Foundation Setup>",
      "learning": "<What to study>",
      "practice": "<What to build or practice>",
      "outcome": "<What you'll accomplish>"
    }}
  ]
}}

Keep tasks realistic for ~{daily_hours} hours per day. Focus on practical skills.
"""
    try:
        result = _chat_json([
            {"role": "system", "content": "You are a study planner. Return only valid JSON. Keep daily tasks realistic and focused."},
            {"role": "user", "content": prompt}
        ])
        if "days" in result:
            return result
        return {"days": [], "error": "Could not parse daily plan"}
    except Exception as e:
        return {"days": [], "error": str(e)}


def analyze_skill_gaps(goal, skills):
    """Compare user skills with industry requirements for the goal."""
    skills_str = ", ".join(skills) if isinstance(skills, list) else skills
    prompt = f"""
Compare the user's current skills with what the industry requires for their goal.

Goal: {goal}
Current Skills: {skills_str}

Analyze and categorize:
1. Missing Critical Skills — must-have for the role, user doesn't have them
2. Optional Skills — nice-to-have, would boost candidacy
3. Priority order — rank all missing skills from highest to lowest importance

Return ONLY valid JSON in this exact format:
{{
  "critical": [
    {{"skill": "<skill name>", "reason": "<why it's critical>"}}
  ],
  "optional": [
    {{"skill": "<skill name>", "reason": "<why it helps>"}}
  ],
  "priority_order": ["<highest priority skill>", "<next>", "..."],
  "summary": "<1-2 sentence overall assessment>"
}}

Focus on job relevance. Be specific about why each skill matters.
"""
    try:
        result = _chat_json([
            {"role": "system", "content": "You are a skills analyst. Return only valid JSON. Focus on real hiring requirements."},
            {"role": "user", "content": prompt}
        ])
        if "critical" in result:
            return result
        return {
            "critical": [],
            "optional": [],
            "priority_order": [],
            "summary": result.get("raw", "Could not analyze skill gaps")
        }
    except Exception as e:
        return {
            "critical": [],
            "optional": [],
            "priority_order": [],
            "summary": f"Analysis error: {str(e)}"
        }
