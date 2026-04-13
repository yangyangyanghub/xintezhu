# QGIS - CLI Harness SOP

## Overview

QGIS (Quantum GIS) is a professional, open-source Geographic Information System (GIS) desktop application. It provides comprehensive tools for creating, editing, visualizing, analyzing, and publishing geospatial information.

This document serves as the Standard Operating Procedure (SOP) for the QGIS CLI harness, which wraps the QGIS Python API with a user-friendly command-line interface.

## Core Capabilities

### Vector Processing
- Add, edit, and manage vector layers (points, lines, polygons)
- Geometry operations: buffer, clip, dissolve, union, intersection, difference
- Attribute table management: add/delete/rename fields, calculate expressions
- Topology validation and cleaning
- Spatial joins and relational operations

### Raster Processing
- Load and manage raster layers (satellite imagery, DEMs, orthophotos)
- Raster calculator for mathematical operations
- Resampling, clipping, and mosaicking
- Hillshade, slope, aspect, and terrain analysis
- Reclassification and zonal statistics

### Projection & CRS Management
- Support for 7000+ coordinate reference systems (EPSG database)
- On-the-fly reprojection
- CRS transformation and datum shifts
- Custom CRS definition and management
- Coordinate lookup and identification

### Map Rendering & Visualization
- Layer styling: graduated, categorized, rule-based, heatmap rendering
- Labels, annotations, and map decorations
- 3D map viewing and terrain visualization
- Print layout composer for cartographic output
- WMS, WFS, WMTS, and other OGC service support

### Export & Publishing
- Export map canvases to image formats (PNG, JPEG, TIFF, SVG, PDF)
- Export layers to vector/raster files
- Print layout export with customizable templates
- Batch export automation
- Publish to GeoServer, MapServer, or web mapping platforms

### Data Conversion
- Convert between vector formats: Shapefile, GeoJSON, GeoPackage, GML, KML, DXF, PostgreSQL/PostGIS
- Convert between raster formats: GeoTIFF, JPEG2000, NetCDF, ASCII Grid, ERDAS Imagine
- Batch conversion workflows
- GDAL/OGR format translator support

## Processing Framework

QGIS includes a powerful Processing Framework with **200+ native algorithms** plus third-party providers:

### Native Provider (QGIS Core)
| Category | Algorithms |
|----------|-----------|
| Vector General | Buffer, Clip, Dissolve, Explode, Merge, Union, Intersection, Difference, Symmetrical Difference |
| Vector Analysis | Statistics by Categories, Field Statistics, Count Points in Polygon, Nearest Neighbor |
| Vector Overlay | Join Attributes by Location, Clip, Intersect, Union, Difference |
| Vector Geometry | Centroids, Convex Hull, Minimum Bounding Geometry, Densify, Smooth, Simplify |
| Vector Table | Add Field, Calculate Field, Drop Field, Rename Field, Refactor Fields |
| Raster Analysis | Aspect, Hillshade, Ruggedness Index, Slope, Zonal Statistics |
| Raster Conversion | Translate, Clip, Extract Projection, Polygonize, Rasterize |
| Database | Execute SQL (SpatiaLite), Execute SQL (GeoPackage) |

### GDAL Provider
- Raster format conversion and manipulation
- Reprojection (gdalwarp)
- Mosaicking (gdal_merge)
- Translate and format conversion (gdal_translate)
- Contour generation (gdal_contour)
- Polygonize raster to vector (gdal_polygonize)
- Building VRT files

### GRASS GIS Provider
- 400+ GRASS algorithms for advanced spatial analysis
- Hydrological modeling (r.watershed, r.stream.*)
- Network analysis (v.net.*)
- Image classification (i.group, i.maxlik)
- Terrain analysis (r.slope.aspect, r.viewshed)

### Model Support
- Graphical Modeler for creating complex processing workflows
- Save models as `.model3` files
- Execute models from CLI via `qgis_process run`
- Chain multiple algorithms into reusable pipelines

## Command Groups

The CLI harness organizes functionality into logical command groups:

### `info`
Get QGIS system information and status.

| Command | Description |
|---------|-------------|
| `qgis info version` | Display QGIS version (major, minor, patch) |
| `qgis info capabilities` | List enabled capabilities and features |
| `qgis info providers` | Show registered data providers (ogr, gdal, postgres, etc.) |
| `qgis info processing` | List processing providers (native, gdal, grass, otb) |
| `qgis info crs` | Show current CRS database status |

### `project`
Create, load, and manage QGIS projects.

| Command | Description |
|---------|-------------|
| `qgis project new` | Create a new QGIS project |
| `qgis project load <path>` | Load an existing `.qgs` or `.qgz` project |
| `qgis project save [path]` | Save the current project |
| `qgis project inspect` | Show project metadata, layers, and settings |
| `qgis project layers` | List all layers in the current project |
| `qgis project close` | Close the current project |

### `layer`
Add, list, and inspect vector/raster layers.

| Command | Description |
|---------|-------------|
| `qgis layer add <path>` | Add a vector or raster layer to the project |
| `qgis layer list` | List all loaded layers with type and CRS |
| `qgis layer info <name>` | Show layer metadata, extent, field schema, feature count |
| `qgis layer remove <name>` | Remove a layer from the project |
| `qgis layer query <name> --expression` | Filter features by expression |

### `process`
Run processing algorithms on loaded data.

| Command | Description |
|---------|-------------|
| `qgis process list` | List all available processing algorithms |
| `qgis process info <algorithm>` | Show algorithm parameters and outputs |
| `qgis process run <algorithm> [options]` | Execute a processing algorithm |
| `qgis process model <model.qgsmodel>` | Run a saved processing model |

#### Common Algorithms
| Algorithm ID | Description |
|--------------|-------------|
| `native:buffer` | Create buffer zones around features |
| `native:clip` | Clip features to a bounding layer |
| `native:dissolve` | Merge features with common attributes |
| `native:intersection` | Compute geometric intersection of two layers |
| `native:union` | Compute geometric union of two layers |
| `native:centroid` | Calculate centroids of polygon features |
| `native:simplify` | Simplify geometries using Douglas-Peucker |
| `native:convexhull` | Compute convex hull of geometries |
| `gdal:cliprasterbyextent` | Clip raster to extent |
| `gdal:warpreproject` | Reproject raster to different CRS |

### `export`
Export maps, layouts, and layers to various formats.

| Command | Description |
|---------|-------------|
| `qgis export map <output> --width --height --dpi` | Export map canvas to image |
| `qgis export layout <name> <output>` | Export print layout to PDF/image |
| `qgis export layer <name> <output>` | Export a single layer to file |
| `qgis export batch <config>` | Batch export using configuration file |

#### Supported Export Formats
- **Vector**: GeoPackage (.gpkg), GeoJSON (.geojson), Shapefile, GML, KML, DXF, CSV
- **Raster**: GeoTIFF, PNG, JPEG, TIFF, BMP, PDF, SVG
- **Layout**: PDF, PNG, SVG, JPG

### `convert`
Convert between GIS formats.

| Command | Description |
|---------|-------------|
| `qgis convert vector <input> <output>` | Convert vector format |
| `qgis convert raster <input> <output>` | Convert raster format |
| `qgis convert batch <config>` | Batch conversion |
| `qgis convert reproject <input> <output> --target-crs` | Convert and reproject |

#### Supported Formats
| Type | Formats |
|------|---------|
| Vector | Shapefile, GeoJSON, GeoPackage, GML, KML, DXF, CSV, PostGIS, SpatiaLite |
| Raster | GeoTIFF, JPEG2000, NetCDF, ASCII Grid, ERDAS Imagine (.img), PNG, JPEG |

### `crs`
Coordinate reference system operations.

| Command | Description |
|---------|-------------|
| `qgis crs list` | List all available CRS definitions |
| `qgis crs search <query>` | Search CRS by EPSG code, name, or authority |
| `qgis crs lookup <code>` | Get details for a specific CRS (e.g., EPSG:4326) |
| `qgis crs transform <input> <output> --target-crs` | Transform layer to different CRS |
| `qgis crs detect <layer>` | Detect the CRS of a layer |

## Existing qgis_process CLI

QGIS ships with a built-in `qgis_process` command-line tool. Our harness builds upon and extends its functionality.

### qgis_process Built-in Commands
| Command | Description |
|---------|-------------|
| `qgis_process plugins` | List processing plugins |
| `qgis_process plugins list` | List available processing providers |
| `qgis_process plugins enable <name>` | Enable a processing provider |
| `qgis_process plugins disable <name>` | Disable a processing provider |
| `qgis_process list` | List all available processing algorithms |
| `qgis_process help [algorithm]` | Show QGIS help or algorithm documentation |
| `qgis_process run <algorithm> [params]` | Execute a processing algorithm with parameters |

### Parameter passing to qgis_process run
Parameters are passed as JSON:
```bash
qgis_process run native:buffer \
  INPUT="layer.gpkg" \
  DISTANCE=100 \
  OUTPUT="buffered.gpkg"
```

## Python API Reference

The CLI harness leverages the QGIS Python API:

### Core Classes
| Class | Purpose |
|-------|---------|
| `qgis.core.QgsApplication` | Initialize QGIS application context |
| `qgis.core.QgsProject` | Manage QGIS projects and layers |
| `qgis.core.QgsProcessingAlgorithm` | Base class for processing algorithms |
| `qgis.core.QgsVectorLayer` | Vector layer operations |
| `qgis.core.QgsRasterLayer` | Raster layer operations |
| `qgis.core.QgsCoordinateReferenceSystem` | CRS management |
| `qgis.core.QgsProcessingContext` | Context for algorithm execution |
| `qgis.core.QgsProcessingFeedback` | Progress feedback and cancellation |
| `qgis.core.QgsProcessingRegistry` | Algorithm registry and lookup |

### Initialization Pattern
```python
from qgis.core import QgsApplication

# Initialize QGIS application (required before using any QGIS API)
app = QgsApplication([], False)
QgsApplication.setPrefixPath("/path/to/qgis", True)
QgsApplication.initQgis()

# ... perform operations ...

# Clean up
QgsApplication.exitQgis()
```

### Processing Execution Pattern
```python
from qgis.core import QgsApplication, QgsProcessingFeedback

feedback = QgsProcessingFeedback()
registry = QgsApplication.processingRegistry()
algorithm = registry.algorithmById("native:buffer")

params = {
    "INPUT": "input.gpkg",
    "DISTANCE": 100,
    "OUTPUT": "output.gpkg"
}

result = QgsApplication.processingRegistry().runAlgorithm(algorithm, params, feedback=feedback)
```

## Environment Requirements

- **QGIS Installation**: QGIS 3.x (LTS recommended: 3.34+)
- **Python**: 3.9+ (bundled with QGIS)
- **OS**: Windows, macOS, Linux
- **Environment Variables**:
  - `QGIS_PREFIX_PATH`: Path to QGIS installation (Windows)
  - `PATH`: Include QGIS bin directory for `qgis_process`

## Output Modes

All commands support two output modes:

| Mode | Flag | Description |
|------|------|-------------|
| Human-readable | *(default)* | Formatted tables, progress bars, colored output |
| Machine-parseable | `--json` | JSON output for scripting and automation |
