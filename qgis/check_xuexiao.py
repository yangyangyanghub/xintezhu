import sys
import json
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai"
map_name = "现状小学"

print("Testing SuperMap service endpoints...")

urls_to_test = [
    # Map info
    f"{base}/rest/maps/{map_name}.json",
    # Layers
    f"{base}/rest/maps/{map_name}/layers.json",
    # WMS
    f"{base}/wms?SERVICE=WMS&REQUEST=GetCapabilities",
    # WMTS
    f"{base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
    # OGC WMS
    f"{base}/rest/ogc/wms?SERVICE=WMS&REQUEST=GetCapabilities",
    # Tile formats
    f"{base}/rest/maps/{map_name}/tile/0/0/0.png",
    f"{base}/rest/maps/{map_name}/tiles/0/0/0.png",
    f"{base}/rest/maps/{map_name}/tile/0/0/0",
    # View image
    f"{base}/rest/maps/{map_name}/view.png?width=100&height=100",
    f"{base}/rest/maps/{map_name}/exportMap.png?width=100&height=100",
    # ArcGIS compatibility
    f"{base}/arcgis/rest/services",
    f"{base}/arcgis/rest/services/现状小学/MapServer",
]

for u in urls_to_test:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"OK [{ct}] ({size}bytes): {u.split('?')[0].split('/')[-10:]}")
        if 'json' in ct:
            data = json.loads(d)
            if isinstance(data, dict):
                print(f"  Keys: {list(data.keys())[:15]}")
                if 'layers' in data:
                    print(f"  LAYERS: {json.dumps(data['layers'], ensure_ascii=False)[:500]}")
                if 'name' in data:
                    print(f"  Name: {data['name']}")
            elif isinstance(data, list):
                print(f"  Array length: {len(data)}")
        elif 'png' in ct.lower() or 'image' in ct.lower():
            print(f"  ✅ IMAGE!")
        elif 'xml' in ct.lower():
            print(f"  XML: {d[:300].decode('utf-8', errors='replace')[:200]}")
    except Exception as e:
        print(f"FAIL: {str(e)[:80]}")
