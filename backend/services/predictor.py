def predict_success(hours,skills):
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