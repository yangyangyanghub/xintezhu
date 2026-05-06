import sys
sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

from qgis.core import (
    QgsApplication,
    QgsProject,
    QgsRasterLayer,
)
import os

QgsApplication([], False)
QgsApplication.initQgis()

project_path = r'E:\code\my-ai-workspace\qgis\test20260413.qgz'
proj = QgsProject.instance()
proj.read(project_path)

for layer in proj.mapLayers().values():
    proj.removeMapLayer(layer.id())

print("Testing SuperMap iServer tile/image endpoints with proper paths...")

# SuperMap iServer REST service
base = "http://61.240.150.90:8088/mixserver/services/map-JiaoYuShuJuPingTai/rest"
layers = ["现状小学", "现状初中", "现状高中"]

for lyr in layers:
    from urllib.parse import quote
    layer_enc = quote(lyr, safe='')
    
    tile_urls = [
        # Standard SuperMap tile cache path
        f"{base}/maps/{layer_enc}/tile/0/0/0.png",
        f"{base}/maps/{layer_enc}/tile/0/0/0",
        f"{base}/maps/{layer_enc}/tile/1/0/0.png",
        f"{base}/maps/{layer_enc}/tile/1/0/0",
        # Tile with z/x/y pattern (some SuperMap versions use this)
        f"{base}/maps/{layer_enc}/tile/0/0/0.png?format=PNG",
    ]
    
    for url in tile_urls:
        import urllib.request
        try:
            r = urllib.request.urlopen(url, timeout=5)
            ct = r.headers.get('Content-Type', 'unknown')
            d = r.read()
            print(f"OK [{ct}] ({len(d)}b): {url.split('/')[-10:]}")
            if 'png' in ct.lower() or 'image' in ct.lower():
                # Found tile! Test with QGIS
                print(f"  ✅ IMAGE!")
        except Exception as e:
            print(f"FAIL: {str(e)[:60]}")

QgsApplication.exitQgis()
print("\nDone!")
