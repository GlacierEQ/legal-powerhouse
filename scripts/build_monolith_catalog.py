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
    
    # 1. CORE APEX INFRASTRUCTURE (The Nervous System)
    if any(k in repo_name_lower for k in ['apex', 'mcp', 'agent', 'comet', 'omni', 'runner', 'host']):
        return "apex_infrastructure"
        
    # 2. COLOSSUS & MASTER NODES (The Core Servers/Gateways)
    elif any(k in repo_name_lower for k in ['colossus', 'monolith', 'nexus', 'akos', 'echo', 'megamind', 'server', 'gateway']):
        return "colossus_core_nodes"
        
    # 3. PRO CODE & HEAVY EXECUTION (The Engine Room)
    elif any(k in repo_name_lower for k in ['pro-code', 'pro_code', 'make-it-heavy', 'mimo', 'affine']):
        return "pro_code_execution"

    # 4. LEGAL DATA (Raw Case Evidence & Indexes)
    elif any(k in repo_name_lower for k in ['case', 'cybertack', '1fdv', 'justice', 'dockets', 'evidence', 'cataclysm', 'book-of-breach']):
        return "legal_data"
        
    # 5. LEGAL TECH (The Engineering Floors)
    elif any(k in repo_name_lower for k in ['legal', 'fiat', 'tower', 'powerhouse', 'fileboss', 'fortress', 'brief', 'motion']):
        return "legal_tech"
        
    # 6. CONTEXT MEMORY (Persistence & Supermemory)
    elif any(k in repo_name_lower for k in ['aspen', 'aeon', 'brain', 'supermemory', 'mem0', 'mastermind', 'chatgpt']):
        return "context_memory"

    # 7. AI & AUTONOMY (Models & Frameworks)
    elif any(k in repo_name_lower for k in ['ai', 'grok', 'deepmind', 'claude', 'openai', 'kimi', 'model', 'autonomy', 'spacex']):
        return "ai_automation"
        
    # 8. CAREER & OPERATIONS (Personal Ops)
    elif any(k in repo_name_lower for k in ['job', 'resume', 'application', 'career']):
        return "career_operations"
        
    # 9. DATA & STORAGE TOOLS
    elif any(k in repo_name_lower for k in ['pdf', 'doc', 'storage', 'data', 'cloud']):
        return "data_and_storage"

    # 10. ACTIVE WORKSPACES
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
        "apex_infrastructure": [],
        "colossus_core_nodes": [],
        "pro_code_execution": [],
        "legal_data": [],
        "legal_tech": [],
        "context_memory": [],
        "ai_automation": [],
        "career_operations": [],
        "data_and_storage": [],
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
