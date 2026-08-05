"""
COURTLISTENER CLIENT
REST API v4 Integration for Legal Research
Case 1FDV-23-0001009 - Hawaii Family Court
"""

import os
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call(["pip3", "install", "requests"])
    import requests


class CourtListenerClient:
    """Client for CourtListener REST API v4."""
    
    BASE_URL = "https://www.courtlistener.com/api/rest/v4"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("COURTLISTENER_API_KEY", "")
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": f"Token {self.api_key}"})
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated request to CourtListener API."""
        url = f"{self.BASE_URL}/{endpoint}/"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    # --- Search Endpoints ---
    
    def search_dockets(self, query: str, **params) -> Dict[str, Any]:
        """Search dockets by case name, number, or party."""
        return self._request("GET", "search", params={"q": query, "type": "r", **params})
    
    def search_opinions(self, query: str, **params) -> Dict[str, Any]:
        """Search court opinions."""
        return self._request("GET", "search", params={"q": query, "type": "o", **params})
    
    def search_recap(self, query: str, **params) -> Dict[str, Any]:
        """Search RECAP archive documents."""
        return self._request("GET", "search", params={"q": query, "type": "r", **params})
    
    # --- Docket Endpoints ---
    
    def get_docket(self, docket_id: int) -> Dict[str, Any]:
        """Get docket by ID."""
        return self._request("GET", "dockets", pk=docket_id)
    
    def list_docket_entries(self, docket_id: int, **params) -> Dict[str, Any]:
        """List entries for a specific docket."""
        return self._request("GET", "docket-entries", params={"docket": docket_id, **params})
    
    def get_docket_entry(self, entry_id: int) -> Dict[str, Any]:
        """Get specific docket entry."""
        return self._request("GET", "docket-entries", pk=entry_id)
    
    # --- Court Endpoints ---
    
    def list_courts(self, **params) -> Dict[str, Any]:
        """List all courts."""
        return self._request("GET", "courts", params=params)
    
    def get_court(self, court_id: str) -> Dict[str, Any]:
        """Get court by ID (e.g., 'haw', 'scotus')."""
        return self._request("GET", "courts", pk=court_id)
    
    # --- Opinion Endpoints ---
    
    def get_opinion(self, opinion_id: int) -> Dict[str, Any]:
        """Get opinion by ID."""
        return self._request("GET", "opinions", pk=opinion_id)
    
    def list_opinion_clusters(self, **params) -> Dict[str, Any]:
        """List opinion clusters."""
        return self._request("GET", "clusters", params=params)
    
    # --- RECAP Endpoints ---
    
    def get_recap_document(self, doc_id: int) -> Dict[str, Any]:
        """Get RECAP document by ID."""
        return self._request("GET", "recap-documents", pk=doc_id)
    
    def fetch_recap(self, **params) -> Dict[str, Any]:
        """Fetch RECAP documents."""
        return self._request("GET", "recap-query", params=params)
    
    # --- People & Judges ---
    
    def get_person(self, person_id: int) -> Dict[str, Any]:
        """Get person (judge) by ID."""
        return self._request("GET", "people", pk=person_id)
    
    def list_positions(self, **params) -> Dict[str, Any]:
        """List judicial positions."""
        return self._request("GET", "positions", params=params)
    
    # --- Alerts ---
    
    def list_docket_alerts(self, **params) -> Dict[str, Any]:
        """List docket alerts for authenticated user."""
        return self._request("GET", "docket-alerts", params=params)
    
    def create_docket_alert(self, docket_id: int) -> Dict[str, Any]:
        """Create alert for a docket."""
        return self._request("POST", "docket-alerts", json={"docket": docket_id})
    
    # --- Financial Disclosures ---
    
    def list_financial_disclosures(self, **params) -> Dict[str, Any]:
        """List financial disclosures for judges."""
        return self._request("GET", "financial-disclosures", params=params)


class LegalResearch:
    """Legal research utilities for Case 1FDV-23-0001009."""
    
    def __init__(self, client: CourtListenerClient):
        self.client = client
        self.case_id = "1FDV-23-0001009"
        self.jurisdiction = "haw"  # Hawaii
    
    def search_case(self, case_number: str = None) -> List[Dict[str, Any]]:
        """Search for case materials."""
        query = case_number or self.case_id
        results = self.client.search_dockets(query)
        return results.get("results", [])
    
    def get_hawaii_courts(self) -> List[Dict[str, Any]]:
        """Get Hawaii court information."""
        results = self.client.list_courts()
        hawaii_courts = [
            court for court in results.get("results", [])
            if court.get("id", "").startswith("haw")
        ]
        return hawaii_courts
    
    def find_family_court_dockets(self) -> List[Dict[str, Any]]:
        """Find Hawaii Family Court dockets."""
        results = self.client.search_dockets("family court hawaii")
        return results.get("results", [])
    
    def extract_evidence_clauses(self, text: str) -> Dict[str, Any]:
        """Extract key legal clauses from document text."""
        clauses = {
            "due_process": [],
            "equal_protection": [],
            "best_interest": [],
            "parental_rights": [],
            "jurisdictional": []
        }
        
        # Simple keyword extraction (would use NLP in production)
        keywords = {
            "due_process": ["due process", "14th amendment", "fundamental right"],
            "equal_protection": ["equal protection", "discrimination", "class"],
            "best_interest": ["best interest", "welfare of the child", "child's wellbeing"],
            "parental_rights": ["parental rights", "custody", "visitation", "parenting time"],
            "jurisdictional": ["jurisdiction", "subject matter", "personal jurisdiction", "venue"]
        }
        
        text_lower = text.lower()
        for category, terms in keywords.items():
            for term in terms:
                if term in text_lower:
                    # Find surrounding context
                    idx = text_lower.find(term)
                    start = max(0, idx - 100)
                    end = min(len(text), idx + len(term) + 100)
                    clauses[category].append(text[start:end])
        
        return clauses
    
    def generate_evidence_hash(self, data: Any) -> Dict[str, str]:
        """Generate forensic hash for evidence integrity."""
        serialized = json.dumps(data, sort_keys=True).encode()
        return {
            "sha256": hashlib.sha256(serialized).hexdigest(),
            "blake2b": hashlib.blake2b(serialized).hexdigest(),
            "timestamp": datetime.utcnow().isoformat()
        }


# --- Standalone Usage ---
if __name__ == "__main__":
    # Initialize client
    client = CourtListenerClient()
    
    # Initialize research
    research = LegalResearch(client)
    
    print("=" * 60)
    print("  COURTLISTENER API v4 - Legal Research Client")
    print("  Case: 1FDV-23-0001009 - Hawaii Family Court")
    print("=" * 60)
    
    # Test API connection
    try:
        courts = client.list_courts()
        print(f"\n[OK] Connected to CourtListener API")
        print(f"     Available courts: {len(courts.get('results', []))}")
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")
    
    # Search for case
    try:
        results = research.search_case()
        print(f"\n[OK] Case search returned {len(results)} results")
        for r in results[:3]:
            print(f"     - {r.get('caseName', 'N/A')}: {r.get('court', 'N/A')}")
    except Exception as e:
        print(f"\n[ERROR] Case search failed: {e}")
