import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request
import json

base = "http://61.240.150.90:8088/mixserver"

# Check if WMS/WMTS exist at the service root level
urls = [
    # Standard WMS at service level
    f"{base}/services/wms?SERVICE=WMS&REQUEST=GetCapabilities",
    # Service OGC
    f"{base}/rest/ogc/wms?SERVICE=WMS&REQUEST=GetCapabilities",
    # ArcGIS endpoint (SuperMap supports this)
    f"{base}/arcgis/rest/services",
    f"{base}/arcgis/rest/services/dom2025xn50cm/MapServer",
    f"{base}/arcgis/rest/services/dom2025xn50cm/MapServer?f=json",
    # Root
    f"{base}/",
    f"{base}/rest",
    # Is SuperMap iServer with different port
]

print("Testing service-level endpoints...")
for u in urls:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"OK [{ct}] ({size}bytes): {u.split('/')[-1] or u}")
        if 'png' in ct.lower() or 'image' in ct.lower():
            print("  -> ✅ IMAGE DATA!")
        elif 'xml' in ct.lower():
            print(f"  XML start: {d[:200].decode('utf-8', errors='replace')[:150]}")
        elif 'json' in ct.lower():
            try:
                parsed = json.loads(d)
                print(f"  Keys: {list(parsed.keys())[:10]}")
            except:
                print(f"  Raw: {d[:200].decode('utf-8', errors='replace')[:150]}")
    except Exception as e:
        print(f"FAIL: {str(e)[:80]}")

# Also check the specific endpoint for SuperMap's REST WMTS-like access
print("\n\nTrying /rest/maps/... tile-like access:")
tile_urls = [
    f"{base}/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm/tile/0/0/0.png",
    f"{base}/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm/tile/0/0/0",
]
for u in tile_urls:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"OK [{ct}] ({size}bytes)")
    except Exception as e:
        print(f"FAIL: {str(e)[:80]}")

# Check the cacheEnabled field from map info
map_url = f"{base}/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm.json"
r = urllib.request.urlopen(map_url, timeout=10)
data = json.loads(r.read())
print(f"\ncacheEnabled: {data.get('cacheEnabled')}")
