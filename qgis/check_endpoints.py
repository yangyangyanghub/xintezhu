import sys
import urllib.request
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

print("Testing SuperMap iServer endpoints...")

urls_to_test = [
    # WMS standard
    f"{base}/wms?SERVICE=WMS&REQUEST=GetCapabilities",
    f"{base}/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=dom2025xn50cm&FORMAT=image/png&WIDTH=100&HEIGHT=100&BBOX=113.45,36.04,115.50,37.02&CRS=EPSG:4490",
    # REST tile test
    f"{base}/rest/maps/dom2025xn50cm.png?zoom=1&format=png",
    # REST JSON
    f"{base}/rest/maps/dom2025xn50cm.json",
    # Try arcgis-like tile
    f"{base}/rest/maps/dom2025xn50cm/tile/1/0/0",
    # WMTS
    f"{base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
    f"{base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0",
]

for u in urls_to_test:
    try:
        r = urllib.request.urlopen(u, timeout=15)
        ct = r.headers.get('Content-Type', 'unknown')
        data = r.read()
        size = len(data)
        print(f"OK {ct} ({size} bytes)")
        if ct and 'json' in ct:
            import json
            parsed = json.loads(data.decode('utf-8'))
            if 'projection' in parsed:
                print(f"  -> EPSG: {parsed['projection'].get('epsgCode')}")
            if 'layers' in parsed:
                print(f"  -> Layers: {parsed['layers']}")
        elif ct and ('xml' in ct or 'html' in ct):
            lines = data.decode('utf-8', errors='replace').split('\n')[:3]
            print(f"  -> {lines[0][:80]}...")
    except Exception as e:
        print(f"FAIL: {e}")
