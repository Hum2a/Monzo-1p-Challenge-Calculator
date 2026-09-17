#!/usr/bin/env python3
"""
Smart CHANGELOG.md updater for Node.js projects.
Analyzes commits since last tag and creates categorized changelog entries.
Transforms raw commit messages into concise, user-friendly changelog lines.
Uses Conventional Commits format for categorization.
"""

import subprocess
import sys
import re
from datetime import datetime
from collections import defaultdict

# Max length for a changelog line (soft limit)
MAX_LINE_LENGTH = 80

# Phrases to strip from descriptions (verbose filler)
VERBOSE_PHRASES = [
    r"\s*\.\s*This\s+change\s+ensures?\s+[^.]*\.?",
    r"\s*\.\s*This\s+update\s+[^.]*\.?",
    r"\s*,\s*ensuring\s+[^.]*\.?",
    r"\s*,\s*enhancing\s+[^.]*\.?",
    r"\s*,\s*improving\s+[^.]*\.?",
    r"\s*,\s*promoting\s+[^.]*\.?",
    r"\s*,\s*maintaining\s+[^.]*\.?",
    r"\s*,\s*establishing\s+[^.]*\.?",
    r"\s+for\s+improved\s+[^.]*\.?",
    r"\s+for\s+better\s+[^.]*\.?",
    r"\s+for\s+enhanced\s+[^.]*\.?",
    r"\s+for\s+consistent\s+[^.]*\.?",
    r"\s+to\s+ensure\s+[^.]*\.?",
    r"\s+to\s+improve\s+[^.]*\.?",
    r"\s+to\s+enhance\s+[^.]*\.?",
    r"\s+addressing\s+[^.]*\.?",
    r"\s+enhancing\s+[^.]*\.?",
]


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


def transform_to_changelog_line(desc):
    """
    Transform a raw commit description into a concise, user-friendly changelog line.
    """
    if not desc or not desc.strip():
        return None

    s = desc.strip()

    # Skip init/empty
    if re.match(r"^init\.?$", s, re.I):
        return None

    # Skip version bump / chore commits that add no user value
    if re.match(r"^(chore|bump):\s+", s, re.I) and "version" in s.lower():
        return None

    # Dependency bumps: "Bump X from A to B" -> "Update X to B" or group later
    bump_match = re.match(r"^bump\s+([\w@/-]+)\s+from\s+[\w.+-]+\s+to\s+([\w.+-]+)", s, re.I)
    if bump_match:
        pkg, ver = bump_match.groups()
        return ("_bump", f"Update {pkg} to {ver}")

    # Remove verbose filler phrases first (before shortening)
    for phrase in VERBOSE_PHRASES:
        s = re.sub(phrase, "", s, flags=re.IGNORECASE)

    # Take first sentence only
    s = re.split(r"[.!?]\s+", s)[0].strip()
    if not s:
        return None

    # "Add X. This template includes Y" -> "Add X"
    s = re.sub(r"\.\s+This\s+\w+\s+(includes?|provides?|adds?|ensures?)\s+.*$", "", s, flags=re.I)

    # Simplify common patterns
    if re.match(r"^add\s+", s, re.I):
        s = re.sub(r"^add\s+", "", s, flags=re.I)
        s = re.sub(r"\s+to\s+.*$", "", s, flags=re.I)
        s = re.sub(r"\s+for\s+.*$", "", s, flags=re.I)
        s = "Add " + s
    elif re.match(r"^update\s+", s, re.I):
        s = re.sub(r"^update\s+", "", s, flags=re.I)
        s = re.sub(r"^(\S+\.\w+)\s+to\s+", r"\1: ", s, flags=re.I)
        s = re.sub(r"^(\S+\.\w+)\s+with\s+", r"\1: ", s, flags=re.I)
        s = "Update " + s
    elif re.match(r"^enhance\s+", s, re.I):
        s = re.sub(r"^enhance\s+", "", s, flags=re.I)
        s = "Improve " + s

    # Truncate at natural break if too long
    if len(s) > MAX_LINE_LENGTH:
        cut = s[:MAX_LINE_LENGTH].rfind(" ")
        s = s[:cut] + "..." if cut > 40 else s[:MAX_LINE_LENGTH - 3] + "..."

    # Capitalize
    s = s[0].upper() + s[1:] if len(s) > 1 else s.upper()
    return s


def merge_similar(items):
    """
    Merge similar items (e.g. dependency bumps) into single concise entries.
    """
    bumps = []
    rest = []
    for item in items:
        if isinstance(item, tuple) and item[0] == "_bump":
            bumps.append(item[1])
        elif item and isinstance(item, str):
            rest.append(item)

    result = []
    if bumps:
        if len(bumps) <= 3:
            result.extend(bumps)
        else:
            # Extract package names for readability: "Update X to Y" -> X
            pkgs = []
            for b in bumps:
                m = re.search(r"Update\s+([\w@/-]+)\s+to\s+", b, re.I)
                pkgs.append(m.group(1) if m else "deps")
            result.append(f"Update dependencies ({', '.join(pkgs[:5])}{'…' if len(pkgs) > 5 else ''})")
    result.extend(rest)
    return result


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

    # Categorize and transform commits into intelligent changelog lines
    categories = defaultdict(list)
    seen = set()
    for msg in commits:
        cat, desc = categorize_commit(msg)
        transformed = transform_to_changelog_line(desc)
        if transformed is None:
            continue
        # Deduplicate by normalized form (lowercase, no extra spaces)
        key = (transformed.lower() if isinstance(transformed, str) else transformed[1].lower()).replace(" ", "")
        if key in seen:
            continue
        seen.add(key)
        categories[cat].append(transformed)

    # Merge similar items (e.g. dependency bumps) per category
    for cat in categories:
        categories[cat] = merge_similar(categories[cat])

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
                if isinstance(item, tuple):
                    item = item[1]
                # Capitalize first letter
                item = item[0].upper() + item[1:] if item and len(item) > 1 else (item.upper() if item else item)
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
