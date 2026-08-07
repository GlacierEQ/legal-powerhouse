import os
import json
import datetime
from pathlib import Path

HOME_DIR = "/data/data/com.termux/files/home"
OUTPUT_FILE = os.path.join(HOME_DIR, "legal-powerhouse", "brain", "monolith_estate.json")

import subprocess

def find_git_repos(root_dir, max_depth=3):
    repos = []
    # Use system find to get exactly what we saw earlier
    try:
        output = subprocess.check_output(
            ['find', root_dir, '-maxdepth', str(max_depth), '-type', 'd', '-name', '.git'],
            text=True
        )
        for line in output.splitlines():
            if line.strip():
                # Remove the trailing /.git to get the repo root
                repo_path = os.path.dirname(line.strip())
                repos.append(repo_path)
    except subprocess.CalledProcessError as e:
        print("Error finding repos:", e)
    return repos

def classify_repo(repo_path):
    repo_name = os.path.basename(repo_path).lower()
    path_lower = repo_path.lower()
    
    if any(k in repo_name for k in ['case', 'cybertack', '1fdv', 'justice', 'dockets', 'evidence', 'cataclysm']):
        return "legal_data"
    elif any(k in repo_name for k in ['legal', 'fiat', 'tower', 'powerhouse', 'fileboss', 'fortress']):
        return "legal_tech"
    elif any(k in repo_name for k in ['aspen', 'aeon', 'brain', 'supermemory', 'mem0', 'mastermind', 'chatgpt']):
        return "context_memory"
    elif any(k in repo_name for k in ['apex', 'mcp', 'agent', 'comet', 'omni']):
        return "apex_infrastructure"
    elif any(k in repo_name for k in ['ai', 'grok', 'deepmind', 'claude', 'openai', 'kimi', 'model']):
        return "ai_automation"
    elif "workspace" in path_lower:
        return "active_workspaces"
    else:
        return "ancillary_systems"

def build_monolith():
    print("Scanning estate for APEX Monolith mapping...")
    repos = find_git_repos(HOME_DIR, max_depth=3)
    
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
        category = classify_repo(r)
        catalog[category].append({
            "name": os.path.basename(r),
            "absolute_path": r,
            "relative_path": os.path.relpath(r, HOME_DIR)
        })
        
    monolith = {
        "metadata": {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "total_repositories": len(repos),
            "case_id": "1FDV-23-0001009",
            "authority": "APEX_MONOLITH"
        },
        "layers": {
            "legal_data": {
                "count": len(catalog["legal_data"]),
                "nodes": catalog["legal_data"]
            },
            "legal_tech": {
                "count": len(catalog["legal_tech"]),
                "nodes": catalog["legal_tech"]
            },
            "context_memory": {
                "count": len(catalog["context_memory"]),
                "nodes": catalog["context_memory"]
            },
            "apex_infrastructure": {
                "count": len(catalog["apex_infrastructure"]),
                "nodes": catalog["apex_infrastructure"]
            },
            "ai_automation": {
                "count": len(catalog["ai_automation"]),
                "nodes": catalog["ai_automation"]
            },
            "active_workspaces": {
                "count": len(catalog["active_workspaces"]),
                "nodes": catalog["active_workspaces"]
            },
            "ancillary_systems": {
                "count": len(catalog["ancillary_systems"]),
                "nodes": catalog["ancillary_systems"]
            }
        }
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(monolith, f, indent=2)
        
    print(f"Monolith mapping complete. {len(repos)} repositories categorized.")
    print(f"Output saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    build_monolith()
