import numpy as np
import rasterio
import matplotlib.pyplot as plt
from matplotlib import colors
from matplotlib.patches import Patch

def generate_everest_map(dem_path, output_path):
    # 1. Load DEM and Crop
    with rasterio.open(dem_path) as src:
        # Crop: 0 to 1500 rows, 2500 to 3601 cols (Everest area)
        window = rasterio.windows.Window(2500, 0, 3601-2500, 1500)
        dem = src.read(1, window=window)

    dem = dem.astype(np.float64)
    dem[dem <= 0] = np.nan
    
    print(f"Loaded Crop shape: {dem.shape}, Max: {np.nanmax(dem)}")

    # 2. Hillshading (Manual Numpy for 100% control)
    x, y = np.gradient(dem, 1.0, 1.0)
    slope = np.pi/2. - np.arctan(np.sqrt(x*x + y*y))
    aspect = np.arctan2(-x, y)
    
    azm = np.deg2rad(360.0 - 315.0)
    slp = np.deg2rad(45.0)
    
    hs = 255.0 * (np.cos(slp)*np.cos(slope) + np.sin(slp)*np.sin(slope)*np.cos(azm - aspect))
    hs = np.clip(hs, 0, 255)
    intensity = hs / 255.0

    # 3. Color the Zonation
    zone_colors = ['#228B22', '#556B2F', '#8B4513', '#A9A9A9', '#FFFFFF']
    bounds = [0, 3800, 4500, 5200, 5800, 9000]
    cmap = colors.ListedColormap(zone_colors)
    norm = colors.BoundaryNorm(bounds, cmap.N)

    # Map elevation to RGB colors
    rgba = cmap(norm(dem))
    rgba[np.isnan(dem), 3] = 0 
    
    # 4. Multiply Blend: Final RGB = Base Color * Intensity
    rgb_shaded = rgba[:, :, :3] * np.dstack([intensity, intensity, intensity])

    # 5. Plot with Matplotlib
    fig, ax = plt.subplots(figsize=(16, 10), dpi=200)
    ax.set_facecolor('black') 
    ax.axis('off')
    
    im = ax.imshow(rgb_shaded, origin='upper')
    
    # Legend
    handles = [Patch(facecolor=zone_colors[i], label=f'{bounds[i]}-{bounds[i+1]}m') for i in range(len(zone_colors)-1)]
    handles[-1] = Patch(facecolor=zone_colors[-1], label=f'>{bounds[-2]}m')
    
    legend = ax.legend(handles=handles, loc='lower right', bbox_to_anchor=(0.75, 0.25), framealpha=0.9)
    for text in legend.get_texts():
        text.set_color('white')
    legend.get_frame().set_edgecolor('white')
    legend.get_frame().set_facecolor('#000000AA')

    ax.set_title('Mount Everest — Vertical Zonation', fontsize=28, color='white', fontweight='bold', pad=30)
    
    fig.savefig(output_path, dpi=300, bbox_inches='tight', pad_inches=0.2, facecolor='black')
    plt.close()
    print(f"Saved art to {output_path}")

if __name__ == "__main__":
    generate_everest_map(
        "qgis-source/mount_everest_dem.tif", 
        "assets/generated/everest_zonation_artistic.png"
    )