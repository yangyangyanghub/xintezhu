import sys
import urllib.request
import json
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

print("Testing SuperMap iServer tile and export endpoints...")

urls_to_test = [
    # REST tile export
    f"{base}/rest/maps/dom2025xn50cm.png?width=256&height=256&format=png&centerX=114.48&centerY=36.53&scale=500000",
    # REST map view
    f"{base}/rest/maps/dom2025xn50cm/view.png?width=256&height=256&bounds=113.45,36.04,115.50,37.02",
    # ArcGIS-like tile endpoint
    f"{base}/rest/maps/dom2025xn50cm/tile/1/0/0.png",
    # With different format
    f"{base}/rest/maps/dom2025xn50cm/view?width=256&height=256&format=png&bounds=113.45%2C36.04%2C115.50%2C37.02",
    # Try arcgis rest (in case it's dual)
    f"{base}/rest/services/dom2025xn50cm/MapServer?f=pjson",
    f"{base}/rest/services/dom2025xn50cm/MapServer/export?bbox=113.45,36.04,115.50,37.02&bboxSR=4490&size=256,256&format=png&f=image",
]

for u in urls_to_test:
    try:
        r = urllib.request.urlopen(u, timeout=15)
        ct = r.headers.get('Content-Type', 'unknown')
        data = r.read()
        size = len(data)
        preview = data[:50] if size < 200 else data[:20]
        print(f"OK {ct} ({size} bytes)")
        if ct and 'json' in ct:
            try:
                parsed = json.loads(data.decode('utf-8'))
                keys = list(parsed.keys())[:10]
                print(f"  -> Keys: {keys}")
            except:
                print(f"  -> Not valid JSON: {preview}")
        elif ct and 'png' in ct:
            print(f"  -> PNG image ({size} bytes)")
    except Exception as e:
        print(f"FAIL: {e}")
