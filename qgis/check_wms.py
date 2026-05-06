import sys
import urllib.request
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

url = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/wms?service=WMS&request=GetCapabilities"
print(f"Fetching: {url}")
req = urllib.request.Request(url, headers={'User-Agent': 'QGIS/3.40'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    xml = resp.read().decode('utf-8', errors='replace')
    import re
    layers = re.findall(r'<Name>([^<]+)</Name>', xml)
    titles = re.findall(r'<Title>([^<]+)</Title>', xml)
    crs = re.findall(r'<CRS>([^<]+)</CRS>', xml) + re.findall(r'<SRS>([^<]+)</SRS>', xml)
    formats = re.findall(r'<MimeType>([^<]+)</MimeType>', xml)
    print(f"Layers: {layers}")
    print(f"Titles: {titles}")
    print(f"CRS: {list(set(crs))}")
    print(f"Formats: {list(set(formats))}")
except Exception as e:
    print(f"WMS GetCapabilities failed: {e}")

# Check REST service
rest_url = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm.json"
print(f"\nFetching REST: {rest_url}")
req2 = urllib.request.Request(rest_url, headers={'User-Agent': 'QGIS/3.40'})
try:
    resp2 = urllib.request.urlopen(req2, timeout=10)
    import json
    data = json.loads(resp2.read().decode('utf-8', errors='replace'))
    print(f"REST keys: {list(data.keys())}")
    if 'extent' in data:
        print(f"Extent: {data['extent']}")
    if 'bounds' in data:
        print(f"Bounds: {data['bounds']}")
    if 'prjCoordSys' in data:
        print(f"Projection: {data['prjCoordSys']}")
    if 'dynamicPrjCoordSyses' in data:
        print(f"Dynamic Projections: {data['dynamicPrjCoordSyses']}")
except Exception as e:
    print(f"REST request failed: {e}")

# Try WCS endpoint
wcs_url = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/wcs?service=WCS&request=GetCapabilities"
print(f"\nFetching WCS: {wcs_url}")
req3 = urllib.request.Request(wcs_url, headers={'User-Agent': 'QGIS/3.40'})
try:
    resp3 = urllib.request.urlopen(req3, timeout=10)
    wcs_xml = resp3.read().decode('utf-8', errors='replace')[:500]
    print(f"WCS response: {wcs_xml[:300]}")
except Exception as e:
    print(f"WCS GetCapabilities failed: {e}")

# Try getting map image to verify service works
print(f"\nFetching map image (testing URL)...")
test_urls = [
    "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm.png?width=10&height=10",
    "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=&FORMAT=image/png&WIDTH=100&HEIGHT=100&BBOX=116.39,39.9,116.5,39.95&CRS=EPSG:4326",
    "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm/wmts",
]
for u in test_urls:
    try:
        r = urllib.request.urlopen(u, timeout=10)
        ct = r.headers.get('Content-Type', 'unknown')
        size = len(r.read())
        print(f"  OK: {ct} ({size} bytes)")
    except Exception as e:
        print(f"  FAIL: {e}")
