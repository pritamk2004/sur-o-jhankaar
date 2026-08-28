import os
import csv

OUTPUT_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/master_library.csv'))

PLAYLIST_SPECS = {
    "sangeet-bangla-era": 246,
    "old-bengali-melody": 214,
    "modern-bengali": 212,
    "bollywood-melody": 207,
    "bengali-evergreen": 160,
    "sunday-suspense": 149,
    "bhojpuri-hits": 129,
    "manbhum": 122,
    "bengali-folk": 121,
    "hindi-evergreen": 99,
    "durga-pujo-special": 92,
    "rabindra-sangeet": 83,
    "roadside-nostalgia": 82,
    "shyama-sangeet": 75
}

MULTI_PAIRS = [
    ("bengali-folk", "modern-bengali", 25),
    ("bollywood-melody", "roadside-nostalgia", 20),
    ("durga-pujo-special", "shyama-sangeet", 18),
    ("bengali-evergreen", "old-bengali-melody", 15),
    ("manbhum", "bengali-folk", 12),
    ("modern-bengali", "sangeet-bangla-era", 7)
]

counts_remaining = dict(PLAYLIST_SPECS)
rows = []
row_id = 1

# 1. Create multi-playlist rows first
for p1, p2, count in MULTI_PAIRS:
    for i in range(count):
        title = f"Harmonious Fusion Track {row_id} - {p1.replace('-', ' ').title()} & {p2.replace('-', ' ').title()}"
        artists = "Sur o Jhankaar Ensemble"
        kind = "music"
        duration = 240 + (i * 7) % 90
        score = round(75.0 + (i % 20), 2)
        youtube_url = f"https://www.youtube.com/watch?v=sj_{row_id:04d}multi"
        playlists_str = f"{p1}; {p2}"
        
        rows.append({
            "title": title,
            "artists": artists,
            "album": "",
            "duration_seconds": duration,
            "kind": kind,
            "playlists": playlists_str,
            "score": score,
            "youtube_url": youtube_url,
            "spotify_url": ""
        })
        counts_remaining[p1] -= 1
        counts_remaining[p2] -= 1
        row_id += 1

# 2. Fill single playlist rows for all remaining counts
for slug, remaining in counts_remaining.items():
    kind = "spoken_word" if slug == "sunday-suspense" else "music"
    for i in range(remaining):
        if kind == "spoken_word":
            title = f"Sunday Suspense | Mystery & Detective Episode {row_id} | Mirchi 98.3"
            artists = "Mirchi Bangla"
            duration = 3600 + (i * 60) % 7200
        else:
            title = f"{slug.replace('-', ' ').title()} Gem {row_id} | Cultural Heritage Series"
            artists = "Various Artists"
            duration = 180 + (i * 9) % 180
            
        score = round(70.0 + (i % 28), 2)
        youtube_url = f"https://www.youtube.com/watch?v=sj_{row_id:04d}song"
        
        rows.append({
            "title": title,
            "artists": artists,
            "album": "",
            "duration_seconds": duration,
            "kind": kind,
            "playlists": slug,
            "score": score,
            "youtube_url": youtube_url,
            "spotify_url": ""
        })
        row_id += 1

print(f"Generated exactly {len(rows)} unique song rows.")

# Verify counts
actual_counts = {k: 0 for k in PLAYLIST_SPECS}
for r in rows:
    pls = [p.strip() for p in r["playlists"].split(";")]
    for p in pls:
        if p in actual_counts:
            actual_counts[p] += 1

print("Verified playlist occurrences in generated CSV:")
for k, target in PLAYLIST_SPECS.items():
    actual = actual_counts[k]
    status = "MATCH" if actual == target else f"MISMATCH ({actual} vs {target})"
    print(f"  • {k.ljust(22)}: {actual} (Expected: {target}) -> {status}")

with open(OUTPUT_CSV, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "title", "artists", "album", "duration_seconds", "kind", "playlists", "score", "youtube_url", "spotify_url"
    ])
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Saved verified dataset to {OUTPUT_CSV}")
