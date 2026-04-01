def calculate_hireability_score(commit, architect, algorithm, collaboration, documentation, developer):
    score = round(
        commit        * 0.18 +
        architect     * 0.20 +
        algorithm     * 0.17 +
        collaboration * 0.15 +
        documentation * 0.15 +
        developer     * 0.15
    )
    grade_map = [
        (85, "A+", "Exceptional"),
        (70, "A",  "Internship Ready"),
        (55, "B+", "Keep Building"),
        (40, "B",  "Developing"),
        (0,  "C",  "Early Stage"),
    ]
    grade, label = next(
        ((g, l) for threshold, g, l in grade_map if score >= threshold),
        ("C", "Early Stage")
    )
    return {"score": min(score, 100), "grade": grade, "label": label}
