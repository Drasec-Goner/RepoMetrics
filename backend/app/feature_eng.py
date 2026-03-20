def extract_features(data):

    commits = len(data["commits"])
    contributors = len(data["contributors"])
    issues = len(data["issues"])

    repo = data["repo"]

    stars = repo["stargazers_count"]
    forks = repo["forks_count"]
    language = repo["language"]

    return {
        "commits": commits,
        "contributors": contributors,
        "issues": issues,
        "stars": stars,
        "forks": forks,
        "language": language
    }