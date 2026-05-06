@echo off
set QGIS_ROOT=C:\Program Files\QGIS 3.40.9
set PYTHONPATH=%QGIS_ROOT%\apps\qgis-ltr\python;%PYTHONPATH%
set PATH=%QGIS_ROOT%\apps\Python312;%QGIS_ROOT%\apps\Python312\Scripts;%PATH%

"%QGIS_ROOT%\apps\Python312\python.exe" -m cli_anything.qgis.qgis_cli %*
