import os
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
