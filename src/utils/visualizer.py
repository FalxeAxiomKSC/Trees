"""
Visualization component for Native Landscape Design Tool

This module provides functionality for visualizing landscape designs
using matplotlib and other visualization libraries.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
import random

class DesignVisualizer:
    """Class for visualizing landscape designs."""
    
    def __init__(self, output_dir="data/designs/visualizations"):
        """
        Initialize the visualizer.
        
        Args:
            output_dir (str): Directory to save visualizations
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Define color mappings for different plant types
        self.plant_type_colors = {
            "Tree": "#2E8B57",  # Sea Green
            "Deciduous tree": "#228B22",  # Forest Green
            "Evergreen tree": "#006400",  # Dark Green
            "Shrub": "#3CB371",  # Medium Sea Green
            "Deciduous shrub": "#32CD32",  # Lime Green
            "Evergreen shrub": "#008000",  # Green
            "Herbaceous perennial": "#7CFC00",  # Lawn Green
            "Grass": "#ADFF2F",  # Green Yellow
            "Groundcover": "#98FB98",  # Pale Green
            "Vine": "#00FA9A",  # Medium Spring Green
            "Fern": "#00FF7F",  # Spring Green
            "Bulb": "#9ACD32",  # Yellow Green
            "Annual": "#6B8E23",  # Olive Drab
            "Aquatic": "#66CDAA",  # Medium Aquamarine
            "Succulent": "#8FBC8F",  # Dark Sea Green
            "Fruit": "#556B2F"   # Dark Olive Green
        }
        
        # Define color mappings for different environmental conditions
        self.sun_exposure_colors = {
            "full_sun": "#FFFF00",  # Yellow
            "part_sun": "#FFD700",  # Gold
            "part_shade": "#FFA500",  # Orange
            "full_shade": "#8B4513"   # Saddle Brown
        }
        
        self.water_condition_colors = {
            "dry": "#F5DEB3",  # Wheat
            "medium_dry": "#DAA520",  # Goldenrod
            "medium": "#1E90FF",  # Dodger Blue
            "medium_wet": "#4169E1",  # Royal Blue
            "wet": "#0000CD"    # Medium Blue
        }
    
    def visualize_design(self, design, filename=None):
        """
        Create a visualization of a landscape design.
        
        Args:
            design (dict): Design data
            filename (str, optional): Output filename
            
        Returns:
            str: Path to saved visualization file
        """
        site = design["site"]
        zones = design["zones"]
        
        # Create figure and axis
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Get site dimensions
        width = site["dimensions"]["width"]
        length = site["dimensions"]["length"]
        
        # Set axis limits
        ax.set_xlim(0, width)
        ax.set_ylim(0, length)
        
        # Draw site boundary
        site_rect = patches.Rectangle((0, 0), width, length, linewidth=2, 
                                     edgecolor='black', facecolor='none')
        ax.add_patch(site_rect)
        
        # Draw zones
        self._draw_zones(ax, zones, site)
        
        # Draw plants
        self._draw_plants(ax, design["plant_selections"], site)
        
        # Add title and labels
        ax.set_title(f"Landscape Design: {site['name']}", fontsize=16)
        ax.set_xlabel("Width (feet)", fontsize=12)
        ax.set_ylabel("Length (feet)", fontsize=12)
        
        # Add legend for plant types
        self._add_legend(ax, design["plant_selections"])
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Save the visualization
        if filename is None:
            filename = f"design_{site['name'].replace(' ', '_').lower()}.png"
        
        output_path = os.path.join(self.output_dir, filename)
        plt.tight_layout()
        plt.savefig(output_path, dpi=300)
        plt.close()
        
        return output_path
    
    def _draw_zones(self, ax, zones, site):
        """
        Draw zones on the visualization.
        
        Args:
            ax (matplotlib.axes.Axes): Matplotlib axes
            zones (list): List of zone data
            site (dict): Site data
        """
        # If no explicit zone boundaries, create a heatmap of conditions
        width = site["dimensions"]["width"]
        length = site["dimensions"]["length"]
        
        # Create meshgrid for heatmap
        x = np.linspace(0, width, 100)
        y = np.linspace(0, length, 100)
        X, Y = np.meshgrid(x, y)
        
        # Create sun exposure heatmap
        sun_data = np.zeros((100, 100))
        water_data = np.zeros((100, 100))
        
        # Assign values based on zones
        for zone in zones:
            # Calculate zone position and size (simplified)
            zone_area_percentage = zone["percentage"] / 100
            zone_area = site["dimensions"]["width"] * site["dimensions"]["length"] * zone_area_percentage
            zone_size = np.sqrt(zone_area)
            
            # Random position for the zone (this is simplified)
            x_pos = random.uniform(zone_size/2, width - zone_size/2)
            y_pos = random.uniform(zone_size/2, length - zone_size/2)
            
            # Create a circular zone
            for i in range(100):
                for j in range(100):
                    dist = np.sqrt((X[i, j] - x_pos)**2 + (Y[i, j] - y_pos)**2)
                    if dist < zone_size/2:
                        # Assign sun exposure value
                        if zone["sun_exposure"] == "full_sun":
                            sun_data[i, j] = 1.0
                        elif zone["sun_exposure"] == "part_sun":
                            sun_data[i, j] = 0.7
                        elif zone["sun_exposure"] == "part_shade":
                            sun_data[i, j] = 0.4
                        elif zone["sun_exposure"] == "full_shade":
                            sun_data[i, j] = 0.1
                        
                        # Assign water condition value
                        if zone["water_condition"] == "wet":
                            water_data[i, j] = 1.0
                        elif zone["water_condition"] == "medium_wet":
                            water_data[i, j] = 0.7
                        elif zone["water_condition"] == "medium":
                            water_data[i, j] = 0.5
                        elif zone["water_condition"] == "medium_dry":
                            water_data[i, j] = 0.3
                        elif zone["water_condition"] == "dry":
                            water_data[i, j] = 0.1
        
        # Create custom colormaps
        sun_cmap = LinearSegmentedColormap.from_list(
            "sun_cmap", 
            [(0, self.sun_exposure_colors["full_shade"]), 
             (0.4, self.sun_exposure_colors["part_shade"]),
             (0.7, self.sun_exposure_colors["part_sun"]),
             (1, self.sun_exposure_colors["full_sun"])]
        )
        
        water_cmap = LinearSegmentedColormap.from_list(
            "water_cmap", 
            [(0, self.water_condition_colors["dry"]), 
             (0.3, self.water_condition_colors["medium_dry"]),
             (0.5, self.water_condition_colors["medium"]),
             (0.7, self.water_condition_colors["medium_wet"]),
             (1, self.water_condition_colors["wet"])]
        )
        
        # Plot heatmaps with transparency
        sun_plot = ax.imshow(sun_data, extent=[0, width, 0, length], 
                           origin='lower', cmap=sun_cmap, alpha=0.3)
        water_plot = ax.imshow(water_data, extent=[0, width, 0, length], 
                             origin='lower', cmap=water_cmap, alpha=0.3)
        
        # Add colorbars
        sun_cbar = plt.colorbar(sun_plot, ax=ax, orientation='vertical', 
                              pad=0.01, fraction=0.05)
        sun_cbar.set_label('Sun Exposure')
        
        water_cbar = plt.colorbar(water_plot, ax=ax, orientation='vertical', 
                                pad=0.05, fraction=0.05)
        water_cbar.set_label('Water Conditions')
    
    def _draw_plants(self, ax, plant_selections, site):
        """
        Draw plants on the visualization.
        
        Args:
            ax (matplotlib.axes.Axes): Matplotlib axes
            plant_selections (list): List of plant selection data
            site (dict): Site data
        """
        width = site["dimensions"]["width"]
        length = site["dimensions"]["length"]
        
        # Track used positions to avoid overlap
        used_positions = []
        
        for plant_selection in plant_selections:
            plant = plant_selection["plant"]
            quantity = plant_selection["quantity"]
            zone_id = plant_selection["zone_id"]
            
            # Get plant type and color
            plant_type = plant["plant_type"]
            color = self.plant_type_colors.get(plant_type, "#2E8B57")  # Default to Sea Green
            
            # Get plant size
            min_height, max_height = plant["height_range"]
            min_spread, max_spread = plant["spread_range"]
            avg_height = (min_height + max_height) / 2
            avg_spread = (min_spread + max_spread) / 2
            
            # Scale for visualization
            marker_size = avg_spread * 20  # Scale factor for marker size
            
            # Place plants in their zone (simplified)
            for i in range(quantity):
                # Try to find a position that doesn't overlap
                max_attempts = 50
                for attempt in range(max_attempts):
                    # Random position within site
                    x_pos = random.uniform(avg_spread/2, width - avg_spread/2)
                    y_pos = random.uniform(avg_spread/2, length - avg_spread/2)
                    
                    # Check if position overlaps with existing plants
                    overlap = False
                    for used_x, used_y, used_size in used_positions:
                        distance = np.sqrt((x_pos - used_x)**2 + (y_pos - used_y)**2)
                        if distance < (marker_size/40 + used_size/40):
                            overlap = True
                            break
                    
                    if not overlap:
                        break
                
                # Add plant marker
                ax.scatter(x_pos, y_pos, s=marker_size, c=color, alpha=0.7, 
                          edgecolors='black', linewidths=1, zorder=10)
                
                # Add to used positions
                used_positions.append((x_pos, y_pos, marker_size))
                
                # Add plant label for larger plants
                if avg_height > 3 or avg_spread > 3:
                    common_name = plant["common_name"]
                    ax.annotate(common_name, (x_pos, y_pos), 
                               xytext=(0, 5), textcoords='offset points',
                               ha='center', va='bottom', fontsize=8,
                               bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.7))
    
    def _add_legend(self, ax, plant_selections):
        """
        Add a legend to the visualization.
        
        Args:
            ax (matplotlib.axes.Axes): Matplotlib axes
            plant_selections (list): List of plant selection data
        """
        # Get unique plant types
        plant_types = set()
        for plant_selection in plant_selections:
            plant_type = plant_selection["plant"]["plant_type"]
            plant_types.add(plant_type)
        
        # Create legend elements
        legend_elements = []
        for plant_type in plant_types:
            color = self.plant_type_colors.get(plant_type, "#2E8B57")  # Default to Sea Green
            legend_elements.append(
                patches.Patch(facecolor=color, edgecolor='black',
                             label=plant_type)
            )
        
        # Add legend
        ax.legend(handles=legend_elements, loc='upper right',
                 title="Plant Types", framealpha=0.7)
    
    def visualize_site_conditions(self, site, filename=None):
        """
        Create a visualization of site conditions.
        
        Args:
            site (dict): Site data
            filename (str, optional): Output filename
            
        Returns:
            str: Path to saved visualization file
        """
        # Create figure and axis
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Get site dimensions
        width = site["dimensions"]["width"]
        length = site["dimensions"]["length"]
        
        # Set axis limits
        ax.set_xlim(0, width)
        ax.set_ylim(0, length)
        
        # Draw site boundary
        site_rect = patches.Rectangle((0, 0), width, length, linewidth=2, 
                                     edgecolor='black', facecolor='none')
        ax.add_patch(site_rect)
        
        # Create meshgrid for heatmap
        x = np.linspace(0, width, 100)
        y = np.linspace(0, length, 100)
        X, Y = np.meshgrid(x, y)
        
        # Create sun exposure heatmap (simplified)
        sun_data = np.zeros((100, 100))
        water_data = np.zeros((100, 100))
        
        # Assign values based on site conditions (simplified)
        if "sun_exposure" in site:
            for sun_type, area in site["sun_exposure"].items():
                # Create a region for this sun type
                region_size = np.sqrt(area)
                x_pos = random.uniform(region_size/2, width - region_size/2)
                y_pos = random.uniform(region_size/2, length - region_size/2)
                
                for i in range(100):
                    for j in range(100):
                        dist = np.sqrt((X[i, j] - x_pos)**2 + (Y[i, j] - y_pos)**2)
                        if dist < region_size/2:
                            if sun_type == "full_sun":
                                sun_data[i, j] = 1.0
                            elif sun_type == "part_sun":
                                sun_data[i, j] = 0.7
                            elif sun_type == "part_shade":
                                sun_data[i, j] = 0.4
                            elif sun_type == "full_shade":
                                sun_data[i, j] = 0.1
        
        if "water_conditions" in site:
            for water_type, area in site["water_conditions"].items():
                # Create a region for this water type
                region_size = np.sqrt(area)
                x_pos = random.uniform(region_size/2, width - region_size/2)
                y_pos = random.uniform(region_size/2, length - region_size/2)
                
                for i in range(100):
                    for j in range(100):
                        dist = np.sqrt((X[i, j] - x_pos)**2 + (Y[i, j] - y_pos)**2)
                        if dist < region_size/2:
                            if water_type == "wet":
                                water_data[i, j] = 1.0
                            elif water_type == "medium_wet":
                                water_data[i, j] = 0.7
                            elif water_type == "medium":
                                water_data[i, j] = 0.5
                            elif water_type == "medium_dry":
                                water_data[i, j] = 0.3
                            elif water_type == "dry":
                                water_data[i, j] = 0.1
        
        # Create custom colormaps
        sun_cmap = LinearSegmentedColormap.from_list(
            "sun_cmap", 
            [(0, self.sun_exposure_colors["full_shade"]), 
             (0.4, self.sun_exposure_colors["part_shade"]),
             (0.7, self.sun_exposure_colors["part_sun"]),
             (1, self.sun_exposure_colors["full_sun"])]
        )
        
        water_cmap = LinearSegmentedColormap.from_list(
            "water_cmap", 
            [(0, self.water_condition_colors["dry"]), 
             (0.3, self.water_condition_colors["medium_dry"]),
             (0.5, self.water_condition_colors["medium"]),
             (0.7, self.water_condition_colors["medium_wet"]),
             (1, self.water_condition_colors["wet"])]
        )
        
        # Plot heatmaps with transparency
        sun_plot = ax.imshow(sun_data, extent=[0, width, 0, length], 
                           origin='lower', cmap=sun_cmap, alpha=0.5)
        water_plot = ax.imshow(water_data, extent=[0, width, 0, length], 
                             origin='lower', cmap=water_cmap, alpha=0.5)
        
        # Add colorbars
        sun_cbar = plt.colorbar(sun_plot, ax=ax, orientation='vertical', 
                              pad=0.01, fraction=0.05)
        sun_cbar.set_label('Sun Exposure')
        
        water_cbar = plt.colorbar(water_plot, ax=ax, orientation='vertical', 
                                pad=0.05, fraction=0.05)
        water_cbar.set_label('Water Conditions')
        
        # Add title and labels
        ax.set_title(f"Site Conditions: {site['name']}", fontsize=16)
        ax.set_xlabel("Width (feet)", fontsize=12)
        ax.set_ylabel("Length (feet)", fontsize=12)
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Add site information
        info_text = f"Soil Type: {site.get('soil_type', 'Unknown')}\n"
        info_text += f"Soil pH: {site.get('soil_ph', 'Unknown')}\n"
        info_text += f"Hardiness Zone: {site.get('hardiness_zone', 'Unknown')}"
        
        plt.figtext(0.02, 0.02, info_text, fontsize=10, 
                   bbox=dict(facecolor='white', alpha=0.7))
        
        # Save the visualization
        if filename is None:
            filename = f"site_conditions_{site['name'].replace(' ', '_').lower()}.png"
        
        output_path = os.path.join(self.output_dir, filename)
        plt.tight_layout()
        plt.savefig(output_path, dpi=300)
        plt.close()
        
        return output_path
