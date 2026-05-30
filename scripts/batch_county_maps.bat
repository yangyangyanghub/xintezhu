@echo off
REM 邯郸市各县批量地形图生成脚本
REM 使用 QGIS CLI 处理

set QGIS_PROCESS="C:\Program Files\QGIS 3.40.9\bin\qgis_process-qgis-ltr.bat"
set DEM="slide-deck\autoclaw-course\handan12m\handan12m.tif"
set ADMIN="slide-deck\autoclaw-course\县界\邯郸县界.shp"
set OUTPUT_DIR="assets\generated\邯郸各县地形图_QGIS"

echo ========================================
echo QGIS CLI 批量生成各县地形图
echo ========================================

mkdir %OUTPUT_DIR% 2>nul

echo.
echo [1/3] 生成山体阴影...
%QGIS_PROCESS% run native:hillshade ^
  --INPUT=%DEM% ^
  --AZIMUTH=315 ^
  --V_ANGLE=45 ^
  --Z_FACTOR=1.5 ^
  --OUTPUT=%OUTPUT_DIR%\hillshade.tif

echo.
echo [2/3] DEM 配色渲染...
%QGIS_PROCESS% run gdal:colorrelief ^
  --INPUT=%DEM% ^
  --COLOR_TABLE=assets/generated/luoyang_style_colors.txt ^
  --MATCH_MODE=2 ^
  --OUTPUT=%OUTPUT_DIR%\dem_colored.tif

echo.
echo [3/3] 按县裁剪...
%QGIS_PROCESS% run gdal:cliprasterbymasklayer ^
  --INPUT=%OUTPUT_DIR%\dem_colored.tif ^
  --MASK=%ADMIN% ^
  --OUTPUT=%OUTPUT_DIR%\dem_clipped.tif

echo.
echo ========================================
echo 处理完成！
echo ========================================
