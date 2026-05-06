import sys
import json
import re
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

# First get the map info
import urllib.request
base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm.json"
r = urllib.request.urlopen(base, timeout=10)
data = json.loads(r.read())

proj = data.get('prjCoordSys', {})
bounds = data.get('bounds', {})

print(f"Projection: {proj.get('name')} (EPSG:{proj.get('epsgCode')})")
print(f"Center: {data.get('center')}")
print(f"Bounds: left={bounds.get('left')}, bottom={bounds.get('bottom')}, right={bounds.get('right')}, top={bounds.get('top')}")
print(f"Coord unit: {proj.get('coordUnit')}")
print(f"Distance unit: {proj.get('distanceUnit')}")
print(f"CS type: {proj.get('type')}")
print(f"CS name: {proj.get('coordSystem', {}).get('name')}")
print(f"View Bounds: {data.get('viewBounds')}")
print(f"Scale: {data.get('minScale')} to {data.get('maxScale')}")
print(f"Overlap displayed: {data.get('overlapDisplayed')}")

# Check if the service returns actual tile images
# SuperMap REST tile URL format
tile_urls = [
    f"{base.replace('.json', '')}/tile/2/1/0.png",
    f"{base.replace('.json', '')}/tiles/2/1/0.png",
    f"{base.replace('.json', '')}/tileImage?x=1&y=0&z=2",
]
for url in tile_urls:
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        data = r.read()
        size = len(data)
        print(f"\nTile test OK: {ct} ({size} bytes)")
        if ct and 'png' in ct:
            print("  -> Valid tile image!")
            break
    except Exception as e:
        print(f"\nTile test FAIL: {str(e)[:80]}")
