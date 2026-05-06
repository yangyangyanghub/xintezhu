import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

import urllib.request
import json

# Get map info
r = urllib.request.urlopen(f"{base}/rest/maps/dom2025xn50cm.json", timeout=10)
data = json.loads(r.read())

# Get all keys
print("All keys:", data.keys())

# Get layer info
if 'layers' not in data:
    # Try to get layers separately
    layer_url = f"{base}/rest/maps/dom2025xn50cm/layers.json"
    try:
        r2 = urllib.request.urlopen(layer_url, timeout=10)
        layers = json.loads(r2.read())
        print(f"\nLayers response: {list(layers.keys()) if isinstance(layers, dict) else type(layers)}")
        print(json.dumps(layers, indent=2, ensure_ascii=False)[:1000])
    except Exception as e:
        print(f"\nLayers endpoint: FAIL - {e}")

# Try different tile URL formats
tile_formats = [
    # Standard SuperMap REST tile
    f"{base}/rest/maps/dom2025xn50cm/tiles/1/0/0.png",
    f"{base}/rest/maps/dom2025xn50cm/tile/1/0/0.png",
    f"{base}/rest/maps/dom2025xn50cm/tile/1/0/0",
    # Different zoom level
    f"{base}/rest/maps/dom2025xn50cm/tile/0/0/0.png",
    # With params
    f"{base}/rest/maps/dom2025xn50cm/tile/z/1/x/0/y/0.png",
    # Maybe tileImage or exportMap
    f"{base}/rest/maps/dom2025xn50cm/exportMap.png?width=256&height=256&center_x=114.48&center_y=36.53&scale=100000",
    # View image
    f"{base}/rest/maps/dom2025xn50cm/view.png?width=256&height=256",
    # Map view
    f"{base}/rest/maps/dom2025xn50cm/view?width=256&height=256",
    # SuperMap tile format
    f"{base}/rest/ogc/wmts/1.0.0/dom2025xn50cm/default/WGS84_WebMercator/0/0/0.png",
    # Tile service
    f"{base}/rest/maps/dom2025xn50cm/tileImage/0/0/0.png",
    f"{base}/rest/maps/dom2025xn50cm/tileImage?x=0&y=0&z=0",
    # Export
    f"{base}/rest/maps/dom2025xn50cm/export.png?width=200&height=200&bounds=113.45,36.04,115.50,37.02",
]

print("\n--- Tile URL tests ---")
for url in tile_formats:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        r = urllib.request.urlopen(req, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"OK [{ct}] ({size}bytes): {url.split('/')[-1]}")
        if 'png' in ct.lower() or 'image' in ct.lower():
            print(f"  ✅ IMAGE FOUND!")
            break
    except Exception as e:
        code = str(e)[:60]
        print(f"FAIL: {code}")
