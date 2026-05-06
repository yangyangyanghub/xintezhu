import sys
import urllib.request
import json
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

print("Deep testing SuperMap iServer endpoints...")

urls_to_test = [
    # Root REST
    f"{base}/rest",
    f"{base}/rest.json",
    # WMS - different paths
    f"{base}/wms",
    f"{base}/wms?request=GetCapabilities&service=wms",
    # Try SuperMap's own WMS path
    f"{base}/rest/ogc/wms",
    f"{base}/rest/ogc/wms?request=GetCapabilities&service=wms",
    # Tile endpoints
    f"{base}/rest/maps/dom2025xn50cm/tiles/0/0/0.png",
    f"{base}/rest/maps/dom2025xn50cm/tiles/1/0/0.png",
    # SuperMap iServer standard tile
    f"{base}/rest/maps/dom2025xn50cm/tile/0/0/0.png",
    f"{base}/rest/maps/dom2025xn50cm/tile/0/0/0",
    # Google tile style
    f"{base}/rest/ogc/wmts/1.0.0/dom2025xn50cm/default/WGS84_WebMercator/1/1/0.png",
]

for u in urls_to_test:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        data = r.read()
        size = len(data)
        print(f"OK {ct} ({size} bytes)")
        if ct and 'json' in ct:
            try:
                parsed = json.loads(data.decode('utf-8'))
                keys = list(parsed.keys())[:10]
                print(f"  -> Keys: {keys}")
            except:
                print(f"  -> Raw: {data[:100]}")
        elif ct and 'xml' in ct:
            line = data.decode('utf-8', errors='replace').split('\n')[0]
            print(f"  -> {line[:100]}")
        elif ct and 'png' in ct:
            print(f"  -> ✅ PNG image!")
    except Exception as e:
        code = str(e)
        print(f"FAIL: {code[:80]}")
