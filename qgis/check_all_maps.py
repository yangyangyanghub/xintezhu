import sys
import json
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

# Check all layers from the REST service
import urllib.request

base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai/rest"

# Check all maps
try:
    r = urllib.request.urlopen(f"{base}/maps", timeout=10)
    data = json.loads(r.read())
    print("Available maps:")
    if isinstance(data, list):
        for m in data:
            print(f"  - {m.get('name')}: cache={m.get('cacheEnabled')} projType={m.get('type', 'N/A')}")
            if 'projectionStr' in m:
                print(f"    projectionStr: {m['projectionStr']}")
            if 'viewer' in m and m['viewer']:
                print(f"    viewer: {m['viewer']}")
    elif isinstance(data, dict):
        if 'maps' in data:
            for m in data['maps']:
                print(f"  - {m.get('name')}: cache={m.get('cacheEnabled')}")
        else:
            print(f"  Single map: {data.get('name')}")
            print(f"  cacheEnabled: {data.get('cacheEnabled')}")
except Exception as e:
    print(f"FAIL: {e}")

# Check for ArcGIS-like service
print("\nTrying ArcGIS-compatible endpoints:")
map_name = "map-JiaoYuShuJuPingTai"
urls = [
    f"http://61.240.150.90:8088/mixserver/services/{map_name}/MapServer",
    f"http://61.240.150.90:8088/mixserver/services/{map_name}/ImageServer",
    f"http://61.240.150.90:8088/mixserver/services/{map_name}/MapServer?f=json",
]
for u in urls:
    try:
        r = urllib.request.urlopen(u, timeout=5)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        print(f"OK [{ct}]: {u}")
        if 'json' in ct:
            print(f"  {json.loads(d).keys()}")
    except Exception as e:
        print(f"FAIL: {u.split('/')[-1]} - {str(e)[:60]}")

# Check for tile cache at different path patterns
print("\nTrying tile cache URLs:")
import urllib.request
layer = "%E7%8E%B0%E7%8A%B6%E5%B0%8F%E5%AD%A6"
tile_urls = [
    f"{base}/maps/{layer}/tiles/1/0/0.png",
    f"{base}/maps/{layer}/tile/1/0/0.png",
    f"{base}/maps/{layer}/tile/0/0/0.png",
    # SuperMap tile format: {z}/{x}/{y}
    f"{base}/tiles/{layer}/1/0/0.png",
    # Try different path ordering
    f"{base}/maps/{layer}/tiles/0/0/0.png",
]
for u in tile_urls:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        d = r.read()
        size = len(d)
        print(f"OK [{ct}] ({size}bytes): {u.split('/')[-4:]}")
        if 'image' in ct.lower() or 'png' in ct.lower():
            print("  ✅ IMAGE!")
    except Exception as e:
        print(f"FAIL: {u.split('/')[-4:]}")

# Check if we can get a tileImage from REST
print("\nTrying getTileImage:")
try:
    params = "x=1&y=1&z=0&format=png"
    url = f"{base}/maps/{layer}/getTileImage?{params}"
    r = urllib.request.urlopen(url, timeout=10)
    ct = r.headers.get('Content-Type', 'unknown')
    d = r.read()
    size = len(d)
    print(f"OK [{ct}] ({size}bytes)")
except Exception as e:
    print(f"FAIL: {str(e)[:80]}")
