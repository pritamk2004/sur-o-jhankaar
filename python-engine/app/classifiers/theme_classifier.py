from typing import List

PLAYLIST_THEME_MAP = {
    "bollywood-melody": "cinematic_gold_maroon",
    "hindi-evergreen": "cinematic_gold_maroon",
    "roadside-nostalgia": "dusty_sepia_vhs",
    "bhojpuri-hits": "vibrant_folk_festival",
    "bengali-folk": "earthy_terracotta_river",
    "manbhum": "earthy_terracotta_river",
    "modern-bengali": "neon_teal_purple_city",
    "bengali-evergreen": "sepia_ivory_gramophone",
    "old-bengali-melody": "sepia_ivory_gramophone",
    "sangeet-bangla-era": "deep_indigo_radio",
    "rabindra-sangeet": "cream_green_tagore",
    "shyama-sangeet": "deep_red_gold_temple",
    "durga-pujo-special": "deep_red_gold_temple",
    "sunday-suspense": "near_black_story_spotlight"
}

def classify_mood_theme(playlists: List[str], title: str = "") -> str:
    for p in playlists:
        slug = p.strip().lower()
        if slug in PLAYLIST_THEME_MAP:
            return PLAYLIST_THEME_MAP[slug]
            
    t = title.lower()
    if any(w in t for w in ["suspense", "story", "feluda", "byomkesh"]):
        return "near_black_story_spotlight"
    if any(w in t for w in ["durga", "pujo", "puja", "shyama", "kali"]):
        return "deep_red_gold_temple"
    if any(w in t for w in ["tagore", "rabindra"]):
        return "cream_green_tagore"
    if any(w in t for w in ["folk", "jhumur", "purulia", "baul"]):
        return "earthy_terracotta_river"
    if any(w in t for w in ["bhojpuri"]):
        return "vibrant_folk_festival"
        
    return "cinematic_gold_maroon"
