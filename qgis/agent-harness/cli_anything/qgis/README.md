# cli-anything-qgis

A CLI harness for QGIS — bringing the power of professional GIS processing to your terminal.

Wraps the QGIS Python API (`qgis.core`) with a user-friendly Click CLI, supporting vector/raster operations, CRS management, format conversion, and 200+ native processing algorithms.

## Installation

### Prerequisites

- **QGIS 3.x** installed (LTS 3.34+ recommended)
- **Python 3.9+** (QGIS bundles Python, or use system Python with QGIS libs)

### Setup

```bash
cd cli_anything/qgis
pip install -e .
```

This installs the CLI in development mode, making the `qgis` command available globally.

### Environment Setup (Windows)

If QGIS is not in your PATH, set the prefix path:

```powershell
# QGIS installed via OSGeo4W
$env:QGIS_PREFIX_PATH = "C:\OSGeo4W\apps\qgis"
$env:PATH = "C:\OSGeo4W\apps\qgis\bin;$env:PATH"

# QGIS standalone installation
$env:QGIS_PREFIX_PATH = "C:\Program Files\QGIS 3.34\apps\qgis"
$env:PATH = "C:\Program Files\QGIS 3.34\apps\qgis\bin;$env:PATH"
```

## Quick Start

```bash
# Check QGIS version
qgis info version

# List available processing algorithms
qgis process list

# Get help for a specific algorithm
qgis process info native:buffer
```

## Output Modes

All commands support two output modes:

```bash
# Human-readable (default) — formatted tables, progress bars, colored output
qgis layer list

# Machine-parseable — JSON output for scripting
qgis layer list --json
```

## REPL Mode

For interactive exploration, use the REPL mode:

```bash
qgis repl
```

In REPL mode, you can run commands without the `qgis` prefix:

```
>>> info version
>>> layer list
>>> process list
>>> project new
>>> exit
```

Help within REPL:
```
>>> help          # Show available REPL commands
>>> help layer    # Show layer subcommands
```

## Command Reference

### `info` — System Information

```bash
# Show QGIS version
qgis info version

# List enabled capabilities
qgis info capabilities

# Show registered data providers
qgis info providers

# List processing providers
qgis info processing

# View CRS database status
qgis info crs
```

### `project` — Project Management

```bash
# Create a new project
qgis project new

# Load an existing project
qgis project load my_map.qgz

# Inspect project metadata
qgis project inspect

# List project layers
qgis project layers

# Save the current project
qgis project save
qgis project save output.qgz

# Close the current project
qgis project close
```

### `layer` — Layer Operations

```bash
# Add a vector layer
qgis layer add roads.shp

# Add a raster layer
qgis layer add dem.tif

# List all loaded layers
qgis layer list
qgis layer list --json

# Inspect layer metadata
qgis layer info roads

# Remove a layer
qgis layer remove roads

# Query features with expression
qgis layer query roads --expression "type = 'primary'"
```

### `process` — Processing Algorithms

```bash
# List all available algorithms
qgis process list
qgis process list --json

# Get algorithm documentation
qgis process info native:buffer

# Run an algorithm
qgis process run native:buffer \
  --param INPUT=roads.shp \
  --param DISTANCE=100 \
  --param OUTPUT=roads_buffered.gpkg

# Run with JSON params file
qgis process run native:clip --params params.json

# Run a saved processing model
qgis process model my_model.qgsmodel
```

#### Common Algorithms

| Algorithm | Description | Example |
|-----------|-------------|---------|
| `native:buffer` | Buffer around features | `--param DISTANCE=50` |
| `native:clip` | Clip to extent | `--param OVERLAY=bounds.shp` |
| `native:dissolve` | Merge geometries | `--param FIELD=region` |
| `native:intersection` | Intersect two layers | `--param INPUT=a.shp --param OVERLAY=b.shp` |
| `native:centroid` | Calculate centroids | — |
| `native:simplify` | Simplify geometries | `--param TOLERANCE=0.01` |
| `gdal:warpreproject` | Reproject raster | `--param TARGET_CRS=EPSG:4326` |
| `gdal:cliprasterbyextent` | Clip raster | `--param PROJWIN=xmin,ymin,xmax,ymax` |

### `export` — Export Operations

```bash
# Export map canvas to image
qgis export map output.png --width 1920 --height 1080 --dpi 300

# Export print layout
qgis export layout "My Layout" layout.pdf

# Export a single layer
qgis export layer roads roads.geojson

# Batch export from config
qgis export batch export_config.json
```

#### Supported Export Formats
- **Image**: PNG, JPEG, TIFF, BMP
- **Vector**: GeoJSON, GeoPackage, Shapefile, GML, KML, DXF, CSV
- **Document**: PDF, SVG
- **Raster**: GeoTIFF, JPEG2000, NetCDF, ASCII Grid

### `convert` — Format Conversion

```bash
# Convert vector formats
qgis convert vector input.shp output.geojson
qgis convert vector input.shp output.gpkg
qgis convert vector input.geojson output.kml

# Convert raster formats
qgis convert raster input.tif output.jp2
qgis convert raster input.img output.tif

# Convert and reproject
qgis convert reproject input.shp output.shp --target-crs EPSG:4326

# Batch conversion
qgis convert batch conversion_config.json
```

#### Supported Vector Formats
Shapefile, GeoJSON, GeoPackage, GML, KML, DXF, CSV, PostGIS, SpatiaLite

#### Supported Raster Formats
GeoTIFF, JPEG2000, NetCDF, ASCII Grid, ERDAS Imagine (.img), PNG, JPEG

### `crs` — Coordinate Reference Systems

```bash
# List all available CRS
qgis crs list
qgis crs list --json

# Search CRS by name or code
qgis crs search "WGS 84"
qgis crs search "UTM zone 50"

# Lookup specific CRS
qgis crs lookup EPSG:4326
qgis crs lookup EPSG:3857

# Detect layer CRS
qgis crs detect input.shp

# Transform layer CRS
qgis crs transform input.shp output.shp --target-crs EPSG:4326
```

## Example Workflows

### Workflow 1: Convert Shapefile to GeoJSON

```bash
# Simple conversion
qgis convert vector data/parcels.shp output/parcels.geojson

# With JSON output for verification
qgis convert vector data/parcels.shp output/parcels.geojson --json
```

### Workflow 2: Buffer Analysis Pipeline

```bash
# Step 1: Load a project
qgis project load analysis.qgz

# Step 2: Inspect the layer
qgis layer info roads

# Step 3: Run buffer (100m around roads)
qgis process run native:buffer \
  --param INPUT=roads \
  --param DISTANCE=100 \
  --param SEGMENTS=8 \
  --param OUTPUT=roads_buffer.gpkg

# Step 4: Find intersecting features
qgis process run native:intersection \
  --param INPUT=buildings \
  --param OVERLAY=roads_buffer \
  --param OUTPUT=buildings_near_roads.gpkg

# Step 5: Export result
qgis export layer buildings_near_roads output/near_roads.geojson
```

### Workflow 3: Raster Clip and Reproject

```bash
# Step 1: Clip a raster DEM to a polygon extent
qgis process run gdal:cliprasterbyextent \
  --param INPUT=dem.tif \
  --param PROJWIN=120.5,30.0,121.5,31.0 \
  --param OUTPUT=dem_clipped.tif

# Step 2: Reproject to WGS 84
qgis process run gdal:warpreproject \
  --param INPUT=dem_clipped.tif \
  --param SOURCE_CRS=EPSG:32651 \
  --param DEST_CRS=EPSG:4326 \
  --param OUTPUT=dem_wgs84.tif

# Step 3: Generate hillshade
qgis process run native:hillshade \
  --param INPUT=dem_wgs84.tif \
  --param OUTPUT=hillshade.tif
```

### Workflow 4: Batch Format Conversion

```bash
# Convert all shapefiles in a directory to GeoPackage
qgis convert batch <<EOF
[
  {"input": "data/roads.shp", "output": "output/city.gpkg", "layer": "roads"},
  {"input": "data/buildings.shp", "output": "output/city.gpkg", "layer": "buildings"},
  {"input": "data/parks.shp", "output": "output/city.gpkg", "layer": "parks"}
]
EOF
```

### Workflow 5: CRS Transformation Pipeline

```bash
# Step 1: Check current CRS
qgis crs detect survey_data.shp
# Output: EPSG:2361 - Beijing 1954 / 3-degree Gauss-Kruger CM 117E

# Step 2: Transform to standard WGS 84
qgis crs transform survey_data.shp output/survey_wgs84.shp --target-crs EPSG:4326

# Step 3: Verify the transformation
qgis crs detect output/survey_wgs84.shp
# Output: EPSG:4326 - WGS 84
```

### Workflow 6: Print Layout Export

```bash
# Step 1: Load the project with layouts
qgis project load map_design.qgz

# Step 2: List available layouts
qgis project inspect --layouts

# Step 3: Export layout to PDF (print-ready)
qgis export layout "Final Map" output/final_map.pdf

# Step 4: Export layout to high-res image
qgis export layout "Final Map" output/final_map.png --dpi 300
```

## Architecture

```
cli_anything/qgis/
├── core/                    # Core QGIS API wrappers
│   ├── __init__.py
│   ├── app.py              # QgsApplication initialization
│   ├── project.py           # QgsProject operations
│   ├── layer.py             # QgsVectorLayer / QgsRasterLayer
│   └── processing.py        # QgsProcessingAlgorithm execution
├── utils/                   # Utility functions
│   ├── __init__.py
│   ├── crs.py              # CRS utilities
│   ├── formats.py           # Format detection and conversion
│   └── json_output.py       # JSON serialization helpers
├── tests/                   # Test suites
├── __init__.py
└── cli.py                   # Click CLI entry point
```

## Troubleshooting

### QGIS not found
```
Error: Could not find QGIS installation.
```
**Solution**: Ensure QGIS is installed and `qgis_process` is in your PATH, or set `QGIS_PREFIX_PATH`.

### Provider not loaded
```
Warning: GDAL provider not available.
```
**Solution**: Check `qgis info providers` and ensure GDAL/OGR is installed with your QGIS distribution.

### Algorithm not found
```
Error: Algorithm "native:xxx" not found.
```
**Solution**: Run `qgis process list` to see all available algorithms, or check if the provider is enabled.

### Permission denied on export
```
Error: Permission denied: output/file.gpkg
```
**Solution**: Ensure the output directory exists and you have write permissions.

## License

MIT — same as the cli-anything framework.

QGIS itself is licensed under GPLv2+. See [qgis.org](https://qgis.org) for details.
