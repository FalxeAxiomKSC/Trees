"""
Site Model for Native Landscape Design Tool

This module defines the Site class which represents a physical location with its
environmental characteristics. It includes attributes for location, climate conditions,
soil properties, topography, and other factors that influence landscape design.
"""

class Site:
    def __init__(self,
                 name,
                 location,
                 dimensions,
                 soil_type=None,
                 soil_ph=None,
                 sun_exposure=None,
                 water_conditions=None,
                 slope=None,
                 existing_vegetation=None,
                 hardiness_zone=None,
                 special_conditions=None):
        """
        Initialize a Site object with its characteristics.
        
        Args:
            name (str): Name or identifier for the site
            location (dict): Geographic location (latitude, longitude, elevation)
            dimensions (dict): Site dimensions (width, length, area)
            soil_type (str, optional): Predominant soil type
            soil_ph (float, optional): Soil pH level
            sun_exposure (dict, optional): Sun exposure in different areas of the site
            water_conditions (dict, optional): Water conditions in different areas
            slope (dict, optional): Slope characteristics (direction, percentage)
            existing_vegetation (list, optional): Existing plants on the site
            hardiness_zone (str, optional): USDA hardiness zone
            special_conditions (list, optional): Special environmental conditions
        """
        self.name = name
        self.location = location
        self.dimensions = dimensions
        self.soil_type = soil_type
        self.soil_ph = soil_ph
        self.sun_exposure = sun_exposure or {}
        self.water_conditions = water_conditions or {}
        self.slope = slope or {"direction": None, "percentage": 0}
        self.existing_vegetation = existing_vegetation or []
        self.hardiness_zone = hardiness_zone
        self.special_conditions = special_conditions or []
        self.zones = []  # Microclimate zones within the site
    
    def add_zone(self, zone):
        """
        Add a microclimate zone to the site.
        
        Args:
            zone (dict): Zone characteristics
        """
        self.zones.append(zone)
    
    def get_total_area(self):
        """
        Calculate the total area of the site.
        
        Returns:
            float: Total area in square feet
        """
        return self.dimensions.get("width", 0) * self.dimensions.get("length", 0)
    
    def get_sun_exposure_percentage(self, exposure_type):
        """
        Calculate the percentage of the site with a specific sun exposure.
        
        Args:
            exposure_type (str): Type of sun exposure
            
        Returns:
            float: Percentage of site with the specified exposure
        """
        if not self.sun_exposure:
            return 0
            
        total_area = self.get_total_area()
        if total_area == 0:
            return 0
            
        exposure_area = sum(area for exp, area in self.sun_exposure.items() 
                           if exp == exposure_type)
        return (exposure_area / total_area) * 100
    
    def get_water_condition_percentage(self, condition_type):
        """
        Calculate the percentage of the site with a specific water condition.
        
        Args:
            condition_type (str): Type of water condition
            
        Returns:
            float: Percentage of site with the specified condition
        """
        if not self.water_conditions:
            return 0
            
        total_area = self.get_total_area()
        if total_area == 0:
            return 0
            
        condition_area = sum(area for cond, area in self.water_conditions.items() 
                            if cond == condition_type)
        return (condition_area / total_area) * 100
    
    def is_suitable_for_plant(self, plant):
        """
        Check if the site is suitable for a specific plant.
        
        Args:
            plant (Plant): Plant object to check compatibility with
            
        Returns:
            dict: Suitability assessment with scores for different factors
        """
        # Check hardiness zone compatibility
        zone_compatible = plant.is_compatible_with_zone(self.hardiness_zone)
        
        # Check soil compatibility
        soil_compatible = plant.is_compatible_with_soil(self.soil_type, self.soil_ph)
        
        # Check sun exposure compatibility (if any part of the site matches)
        sun_compatible = False
        if self.sun_exposure:
            for exposure_type in self.sun_exposure.keys():
                if plant.is_compatible_with_sun(exposure_type):
                    sun_compatible = True
                    break
        else:
            sun_compatible = True  # No sun exposure data, assume compatible
        
        # Check water conditions compatibility (if any part of the site matches)
        water_compatible = False
        if self.water_conditions:
            for condition_type in self.water_conditions.keys():
                if plant.is_compatible_with_water(condition_type):
                    water_compatible = True
                    break
        else:
            water_compatible = True  # No water condition data, assume compatible
        
        # Calculate overall suitability score (0-100)
        factors = [
            (zone_compatible, 30),  # Zone compatibility worth 30%
            (soil_compatible, 30),  # Soil compatibility worth 30%
            (sun_compatible, 20),   # Sun compatibility worth 20%
            (water_compatible, 20)  # Water compatibility worth 20%
        ]
        
        score = sum(weight for compatible, weight in factors if compatible)
        
        return {
            "overall_score": score,
            "zone_compatible": zone_compatible,
            "soil_compatible": soil_compatible,
            "sun_compatible": sun_compatible,
            "water_compatible": water_compatible
        }
    
    def to_dict(self):
        """
        Convert the site object to a dictionary.
        
        Returns:
            dict: Dictionary representation of the site
        """
        return {
            "name": self.name,
            "location": self.location,
            "dimensions": self.dimensions,
            "soil_type": self.soil_type,
            "soil_ph": self.soil_ph,
            "sun_exposure": self.sun_exposure,
            "water_conditions": self.water_conditions,
            "slope": self.slope,
            "existing_vegetation": self.existing_vegetation,
            "hardiness_zone": self.hardiness_zone,
            "special_conditions": self.special_conditions,
            "zones": self.zones
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        Create a Site object from a dictionary.
        
        Args:
            data (dict): Dictionary containing site data
            
        Returns:
            Site: New Site object
        """
        site = cls(
            name=data.get("name"),
            location=data.get("location"),
            dimensions=data.get("dimensions"),
            soil_type=data.get("soil_type"),
            soil_ph=data.get("soil_ph"),
            sun_exposure=data.get("sun_exposure"),
            water_conditions=data.get("water_conditions"),
            slope=data.get("slope"),
            existing_vegetation=data.get("existing_vegetation"),
            hardiness_zone=data.get("hardiness_zone"),
            special_conditions=data.get("special_conditions")
        )
        
        # Add zones if present
        for zone in data.get("zones", []):
            site.add_zone(zone)
            
        return site
    
    def __str__(self):
        """String representation of the site."""
        return f"Site: {self.name} ({self.dimensions.get('width', 0)}x{self.dimensions.get('length', 0)})"
    
    def __repr__(self):
        """Representation of the site."""
        return f"Site('{self.name}', {self.location}, {self.dimensions})"
