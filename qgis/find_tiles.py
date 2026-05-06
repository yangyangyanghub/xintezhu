import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request
import json

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai"
# URL-encoded 现状小学
layer_name = "%E7%8E%B0%E7%8A%B6%E5%B0%8F%E5%AD%A6"

print("Finding tile/image source...")

urls = [
    # Tile endpoints
    f"{base}/rest/maps/{layer_name}/tile/0/0/0.png",
    f"{base}/rest/maps/{layer_name}/tile/0/0/0",
    f"{base}/rest/maps/{layer_name}/tiles/0/0/0.png",
    f"{base}/rest/maps/{layer_name}/tiles/0/0/0",
    # SuperMap iServer tile service format
    f"{base}/rest/maps/{layer_name}/tileImage?x=1&y=0&z=5",
    f"{base}/rest/maps/{layer_name}/tileImage?x=1&y=0&z=5&format=png",
    # Export image
    f"{base}/rest/maps/{layer_name}.png?width=256&height=256&center_x=114.54&center_y=36.64&scale=100000",
    # WMTS-like
    f"{base}/wmts/1.0.0/{layer_name}/default/default028mm/0/0/0.png",
    f"{base}/rest/ogc/wmts",
    f"{base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0",
    # Tile services directly
    f"{base}/rest/maps/{layer_name}/tiles/1/0/0.png",
    f"{base}/rest/ogc/wmts/1.0.0/{layer_name}/default/TILEMATRIX028mm/0/0/0.png",
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'http://61.240.150.90:8088/'
        })
        r = urllib.request.urlopen(req, timeout=15)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        name = url.split('/')[-1]
        print(f"OK [{ct}] ({size}bytes): .../{name}")
        if 'image' in ct.lower() or 'png' in ct.lower():
            print(f"  ✅ Found image tile source!")
            break
        elif 'json' in ct:
            try:
                print(f"  Keys: {list(json.loads(d).keys())[:10]}")
            except:
                pass
    except Exception as e:
        err = str(e)[:80]
        print(f"FAIL: {err}")
