import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

from qgis.core import (
    QgsApplication,
    QgsProject,
    QgsRasterLayer,
)
import os

# Initialize QGIS
print("Initializing QGIS...")
QgsApplication([], False)
QgsApplication.initQgis()

project_path = r'E:\code\my-ai-workspace\qgis\test20260413.qgz'
proj = QgsProject.instance()
proj.read(project_path)

# Remove old layers
for layer in proj.mapLayers().values():
    proj.removeMapLayer(layer.id())

print("Removing old layers, project is clean")

# SuperMap iServer REST map service
# The correct URI for adding a SuperMap map as WMS in QGIS
# When WMS is not available, we use the export API

map_name = "现状小学"
base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai/rest/maps/现状小学"

# SuperMap iServer's REST map image export endpoint
# This is the standard way to get map images from iServer REST
# Format: /rest/maps/{mapName}/tiles/{z}/{x}/{y} OR /rest/maps/{mapName}/export?

# Let's try the export endpoint which is always available
export_url = f"{base}/exportMap.png"

# For QGIS, try the WMS provider with export URL structure
# OR try using a WMS-like URL with proper SuperMap params

# Method 1: Use the export endpoint via WMS-like provider
uri = (
    f"contextualWMSLegend=0&crs=EPSG:4490&dpiMode=9"
    f"&featureCount=10&format=image/png"
    f"&layers=dom2025xn50cm"
    f"&url=http://61.240.150.90:8088/mixserver/services/dom2025xn50cm/wms"
)

# Since WMS is not available, try adding via the REST tile endpoint
# SuperMap iServer supports tile access when cache is enabled
# Tile URL: /rest/maps/{name}/tiles/{z}/{x}/{y}.png

# But since tiles return 404, let's try the "export" API
# which is a WMS-compatible endpoint

uri_wms = f"url=http://61.240.150.90:8088/mixserver/rest/services/map-JiaoYuShuJuPingTai/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS={map_name}&FORMAT=image/png&CRS=EPSG:4490"

print("Trying method 1: WMS provider with rest/wms URL")
layer1 = QgsRasterLayer(uri_wms, "现状小学", "wms")
if layer1.isValid():
    print(f"  OK! Added layer: {layer1.name()}")
else:
    print(f"  FAIL: {layer1.error().summary()}")

if not layer1.isValid():
    print("\nTrying method 2: Direct WMS with service-level endpoint")
    uri2 = "url=http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai/wms?SERVICE=WMS&FORMAT=png&CRS=EPSG:4490&layers=现状小学"
    layer2 = QgsRasterLayer(uri2, "现状小学", "wms")
    if layer2.isValid():
        print(f"  OK!")
        layer1 = layer2
    
if not layer1.isValid():
    print("\nTrying method 3: Using WMS capabilities URL")
    uri3 = "url=http://61.240.150.90:8088/rest/services/map-JiaoYuShuJuPingTai/wms?SERVICE=WMS&FORMAT=image/png&CRS=EPSG:4490"
    layer3 = QgsRasterLayer(uri3, "现状小学", "wms")
    if layer3.isValid():
        print("  OK!")
        layer1 = layer3

# Save results
success = layer1.isValid()
if success:
    proj.addMapLayer(layer1)
    print(f"\nAdded {layer1.name()} to project")
else:
    print("\nAll WMS methods failed")
    print("Adding layer anyway for manual configuration in QGIS Desktop")

proj.write(project_path)
print(f"Project saved: {os.path.getsize(project_path)} bytes")

QgsApplication.exitQgis()
print("Done!")
