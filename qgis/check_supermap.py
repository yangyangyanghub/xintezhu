import sys
import json
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

# Check the WMS layer list from SuperMap
import urllib.request

# SuperMap WMS requires specific format
# Check if /rest/maps/{mapName}/tile/{z}/{x}/{y} works
# Or if there's a WMS endpoint we're missing

# Try the iserver OGC endpoint
ogc_paths = [
    "rest/services",
    "rest/service",
    "rest/service/ogc/wms",
    "rest/ogc/wms",
    "rest/ogc/wmts",
    "wms",
    "wmts",
    "wcs",
]

for path in ogc_paths:
    url = f"{base}/{path}"
    try:
        r = urllib.request.urlopen(f"{url}.json", timeout=5)
        data = json.loads(r.read())
        print(f"OK {path}: {list(data.keys())[:5]}")
    except:
        pass
    try:
        r = urllib.request.urlopen(url, timeout=5)
        ct = r.headers.get('Content-Type', '')
        data = r.read()
        size = len(data)
        print(f"OK {path}: {ct} ({size} bytes)")
        if 'xml' in ct:
            print(data.decode('utf-8', errors='replace')[:200])
    except:
        pass

# Check if the service exposes ArcGIS MapServer (some SuperMap does)
arcgis_url = f"{base}/rest/services/dom2025xn50cm/MapServer"
for ext in [".json", ""]:
    try:
        url = f"{arcgis_url}{ext}"
        r = urllib.request.urlopen(url, timeout=5)
        data = r.read()
        ct = r.headers.get('Content-Type', '')
        print(f"ArcGIS MapServer: {ct} ({len(data)} bytes)")
    except Exception as e:
        print(f"ArcGIS MapServer{ext}: FAIL")

# Check the parent service (mixserver)
try:
    r = urllib.request.urlopen(f"{base}/rest/services.json", timeout=10)
    data = json.loads(r.read())
    print(f"\nParent services.json keys: {list(data.keys())[:10]}")
    if 'services' in data:
        print(f"  Services count: {len(data['services'])}")
        for svc in data.get('services', [])[:5]:
            print(f"  - {svc.get('name', 'unknown')}: {svc.get('type', 'unknown')}")
            print(f"    Address: {svc.get('address', 'N/A')}")
except Exception as e:
    print(f"Parent services.json: FAIL - {e}")

# Try the root services path
try:
    r = urllib.request.urlopen("http://61.240.150.90:8088/mixserver/services.json", timeout=10)
    data = json.loads(r.read())
    print(f"\nRoot services.json keys: {list(data.keys())[:10]}")
    if 'services' in data:
        for svc in data.get('services', [])[:10]:
            print(f"  - {svc.get('name', 'unknown')}: {svc.get('type', 'unknown')}")
except Exception as e:
    print(f"Root services.json: FAIL - {e}")
