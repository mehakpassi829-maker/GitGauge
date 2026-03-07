# def calculate_hireability_score(commit_score: int, language_score: int):
#     """
#     Combine intelligence engines into final hireability score.
#     """

#     final_score = (commit_score * 0.6) + (language_score * 0.4)

#     return round(min(100, final_score), 2)/
def calculate_hireability_score(commit_score, language_score, engineering_score, algorithm_score):

    final_score = (
        commit_score * 0.3 +
        language_score * 0.25 +
        engineering_score * 0.25 +
        algorithm_score * 0.2
    )

    return round(final_score, 2)