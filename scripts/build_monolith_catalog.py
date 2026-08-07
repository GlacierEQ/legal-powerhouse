import os
import json
import datetime
import subprocess

HOME_DIR = "/data/data/com.termux/files/home"
OUTPUT_FILE = os.path.join(HOME_DIR, "legal-powerhouse", "brain", "monolith_estate.json")

def fetch_github_repos():
    print("Fetching entire estate from @GlacierEQ via GitHub CLI...")
    try:
        # Fetch up to 2000 repos from GlacierEQ
        output = subprocess.check_output(
            ['gh', 'repo', 'list', 'GlacierEQ', '--limit', '2000', '--json', 'name,url,description,isPrivate,updatedAt'],
            text=True
        )
        repos = json.loads(output)
        return repos
    except subprocess.CalledProcessError as e:
        print("Error fetching repos from GitHub:", e)
        return []

def classify_repo(repo_name):
    repo_name_lower = repo_name.lower()
    
    if any(k in repo_name_lower for k in ['case', 'cybertack', '1fdv', 'justice', 'dockets', 'evidence', 'cataclysm']):
        return "legal_data"
    elif any(k in repo_name_lower for k in ['legal', 'fiat', 'tower', 'powerhouse', 'fileboss', 'fortress']):
        return "legal_tech"
    elif any(k in repo_name_lower for k in ['aspen', 'aeon', 'brain', 'supermemory', 'mem0', 'mastermind', 'chatgpt']):
        return "context_memory"
    elif any(k in repo_name_lower for k in ['apex', 'mcp', 'agent', 'comet', 'omni']):
        return "apex_infrastructure"
    elif any(k in repo_name_lower for k in ['ai', 'grok', 'deepmind', 'claude', 'openai', 'kimi', 'model']):
        return "ai_automation"
    elif "workspace" in repo_name_lower:
        return "active_workspaces"
    else:
        return "ancillary_systems"

def build_monolith():
    repos = fetch_github_repos()
    if not repos:
        print("No repos found or error occurred.")
        return

    catalog = {
        "legal_data": [],
        "legal_tech": [],
        "context_memory": [],
        "apex_infrastructure": [],
        "ai_automation": [],
        "active_workspaces": [],
        "ancillary_systems": []
    }
    
    for r in repos:
        category = classify_repo(r.get('name', ''))
        catalog[category].append({
            "name": r.get('name'),
            "url": r.get('url'),
            "description": r.get('description'),
            "is_private": r.get('isPrivate'),
            "updated_at": r.get('updatedAt')
        })
        
    # Get total across all categories
    total = sum(len(items) for items in catalog.values())
    
    monolith = {
        "metadata": {
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "total_repositories": total,
            "case_id": "1FDV-23-0001009",
            "authority": "APEX_MONOLITH_GITHUB"
        },
        "layers": {
            category: {
                "count": len(items),
                "nodes": items
            }
            for category, items in catalog.items()
        }
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(monolith, f, indent=2)
        
    print(f"Monolith mapping complete. {total} repositories categorized.")
    print(f"Output saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    build_monolith()
