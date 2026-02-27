#!/usr/bin/env python3
"""
Smart CHANGELOG.md updater for Node.js projects.
Analyzes commits since last tag and creates categorized changelog entries.
Uses Conventional Commits format for categorization.
"""

import subprocess
import sys
import re
from datetime import datetime


def run_git(*args):
    """Run a git command and return output."""
    try:
        result = subprocess.run(
            ["git"] + list(args),
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return ""


def get_commits_since_tag(tag):
    """Get commit messages since the given tag (excluding the tag commit)."""
    if not tag:
        return run_git("log", "--pretty=format:%s", "HEAD").split("\n")
    return run_git("log", "--pretty=format:%s", f"{tag}..HEAD").split("\n")


def get_latest_tag():
    """Get the latest tag from git."""
    tags = run_git("tag", "-l", "--sort=-v:refname").split("\n")
    for t in tags:
        if t and re.match(r"^v?\d+\.\d+\.\d+", t):
            return t
    return None


def categorize_commit(msg):
    """
    Categorize commit by conventional commit type.
    Returns (category, clean_message).
    """
    msg = msg.strip()
    if not msg:
        return "Other", msg

    # Match conventional commit format: type(scope): description
    match = re.match(r"^(\w+)(?:\([^)]+\))?!?:\s*(.+)$", msg, re.IGNORECASE)
    if match:
        ctype, desc = match.groups()
        ctype_lower = ctype.lower()

        category_map = {
            "feat": "Added",
            "feature": "Added",
            "fix": "Fixed",
            "bugfix": "Fixed",
            "perf": "Performance",
            "performance": "Performance",
            "refactor": "Changed",
            "docs": "Documentation",
            "style": "Changed",
            "test": "Tests",
            "ci": "CI/CD",
            "build": "Build",
            "chore": "Miscellaneous",
        }
        category = category_map.get(ctype_lower, "Changed")
        return category, desc.strip()

    return "Other", msg


def update_changelog(new_tag):
    """Update CHANGELOG.md with new release section."""
    # Ensure tag has v prefix for display
    display_tag = new_tag if new_tag.startswith("v") else f"v{new_tag}"
    clean_version = new_tag.lstrip("v")

    latest_tag = get_latest_tag()
    commits = get_commits_since_tag(latest_tag)

    # Filter out empty and merge commits
    commits = [
        c for c in commits
        if c and not c.startswith("Merge ") and not c.startswith("merge ")
    ]

    # Categorize commits
    categories = {}
    for msg in commits:
        cat, desc = categorize_commit(msg)
        if cat not in categories:
            categories[cat] = []
        if desc and desc not in [d for d in categories[cat]]:
            categories[cat].append(desc)

    # Build new changelog section
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [f"## [{display_tag}] - {today}", ""]

    # Order of categories to display
    category_order = ["Added", "Changed", "Fixed", "Performance", "Documentation", "Tests", "CI/CD", "Build", "Miscellaneous", "Other"]

    for cat in category_order:
        if cat in categories and categories[cat]:
            lines.append(f"### {cat}")
            lines.append("")
            for item in categories[cat]:
                # Capitalize first letter
                item = item[0].upper() + item[1:] if item else item
                lines.append(f"- {item}")
            lines.append("")

    # Remove trailing newline from last section
    if lines and lines[-1] == "":
        lines = lines[:-1]

    new_section = "\n".join(lines)

    # Read existing CHANGELOG
    try:
        with open("CHANGELOG.md", "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print("Error: CHANGELOG.md not found")
        sys.exit(1)

    # Replace Unreleased section: match from ## [Unreleased] until next ## [ or end
    unreleased_pattern = r"## \[Unreleased\][\s\S]*?(?=\n## \[|\Z)"
    replacement = f"## [Unreleased]\n\n- (Add new changes here)\n\n{new_section}\n\n"
    new_content = re.sub(unreleased_pattern, replacement, content, count=1)

    if new_content == content:
        # Fallback: insert after first ## [Unreleased]
        unreleased_simple = "## [Unreleased]"
        if unreleased_simple in content:
            idx = content.find(unreleased_simple)
            # Find end of this section (next ## or end of file)
            next_section = content.find("\n## ", idx + 1)
            end_idx = next_section if next_section != -1 else len(content)
            new_content = (
                content[:idx]
                + "## [Unreleased]\n\n- (Add new changes here)\n\n"
                + new_section
                + "\n\n"
                + content[end_idx:]
            )
        else:
            new_content = content + "\n\n" + new_section + "\n"

    with open("CHANGELOG.md", "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated CHANGELOG.md with {len(commits)} commits in {len(categories)} categories")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: update_changelog.py <new_tag>")
        sys.exit(1)

    new_tag = sys.argv[1]
    update_changelog(new_tag)
