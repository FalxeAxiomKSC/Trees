"""
Main application module for Native Landscape Design Tool

This module serves as the entry point for the application and coordinates
the interaction between different components of the system.
"""

import os
import json
import logging
from datetime import datetime

# Import models
from models.plant import Plant
from models.site import Site
from models.design_algorithm import DesignAlgorithm

# Import configuration
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("landscape_tool.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class LandscapeDesignTool:
    """Main application class for the Native Landscape Design Tool."""
    
    def __init__(self):
        """Initialize the application."""
        logger.info("Initializing Native Landscape Design Tool")
        self.config = config
        self.plant_database = []
        self.design_algorithm = DesignAlgorithm(config.ALGORITHM_WEIGHTS)
        
        # Create data directories if they don't exist
        self._ensure_data_directories()
        
        # Load plant database
        self._load_plant_database()
    
    def _ensure_data_directories(self):
        """Ensure that necessary data directories exist."""
        directories = [
            "data/plants",
            "data/designs",
            "data/climate",
            "data/soil",
            "data/municipal_guidelines"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.debug(f"Ensured directory exists: {directory}")
    
    def _load_plant_database(self):
        """Load plant database from file."""
        try:
            plant_file = "data/plants/plant_database.json"
            if os.path.exists(plant_file):
                with open(plant_file, 'r') as f:
                    plants_data = json.load(f)
                
                for plant_data in plants_data:
                    self.plant_database.append(Plant.from_dict(plant_data))
                
                logger.info(f"Loaded {len(self.plant_database)} plants from database")
            else:
                logger.warning("Plant database file not found. Starting with empty database.")
        except Exception as e:
            logger.error(f"Error loading plant database: {e}")
    
    def save_plant_database(self):
        """Save plant database to file."""
        try:
            plant_file = "data/plants/plant_database.json"
            plants_data = [plant.to_dict() for plant in self.plant_database]
            
            with open(plant_file, 'w') as f:
                json.dump(plants_data, f, indent=2)
            
            logger.info(f"Saved {len(self.plant_database)} plants to database")
        except Exception as e:
            logger.error(f"Error saving plant database: {e}")
    
    def add_plant(self, plant_data):
        """
        Add a new plant to the database.
        
        Args:
            plant_data (dict): Plant data dictionary
            
        Returns:
            Plant: The newly added plant
        """
        try:
            plant = Plant.from_dict(plant_data)
            self.plant_database.append(plant)
            self.save_plant_database()
            logger.info(f"Added plant: {plant.scientific_name}")
            return plant
        except Exception as e:
            logger.error(f"Error adding plant: {e}")
            return None
    
    def create_site(self, site_data):
        """
        Create a new site.
        
        Args:
            site_data (dict): Site data dictionary
            
        Returns:
            Site: The newly created site
        """
        try:
            site = Site.from_dict(site_data)
            logger.info(f"Created site: {site.name}")
            return site
        except Exception as e:
            logger.error(f"Error creating site: {e}")
            return None
    
    def generate_design(self, site, design_parameters=None):
        """
        Generate a landscape design for a site.
        
        Args:
            site (Site): Site object
            design_parameters (dict, optional): Additional design parameters
            
        Returns:
            dict: Generated design
        """
        try:
            if not self.plant_database:
                logger.warning("Plant database is empty. Cannot generate design.")
                return None
            
            design = self.design_algorithm.generate_design(
                site, 
                self.plant_database, 
                design_parameters
            )
            
            # Save the design
            self._save_design(design)
            
            logger.info(f"Generated design for site: {site.name}")
            return design
        except Exception as e:
            logger.error(f"Error generating design: {e}")
            return None
    
    def _save_design(self, design):
        """
        Save a generated design to file.
        
        Args:
            design (dict): Generated design
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            site_name = design["site"]["name"].replace(" ", "_").lower()
            design_file = f"data/designs/design_{site_name}_{timestamp}.json"
            
            with open(design_file, 'w') as f:
                json.dump(design, f, indent=2)
            
            logger.info(f"Saved design to file: {design_file}")
        except Exception as e:
            logger.error(f"Error saving design: {e}")
    
    def load_design(self, design_file):
        """
        Load a design from file.
        
        Args:
            design_file (str): Path to design file
            
        Returns:
            dict: Loaded design
        """
        try:
            with open(design_file, 'r') as f:
                design = json.load(f)
            
            logger.info(f"Loaded design from file: {design_file}")
            return design
        except Exception as e:
            logger.error(f"Error loading design: {e}")
            return None

# Example usage
if __name__ == "__main__":
    # Initialize the tool
    tool = LandscapeDesignTool()
    
    # Create a sample site
    sample_site = {
        "name": "Sample Fayetteville Yard",
        "location": {
            "latitude": config.LOCATION["latitude"],
            "longitude": config.LOCATION["longitude"],
            "elevation": config.LOCATION["elevation"]
        },
        "dimensions": {
            "width": 50,
            "length": 100,
            "area": 5000
        },
        "soil_type": "loam",
        "soil_ph": 6.5,
        "sun_exposure": {
            "full_sun": 3000,
            "part_shade": 1500,
            "full_shade": 500
        },
        "water_conditions": {
            "dry": 2000,
            "medium": 2500,
            "wet": 500
        },
        "hardiness_zone": config.CLIMATE["usda_hardiness_zone"]
    }
    
    site = tool.create_site(sample_site)
    
    # Add sample plants if database is empty
    if not tool.plant_database:
        sample_plants = [
            {
                "scientific_name": "Amsonia hubrichtii",
                "common_name": "Arkansas blue star",
                "plant_type": "Herbaceous perennial",
                "native_range": ["Arkansas", "Oklahoma"],
                "usda_hardiness_zone": "5-9",
                "height_range": (2, 3),
                "spread_range": (2, 3),
                "bloom_time": ["May", "June"],
                "bloom_color": ["Blue"],
                "sun_exposure": ["Full sun", "Part shade"],
                "water_needs": "medium",
                "soil_type": ["Loam", "Sandy"],
                "soil_ph": (5.5, 7.5),
                "maintenance_level": "low",
                "ecological_benefits": ["Attracts pollinators", "Erosion control"],
                "special_features": ["Fall color", "Drought tolerant"],
                "data_source": "Missouri Botanical Garden"
            },
            {
                "scientific_name": "Vernonia arkansana",
                "common_name": "Great ironweed",
                "plant_type": "Herbaceous perennial",
                "native_range": ["Arkansas", "Missouri"],
                "usda_hardiness_zone": "5-8",
                "height_range": (3, 5),
                "spread_range": (2, 3),
                "bloom_time": ["July", "August", "September"],
                "bloom_color": ["Purple"],
                "sun_exposure": ["Full sun"],
                "water_needs": "medium",
                "soil_type": ["Clay", "Loam"],
                "soil_ph": (5.0, 7.0),
                "maintenance_level": "low",
                "ecological_benefits": ["Attracts butterflies", "Attracts birds"],
                "special_features": ["Showy flowers", "Deer resistant"],
                "data_source": "Missouri Botanical Garden"
            }
        ]
        
        for plant_data in sample_plants:
            tool.add_plant(plant_data)
    
    # Generate a design if we have plants
    if tool.plant_database:
        design = tool.generate_design(site)
        if design:
            print(f"Design generated with {len(design['plant_selections'])} plant selections")
            print(f"Native plant percentage: {design['statistics']['native_percentage']:.1f}%")
