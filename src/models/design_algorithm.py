"""
Design Algorithm for Native Landscape Design Tool

This module provides the core algorithm for generating landscape designs based on
site conditions and plant characteristics. It matches plants to appropriate locations
within a site based on environmental factors and design principles.
"""

import random
from collections import defaultdict

class DesignAlgorithm:
    def __init__(self, config=None):
        """
        Initialize the design algorithm with configuration settings.
        
        Args:
            config (dict, optional): Algorithm configuration parameters
        """
        self.config = config or {}
        self.weights = self.config.get('weights', {
            "water_needs": 0.25,
            "soil_compatibility": 0.25,
            "sun_requirements": 0.20,
            "native_preference": 0.15,
            "maintenance_level": 0.10,
            "aesthetic_value": 0.05
        })
    
    def generate_design(self, site, plant_database, design_parameters=None):
        """
        Generate a landscape design for a site using available plants.
        
        Args:
            site (Site): Site object with environmental characteristics
            plant_database (list): List of Plant objects available for selection
            design_parameters (dict, optional): Additional design parameters
            
        Returns:
            dict: Generated design with plant selections and placements
        """
        design_parameters = design_parameters or {}
        
        # Filter plants by basic compatibility with the site
        compatible_plants = self._filter_compatible_plants(site, plant_database)
        
        # Divide the site into zones based on environmental conditions
        zones = self._create_site_zones(site)
        
        # Select plants for each zone
        design = {
            "site": site.to_dict(),
            "zones": [],
            "plant_selections": [],
            "statistics": {}
        }
        
        for zone in zones:
            # Score plants for this specific zone
            scored_plants = self._score_plants_for_zone(zone, compatible_plants)
            
            # Select top plants for the zone based on scores and design parameters
            selected_plants = self._select_plants_for_zone(
                zone, 
                scored_plants, 
                design_parameters.get('plants_per_zone', 5),
                design_parameters.get('diversity_factor', 0.7)
            )
            
            # Add zone with selected plants to the design
            zone_design = {
                "zone_id": zone["id"],
                "characteristics": zone,
                "plants": selected_plants
            }
            design["zones"].append(zone_design)
            
            # Add selected plants to overall plant selections
            for plant_selection in selected_plants:
                if plant_selection not in design["plant_selections"]:
                    design["plant_selections"].append(plant_selection)
        
        # Calculate design statistics
        design["statistics"] = self._calculate_design_statistics(design)
        
        return design
    
    def _filter_compatible_plants(self, site, plant_database):
        """
        Filter plants that are basically compatible with the site.
        
        Args:
            site (Site): Site object
            plant_database (list): List of Plant objects
            
        Returns:
            list: Filtered list of compatible Plant objects
        """
        compatible_plants = []
        
        for plant in plant_database:
            suitability = site.is_suitable_for_plant(plant)
            if suitability["overall_score"] > 50:  # Basic threshold for compatibility
                compatible_plants.append({
                    "plant": plant,
                    "suitability": suitability
                })
        
        return compatible_plants
    
    def _create_site_zones(self, site):
        """
        Divide the site into zones based on environmental conditions.
        
        Args:
            site (Site): Site object
            
        Returns:
            list: List of zone dictionaries
        """
        # If site already has defined zones, use those
        if site.zones:
            return site.zones
        
        # Otherwise, create zones based on sun exposure and water conditions
        zones = []
        zone_id = 1
        
        # Create zones based on combinations of sun exposure and water conditions
        for sun_type, sun_area in site.sun_exposure.items():
            for water_type, water_area in site.water_conditions.items():
                # Estimate the overlap area (simplified)
                overlap_area = (sun_area / site.get_total_area()) * (water_area / site.get_total_area()) * site.get_total_area()
                
                if overlap_area > 0:
                    zone = {
                        "id": f"zone_{zone_id}",
                        "sun_exposure": sun_type,
                        "water_condition": water_type,
                        "soil_type": site.soil_type,  # Assume same soil across site
                        "soil_ph": site.soil_ph,      # Assume same pH across site
                        "area": overlap_area,
                        "percentage": (overlap_area / site.get_total_area()) * 100
                    }
                    zones.append(zone)
                    zone_id += 1
        
        # If no zones were created, create a single zone with site characteristics
        if not zones:
            zones.append({
                "id": "zone_1",
                "sun_exposure": "full_sun",  # Default assumption
                "water_condition": "medium",  # Default assumption
                "soil_type": site.soil_type,
                "soil_ph": site.soil_ph,
                "area": site.get_total_area(),
                "percentage": 100
            })
        
        return zones
    
    def _score_plants_for_zone(self, zone, compatible_plants):
        """
        Score plants for a specific zone based on compatibility and design factors.
        
        Args:
            zone (dict): Zone characteristics
            compatible_plants (list): List of compatible plant dictionaries
            
        Returns:
            list: Plants with scores for the zone
        """
        scored_plants = []
        
        for plant_info in compatible_plants:
            plant = plant_info["plant"]
            base_suitability = plant_info["suitability"]["overall_score"]
            
            # Calculate specific zone compatibility
            zone_score = 0
            
            # Sun compatibility for this specific zone
            if plant.is_compatible_with_sun(zone["sun_exposure"]):
                zone_score += self.weights["sun_requirements"] * 100
            
            # Water compatibility for this specific zone
            if plant.is_compatible_with_water(zone["water_condition"]):
                zone_score += self.weights["water_needs"] * 100
            
            # Soil compatibility
            if plant.is_compatible_with_soil(zone["soil_type"], zone["soil_ph"]):
                zone_score += self.weights["soil_compatibility"] * 100
            
            # Native preference (if plant is native to the region)
            if "Arkansas" in plant.native_range or "AR" in plant.native_range:
                zone_score += self.weights["native_preference"] * 100
            
            # Maintenance level (prefer lower maintenance)
            if plant.maintenance_level == "low":
                zone_score += self.weights["maintenance_level"] * 100
            elif plant.maintenance_level == "medium":
                zone_score += self.weights["maintenance_level"] * 50
            
            # Combine base suitability with zone-specific score
            final_score = (base_suitability * 0.4) + (zone_score * 0.6)
            
            scored_plants.append({
                "plant": plant,
                "score": final_score,
                "zone_id": zone["id"]
            })
        
        # Sort plants by score (descending)
        scored_plants.sort(key=lambda x: x["score"], reverse=True)
        
        return scored_plants
    
    def _select_plants_for_zone(self, zone, scored_plants, max_plants=5, diversity_factor=0.7):
        """
        Select plants for a zone based on scores and design principles.
        
        Args:
            zone (dict): Zone characteristics
            scored_plants (list): Plants with scores for the zone
            max_plants (int): Maximum number of plants to select
            diversity_factor (float): Factor to encourage plant diversity (0-1)
            
        Returns:
            list: Selected plants for the zone
        """
        selected_plants = []
        plant_types = defaultdict(int)
        
        # Calculate area-based plant count
        area_based_count = min(max_plants, int(zone["area"] / 100) + 1)
        target_count = max(1, area_based_count)
        
        # Select top-scoring plants while maintaining diversity
        for plant_info in scored_plants:
            plant = plant_info["plant"]
            
            # Check if we've reached the target count
            if len(selected_plants) >= target_count:
                break
            
            # Check if we already have too many of this plant type
            if plant_types[plant.plant_type] >= (target_count * (1 - diversity_factor)):
                continue
            
            # Add the plant to the selection
            selected_plants.append({
                "plant": plant.to_dict(),
                "score": plant_info["score"],
                "quantity": self._calculate_plant_quantity(plant, zone["area"]),
                "zone_id": zone["id"]
            })
            
            # Update plant type count
            plant_types[plant.plant_type] += 1
        
        return selected_plants
    
    def _calculate_plant_quantity(self, plant, area):
        """
        Calculate the appropriate quantity of a plant for a given area.
        
        Args:
            plant (Plant): Plant object
            area (float): Area in square feet
            
        Returns:
            int: Recommended quantity
        """
        # Get plant spread (average of min and max)
        min_spread, max_spread = plant.spread_range
        avg_spread = (min_spread + max_spread) / 2
        
        # Calculate plants per 100 sq ft based on spread
        if avg_spread <= 1:  # Small plants
            plants_per_100sqft = 16
        elif avg_spread <= 3:  # Medium plants
            plants_per_100sqft = 4
        elif avg_spread <= 6:  # Large plants
            plants_per_100sqft = 1
        else:  # Very large plants
            plants_per_100sqft = 0.25
        
        # Calculate quantity based on area
        quantity = int((area / 100) * plants_per_100sqft)
        
        # Ensure at least 1 plant
        return max(1, quantity)
    
    def _calculate_design_statistics(self, design):
        """
        Calculate statistics for the generated design.
        
        Args:
            design (dict): Generated design
            
        Returns:
            dict: Design statistics
        """
        statistics = {
            "total_plants": 0,
            "plant_types": defaultdict(int),
            "native_percentage": 0,
            "water_usage_score": 0,
            "maintenance_score": 0,
            "biodiversity_score": 0
        }
        
        total_plants = 0
        native_plants = 0
        
        for zone in design["zones"]:
            for plant_selection in zone["plants"]:
                plant = plant_selection["plant"]
                quantity = plant_selection["quantity"]
                
                # Update total plants
                total_plants += quantity
                
                # Update plant types
                statistics["plant_types"][plant["plant_type"]] += quantity
                
                # Update native count
                if "Arkansas" in plant["native_range"] or "AR" in plant["native_range"]:
                    native_plants += quantity
                
                # Update water usage score (lower is better)
                if plant["water_needs"] == "low":
                    statistics["water_usage_score"] += quantity * 1
                elif plant["water_needs"] == "medium":
                    statistics["water_usage_score"] += quantity * 2
                elif plant["water_needs"] == "high":
                    statistics["water_usage_score"] += quantity * 3
                
                # Update maintenance score (lower is better)
                if plant["maintenance_level"] == "low":
                    statistics["maintenance_score"] += quantity * 1
                elif plant["maintenance_level"] == "medium":
                    statistics["maintenance_score"] += quantity * 2
                elif plant["maintenance_level"] == "high":
                    statistics["maintenance_score"] += quantity * 3
        
        # Finalize statistics
        statistics["total_plants"] = total_plants
        
        if total_plants > 0:
            statistics["native_percentage"] = (native_plants / total_plants) * 100
            statistics["water_usage_score"] = statistics["water_usage_score"] / total_plants
            statistics["maintenance_score"] = statistics["maintenance_score"] / total_plants
        
        # Calculate biodiversity score (higher is better)
        plant_type_count = len(statistics["plant_types"])
        statistics["biodiversity_score"] = min(100, plant_type_count * 10)
        
        return statistics
