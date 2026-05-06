import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request
import json
from urllib.parse import quote

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai"
map_name = quote("现状小学", safe='')

print("Testing endpoints for SuperMap iServer REST service...")

# Test all possible endpoints
urls = [
    ("REST map info", f"{base}/rest/maps/{map_name}.json"),
    ("REST layers", f"{base}/rest/maps/{map_name}/layers.json"),
    ("WMS service", f"{base}/wms?SERVICE=WMS&REQUEST=GetCapabilities"),
    ("WMTS tiles", f"{base}/rest/maps/{map_name}/tile/0/0/0.png"),
    ("ArcGIS REST", f"{base}/rest/services/现状小学/MapServer"),
    ("ArcGIS export", f"{base}/rest/services/现状小学/MapServer/export?f=image&bbox=114.08,36.36,115.01,36.92&bboxSR=4490&size=300,200&format=png"),
]

for name, url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        r = urllib.request.urlopen(req, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"\nOK [{ct}] ({size}bytes): {name}")
        if 'json' in ct:
            try:
                data = json.loads(d)
                print(f"  Keys: {list(data.keys())[:20]}")
                if 'prjCoordSys' in data:
                    p = data['prjCoordSys']
                    print(f"  EPSG: {p.get('epsgCode')}")
                if 'bounds' in data:
                    b = data['bounds']
                    print(f"  Bounds: ({b.get('left')},{b.get('bottom')}) to ({b.get('right')},{b.get('top')})")
                if 'layers' in data:
                    for lyr in data['layers']:
                        print(f"  Layer: {lyr.get('name')}")
            except:
                print(f"  JSON error: {d[:100]}")
        elif 'image' in ct.lower() or 'png' in ct.lower():
            print(f"  ✅ IMAGE FOUND!")
        else:
            print(f"  Raw: {d[:100]}")
    except Exception as e:
        print(f"\nFAIL {name}: {str(e)[:80]}")
