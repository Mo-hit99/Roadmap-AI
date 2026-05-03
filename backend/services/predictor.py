from services.roadmap_generator import predict_success_ai


def predict_success(hours, skills):
    """
    Legacy success predictor — kept as a fast fallback.
    The primary path now uses predict_success_ai() for richer analysis.
    """
    score = 50

    if hours >=2:
        score +=20
    if 'python' in skills:
        score +=10
    if 'java' in skills:
        score +=10
    if 'c++' in skills:
        score +=10
    if 'c' in skills:
        score +=10
    if 'c#' in skills:
        score +=10
    return min(score,95)


def predict_success_full(goal, skills, hours, deadline):
    """
    AI-powered success prediction with structured output.
    Falls back to the legacy hardcoded predictor on failure.
    """
    try:
        result = predict_success_ai(goal, skills, hours, deadline)
        if isinstance(result, dict) and "score" in result:
            return result
    except Exception:
        pass

    # Fallback to legacy
    return {
        "score": predict_success(hours, skills),
        "reasoning": "Estimated using basic heuristics (AI analysis unavailable).",
        "risk_factors": ["AI predictor was not reachable"],
        "improvements": ["Try regenerating for a detailed AI analysis"]
    }