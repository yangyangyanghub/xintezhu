import sys
import json
import urllib.request
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

base = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm"

# 1. Get map info
r = urllib.request.urlopen(f"{base}/rest/maps/dom2025xn50cm.json", timeout=10)
map_info = json.loads(r.read())
print(f"Map name: {map_info.get('name')}")
print(f"Projection EPSG: {map_info.get('prjCoordSys', {}).get('epsgCode')}")

# 2. List available layers within the iServer service
# Try the service root
try:
    svc_root = f"{base}/rest/services.json"
    r = urllib.request.urlopen(svc_root, timeout=10)
    print(f"\nService response type: {r.headers.get('Content-Type')}")
except:
    pass

# 3. Try SuperMap's WMS with different layer name (use the map name as layer)
# SuperMap iServer WMS: http://server:port/iserver/services/{mapName}/wms?SERVICE=WMS
# For map services: http://server:port/iserver/services/{mapName}/rest/maps/{mapName}
# The WMS equivalent would be: http://server:port/iserver/ogc/wms/{mapName}:MapName
# Or maybe the service path includes 'maps' not as layers but as map resources

# 4. Try the supermap data provider directly
print("\nTrying QgsRasterLayer with various providers...")
from qgis.core import (
    QgsApplication,
    QgsProject,
    QgsRasterLayer,
    QgsProviderRegistry,
)

QgsApplication([], False)
QgsApplication.initQgis()

project_path = r'E:\code\my-ai-workspace\qgis\test20260413.qgz'

providers = QgsProviderRegistry.instance().providerList()
print(f"\nAvailable providers: {providers}")

# Try different URI formats
# Key: SuperMap REST map URL needs WMS-like access since there's no native REST raster provider

# Format 1: Standard WMS (but WMS is 404)
# Format 2: Using SuperMap proprietary provider
# Format 3: Using GDAL with XML WMS definition

# Let's try creating a WMS XML for GDAL
# But first, check if there's a SuperMap raster provider
providers_map = {
    'supermap': 'SuperMap vector provider',
    'wms': 'Web Map Service',
    'gdal': 'Generic raster (can handle HTTP)',
}

# Method: Use QgsRasterLayer with proper SuperMap REST URI
# The correct format for iServer 10x+ might be:
# url=http://.../rest/maps/xxx&type=map&format=png

test_uris = [
    # Try with SuperMap map provider (if exists)
    ("SuperMap map provider",
     f"url=http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/maps/dom2025xn50cm&type=map&format=png&crs=EPSG:4490",
     "wms"),
    # Try with layer name matching
    ("WMS with layer=dom2025xn50cm",
     f"url=http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/ogc/wms?layers=dom2025xn50cm&format=image/png&crs=EPSG:4490",
     "wms"),
    # Try WMTS if it had tiles
    ("WMTS style",
     f"url=http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/rest/ogc/wmts&layer=dom2025xn50cm&format=image/png",
     "wms"),
]

proj = QgsProject.instance()
proj.read(project_path)
# Remove old invalid layer
for layer in proj.mapLayers().values():
    proj.removeMapLayer(layer.id())

for name, uri, provider in test_uris:
    print(f"\n--- {name} ---")
    print(f"Provider: {provider}")
    print(f"URI: {uri[:120]}...")
    
    layer = QgsRasterLayer(uri, f"Test_{name[:10]}", provider)
    if layer.isValid():
        print(f"  VALID! CRS={layer.crs().authid()}")
        proj.addMapLayer(layer)
        proj.write(project_path)
        break
    else:
        print(f"  Invalid: {layer.error().summary()[:100]}")

proj.write(project_path)
QgsApplication.exitQgis()
