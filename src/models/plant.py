"""
Plant Model for Native Landscape Design Tool

This module defines the Plant class which represents plant species and their characteristics
relevant to landscape design. It includes attributes for water needs, sun requirements,
soil preferences, and other factors that influence plant selection and placement.
"""

class Plant:
    def __init__(self, 
                 scientific_name,
                 common_name,
                 plant_type,
                 native_range=None,
                 usda_hardiness_zone=None,
                 height_range=None,
                 spread_range=None,
                 bloom_time=None,
                 bloom_color=None,
                 sun_exposure=None,
                 water_needs=None,
                 soil_type=None,
                 soil_ph=None,
                 maintenance_level=None,
                 ecological_benefits=None,
                 special_features=None,
                 image_url=None,
                 data_source=None):
        """
        Initialize a Plant object with its characteristics.
        
        Args:
            scientific_name (str): Botanical name (genus and species)
            common_name (str): Common name(s)
            plant_type (str): Type of plant (e.g., tree, shrub, perennial)
            native_range (list, optional): Geographic regions where the plant is native
            usda_hardiness_zone (str, optional): USDA hardiness zone range (e.g., "5-9")
            height_range (tuple, optional): Min and max height in feet (min, max)
            spread_range (tuple, optional): Min and max spread in feet (min, max)
            bloom_time (list, optional): Months when the plant blooms
            bloom_color (list, optional): Flower colors
            sun_exposure (list, optional): Preferred sun conditions
            water_needs (str, optional): Water requirements
            soil_type (list, optional): Preferred soil types
            soil_ph (tuple, optional): Preferred soil pH range (min, max)
            maintenance_level (str, optional): Level of maintenance required
            ecological_benefits (list, optional): Benefits to wildlife or ecosystem
            special_features (list, optional): Notable characteristics
            image_url (str, optional): URL to plant image
            data_source (str, optional): Source of the plant data
        """
        self.scientific_name = scientific_name
        self.common_name = common_name
        self.plant_type = plant_type
        self.native_range = native_range or []
        self.usda_hardiness_zone = usda_hardiness_zone
        self.height_range = height_range or (0, 0)
        self.spread_range = spread_range or (0, 0)
        self.bloom_time = bloom_time or []
        self.bloom_color = bloom_color or []
        self.sun_exposure = sun_exposure or []
        self.water_needs = water_needs
        self.soil_type = soil_type or []
        self.soil_ph = soil_ph or (5.5, 7.5)
        self.maintenance_level = maintenance_level
        self.ecological_benefits = ecological_benefits or []
        self.special_features = special_features or []
        self.image_url = image_url
        self.data_source = data_source
    
    def is_compatible_with_zone(self, zone):
        """
        Check if the plant is compatible with the given hardiness zone.
        
        Args:
            zone (str): USDA hardiness zone to check
            
        Returns:
            bool: True if compatible, False otherwise
        """
        if not self.usda_hardiness_zone:
            return True  # If no zone data, assume compatible
            
        # Parse zone range (e.g., "5-9" or "7a-9b")
        try:
            zone_parts = self.usda_hardiness_zone.split('-')
            min_zone = zone_parts[0].strip()
            max_zone = zone_parts[1].strip() if len(zone_parts) > 1 else min_zone
            
            # Convert zone to numeric value for comparison
            zone_value = self._zone_to_numeric(zone)
            min_zone_value = self._zone_to_numeric(min_zone)
            max_zone_value = self._zone_to_numeric(max_zone)
            
            return min_zone_value <= zone_value <= max_zone_value
        except:
            return True  # If parsing fails, assume compatible
    
    def _zone_to_numeric(self, zone):
        """
        Convert USDA zone to numeric value for comparison.
        For example: "7a" -> 7.0, "7b" -> 7.5
        
        Args:
            zone (str): USDA zone designation
            
        Returns:
            float: Numeric representation of the zone
        """
        try:
            if zone[-1].isalpha():
                base = int(zone[:-1])
                suffix = zone[-1].lower()
                if suffix == 'a':
                    return base
                elif suffix == 'b':
                    return base + 0.5
                else:
                    return base
            else:
                return float(zone)
        except:
            return 0
    
    def is_compatible_with_soil(self, soil_type, soil_ph):
        """
        Check if the plant is compatible with the given soil conditions.
        
        Args:
            soil_type (str): Soil type to check
            soil_ph (float): Soil pH to check
            
        Returns:
            bool: True if compatible, False otherwise
        """
        # Check soil type compatibility
        soil_compatible = not self.soil_type or soil_type in self.soil_type
        
        # Check soil pH compatibility
        ph_compatible = self.soil_ph[0] <= soil_ph <= self.soil_ph[1]
        
        return soil_compatible and ph_compatible
    
    def is_compatible_with_sun(self, sun_condition):
        """
        Check if the plant is compatible with the given sun conditions.
        
        Args:
            sun_condition (str): Sun condition to check
            
        Returns:
            bool: True if compatible, False otherwise
        """
        return not self.sun_exposure or sun_condition in self.sun_exposure
    
    def is_compatible_with_water(self, water_condition):
        """
        Check if the plant is compatible with the given water conditions.
        
        Args:
            water_condition (str): Water condition to check
            
        Returns:
            bool: True if compatible, False otherwise
        """
        return not self.water_needs or self.water_needs == water_condition
    
    def to_dict(self):
        """
        Convert the plant object to a dictionary.
        
        Returns:
            dict: Dictionary representation of the plant
        """
        return {
            'scientific_name': self.scientific_name,
            'common_name': self.common_name,
            'plant_type': self.plant_type,
            'native_range': self.native_range,
            'usda_hardiness_zone': self.usda_hardiness_zone,
            'height_range': self.height_range,
            'spread_range': self.spread_range,
            'bloom_time': self.bloom_time,
            'bloom_color': self.bloom_color,
            'sun_exposure': self.sun_exposure,
            'water_needs': self.water_needs,
            'soil_type': self.soil_type,
            'soil_ph': self.soil_ph,
            'maintenance_level': self.maintenance_level,
            'ecological_benefits': self.ecological_benefits,
            'special_features': self.special_features,
            'image_url': self.image_url,
            'data_source': self.data_source
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        Create a Plant object from a dictionary.
        
        Args:
            data (dict): Dictionary containing plant data
            
        Returns:
            Plant: New Plant object
        """
        return cls(**data)
    
    def __str__(self):
        """String representation of the plant."""
        return f"{self.scientific_name} ({self.common_name})"
    
    def __repr__(self):
        """Representation of the plant."""
        return f"Plant('{self.scientific_name}', '{self.common_name}', '{self.plant_type}')"
