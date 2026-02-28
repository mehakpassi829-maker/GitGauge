# app/analyzers/language_analyzer.py


def analyze_languages(repos):
    """
    Basic language intelligence.
    """

    language_count = {}

    for repo in repos:
        language = repo.get("language")
        if language:
            language_count[language] = language_count.get(language, 0) + 1

    if not language_count:
        return {
            "dominant_language": None,
            "language_score": 0
        }

    dominant_language = max(language_count, key=language_count.get)

    diversity_score = min(100, len(language_count) * 20)

    return {
        "dominant_language": dominant_language,
        "language_distribution": language_count,
        "language_score": diversity_score
    }