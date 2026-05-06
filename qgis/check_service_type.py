import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

import urllib.request
import json
from urllib.parse import quote

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai"
name = quote("现状小学", safe='')

print("Checking SuperMap tile service and OGC endpoints...")

# Check if this service has tile cache enabled
r = urllib.request.urlopen(f"{base}/rest/maps/{name}.json", timeout=10)
data = json.loads(r.read())
print(f"cacheEnabled: {data.get('cacheEnabled')}")
print(f"name: {data.get('name')}")
print(f"EPSG: {data['prjCoordSys'].get('epsgCode')}")
print(f"bounds: left={data['bounds'].get('left')}, bottom={data['bounds'].get('bottom')}, right={data['bounds'].get('right')}, top={data['bounds'].get('top')}")

# Try the iServer services discovery endpoint
print("\n--- Service discovery ---")
for suffix in ["services.json", "services", "rest", "rest/services", "rest/services.json", "iClient/preview/map-rest.js", "rest/maps"]:
    url = f"{base}/{suffix}" if suffix.startswith("rest") or suffix.startswith("services") or suffix.startswith("iClient") else f"{base}/rest/{suffix}"
    try:
        r = urllib.request.urlopen(url, timeout=5)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        print(f"OK [{ct}]: /{suffix} ({len(d)}bytes)")
        if 'json' in ct:
            print(f"  Keys: {list(json.loads(d).keys())[:10]}")
    except:
        print(f"FAIL: /{suffix}")

# Check the REST services root for all exposed services
print("\n--- REST services root ---")
for url in [
    f"http://61.240.150.90:8088/mixserver/services",
    f"http://61.240.150.90:8088/mixserver/services.json",
    f"http://61.240.150.90:8088/mixserver/rest",
    f"http://61.240.150.90:8088/mixserver/rest/services",
    f"http://61.240.150.90:8088/iserver/services",
]:
    try:
        r = urllib.request.urlopen(url, timeout=5)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        print(f"OK [{ct}]: {url} ({len(d)}bytes)")
    except Exception as e:
        print(f"FAIL: {url} - {str(e)[:50]}")
