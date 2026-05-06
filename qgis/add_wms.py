import sys
import os

sys.path.insert(0, r'C:\Program Files\QGIS 3.40.9\apps\qgis-ltr\python')

from qgis.core import (
    QgsApplication,
    QgsProject,
    QgsRasterLayer,
)

print('Starting...', flush=True)

import ctypes
ctypes.windll.kernel32.SetConsoleCP(65001)
ctypes.windll.kernel32.SetConsoleOutputCP(65001)

try:
    app = QgsApplication([], False)
    print('QgsApplication created', flush=True)
    QgsApplication.initQgis()
    print('QGIS initialized', flush=True)

    proj = QgsProject.instance()
    project_path = r'E:\code\my-ai-workspace\qgis\test20260413.qgz'
    proj.read(project_path)
    print('Project loaded', flush=True)

    wms_url = "http://61.240.150.90:8088/mixserver/services/map-ugcv5-dom2025xn50cm/wms"
    uri = (
        f"url={wms_url}&layers=dom2025xn50cm&format=image/png"
        f"&crs=EPSG:4326&dpiMode=9&featureCount=10"
        f"&contextualWMSLegend=0"
    )
    
    print('Creating layer...', flush=True)
    layer = QgsRasterLayer(uri, "DOM2025_50cm", "wms")
    print(f'Layer created, valid={layer.isValid()}', flush=True)
    
    if layer.isValid():
        proj.addMapLayer(layer)
        print(f'Added: {layer.name()}', flush=True)
    else:
        print('Warning: WMS layer not valid', flush=True)
        print('  Adding anyway for user to fix in desktop QGIS', flush=True)
        proj.addMapLayer(layer)
        print('Added as invalid layer (fix in QGIS Desktop)', flush=True)

    proj.write(project_path)
    print(f'Saved project ({os.path.getsize(project_path)} bytes)', flush=True)

    QgsApplication.exitQgis()

except Exception as e:
    print(f'Error: {e}', flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

print('Done!', flush=True)
sys.stdout.flush()