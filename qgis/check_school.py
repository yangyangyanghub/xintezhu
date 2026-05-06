import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request
import json
from urllib.parse import quote

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai"
map_name_raw = "现状小学"
map_name = quote(map_name_raw, safe='')

print(f"Trying URL-encoded map name: {map_name}")

# URLs to test
urls = [
    (f"Map JSON", f"{base}/rest/maps/{map_name_raw}.json"),
    (f"Map JSON (encoded)", f"{base}/rest/maps/{map_name}.json"),
    (f"Layers", f"{base}/rest/maps/{map_name_raw}/layers.json"),
    (f"WMS GetCapabilities", f"{base}/wms?SERVICE=WMS&REQUEST=GetCapabilities"),
    (f"WMTS GetCapabilities", f"{base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities"),
    (f"OGC WMS", f"{base}/rest/ogc/wms{map_name}/service?SERVICE=WMS&REQUEST=GetCapabilities"),
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
            data = json.loads(d)
            if isinstance(data, dict):
                print(f"  Keys: {list(data.keys())[:15]}")
                if 'prjCoordSys' in data:
                    epsg = data['prjCoordSys'].get('epsgCode', 'N/A')
                    name_val = data.get('name', '')
                    print(f"  EPSG: {epsg}, Name: {name_val}")
                    if 'bounds' in data:
                        b = data['bounds']
                        print(f"  Bounds: ({b.get('left')},{b.get('bottom')}) to ({b.get('right')},{b.get('top')})")
                if 'layers' in data:
                    for lyr in data['layers']:
                        print(f"  Layer: {lyr.get('name')}")
            elif isinstance(data, list):
                for item in data[:5]:
                    print(f"  Item: {item.get('name', str(item)[:80])}")
        elif 'png' in ct.lower() or 'image' in ct.lower():
            print(f"  ✅ IMAGE!")
        elif 'xml' in ct.lower():
            print(f"  XML: {d[:300].decode('utf-8', errors='replace')[:200]}")
    except Exception as e:
        print(f"\nFAIL {name}: {str(e)[:80]}")
