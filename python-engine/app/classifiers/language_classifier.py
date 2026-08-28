import re
from typing import List

PLAYLIST_LANGUAGE_MAP = {
    "hindi-evergreen": ["Hindi"],
    "bollywood-melody": ["Hindi"],
    "roadside-nostalgia": ["Hindi"],
    "bhojpuri-hits": ["Bhojpuri"],
    "modern-bengali": ["Bangla"],
    "bengali-folk": ["Bangla"],
    "bengali-evergreen": ["Bangla"],
    "old-bengali-melody": ["Bangla"],
    "sangeet-bangla-era": ["Bangla"],
    "manbhum": ["Bangla"],
    "rabindra-sangeet": ["Bangla"],
    "shyama-sangeet": ["Bangla"],
    "durga-pujo-special": ["Bangla"],
    "sunday-suspense": ["Bangla"]
}

def classify_languages(playlists: List[str], title: str = "", artists: str = "") -> List[str]:
    languages = set()
    for p in playlists:
        slug = p.strip().lower()
        if slug in PLAYLIST_LANGUAGE_MAP:
            languages.update(PLAYLIST_LANGUAGE_MAP[slug])
            
    if languages:
        return list(languages)
        
    combined = f"{title} {artists}".lower()
    if re.search(r"bhojpuri|pawan\s*singh|khesari|shilpi\s*raj|neelkamal", combined):
        return ["Bhojpuri"]
    if re.search(r"bengali|bangla|rabindra|shyama|purulia|anupam\s*roy|arijit.*bangla", combined) or bool(re.search(r"[\u0980-\u09FF]", combined)):
        return ["Bangla"]
    if re.search(r"hindi|bollywood|kishore\s*kumar|lata|rafi|mukesh", combined) or bool(re.search(r"[\u0900-\u097F]", combined)):
        return ["Hindi"]
        
    return ["Hindi"]
