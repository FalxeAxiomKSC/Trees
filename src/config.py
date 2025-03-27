# Configuration Settings for Native Landscape Design Tool

# Location Settings
LOCATION = {
    "city": "Fayetteville",
    "state": "AR",
    "zip_code": "72704",
    "country": "USA",
    "latitude": 36.0764,
    "longitude": -94.2088,
    "elevation": 427  # meters above sea level
}

# Climate Settings
CLIMATE = {
    "usda_hardiness_zone": "7a",  # USDA Plant Hardiness Zone
    "avg_annual_rainfall": 1163,  # mm per year
    "avg_annual_temperature": 15.3,  # Celsius
    "frost_free_days": 210,  # average days per year
    "first_frost_date": "November 1",  # average date
    "last_frost_date": "April 5"  # average date
}

# Data Source URLs
DATA_SOURCES = {
    "noaa_climate": "https://www.ncei.noaa.gov/cdo-web/",
    "usda_nrcs_soil": "https://websoilsurvey.nrcs.usda.gov/",
    "usda_plants": "https://plants.usda.gov/",
    "missouri_botanical": "https://www.missouribotanicalgarden.org/plantfinder/plantfindersearch.aspx",
    "fayetteville_drainage": "https://www.fayetteville-ar.gov/DocumentCenter/View/20481/Drainage-Criteria-Manual-PDF"
}

# Application Settings
APP_SETTINGS = {
    "debug_mode": True,
    "log_level": "INFO",
    "data_cache_days": 30,  # days to cache external data
    "max_plants_per_design": 100,
    "default_plot_size": {
        "width": 30,  # meters
        "length": 30  # meters
    }
}

# Algorithm Weights
# These weights determine how different factors influence plant selection
ALGORITHM_WEIGHTS = {
    "water_needs": 0.25,
    "soil_compatibility": 0.25,
    "sun_requirements": 0.20,
    "native_preference": 0.15,
    "maintenance_level": 0.10,
    "aesthetic_value": 0.05
}

# Environmental Factor Ranges
ENVIRONMENTAL_FACTORS = {
    "soil_ph": {
        "min": 5.0,
        "max": 7.5,
        "default": 6.2
    },
    "soil_types": [
        "clay",
        "loam",
        "sandy",
        "silty",
        "chalky"
    ],
    "sun_exposure": [
        "full_sun",
        "part_sun",
        "part_shade",
        "full_shade"
    ],
    "moisture_levels": [
        "dry",
        "medium_dry",
        "medium",
        "medium_wet",
        "wet"
    ]
}
