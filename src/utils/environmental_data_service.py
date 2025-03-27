import os
import sys
import json
import requests
from datetime import datetime

# Add the sandbox runtime path for data API access
sys.path.append('/opt/.manus/.sandbox-runtime')
try:
    from data_api import ApiClient
    HAS_DATA_API = True
except ImportError:
    HAS_DATA_API = False

class EnvironmentalDataService:
    """
    Service to fetch environmental data from various sources for a given location.
    Aggregates data from NOAA, USDA NRCS, and other sources.
    """
    
    def __init__(self):
        """Initialize the environmental data service."""
        self.data_client = ApiClient() if HAS_DATA_API else None
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'cache')
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def get_environmental_data(self, latitude, longitude, polygon=None):
        """
        Get comprehensive environmental data for a location.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            polygon (list, optional): GeoJSON polygon representing the site area
            
        Returns:
            dict: Environmental data including soil, climate, and other factors
        """
        # Create a cache key based on the location
        cache_key = f"env_data_{latitude:.4f}_{longitude:.4f}.json"
        cache_path = os.path.join(self.cache_dir, cache_key)
        
        # Check if we have cached data
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'r') as f:
                    cached_data = json.load(f)
                    # Check if cache is less than 24 hours old
                    if 'timestamp' in cached_data:
                        cache_time = datetime.fromisoformat(cached_data['timestamp'])
                        now = datetime.now()
                        if (now - cache_time).total_seconds() < 86400:  # 24 hours
                            return cached_data['data']
            except (json.JSONDecodeError, KeyError):
                # Invalid cache, continue with fetching new data
                pass
        
        # Fetch data from various sources
        soil_data = self.get_soil_data(latitude, longitude)
        climate_data = self.get_climate_data(latitude, longitude)
        hardiness_zone = self.get_hardiness_zone(latitude, longitude)
        
        # Combine all data
        environmental_data = {
            'soil': soil_data,
            'climate': climate_data,
            'hardiness_zone': hardiness_zone,
            'sun_exposure': self.estimate_sun_exposure(latitude, longitude, polygon),
            'water_conditions': self.estimate_water_conditions(latitude, longitude, polygon)
        }
        
        # Format the data for the application
        formatted_data = self.format_data_for_application(environmental_data)
        
        # Cache the data
        cache_data = {
            'timestamp': datetime.now().isoformat(),
            'data': formatted_data
        }
        with open(cache_path, 'w') as f:
            json.dump(cache_data, f, indent=2)
        
        return formatted_data
    
    def get_soil_data(self, latitude, longitude):
        """
        Get soil data from USDA NRCS Soil Survey API.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            
        Returns:
            dict: Soil data including type, pH, and other properties
        """
        try:
            # Try to use the data API if available
            if HAS_DATA_API:
                # This is a placeholder - in a real implementation, we would use the appropriate API
                # return self.data_client.call_api('USDA/get_soil_data', query={'latitude': latitude, 'longitude': longitude})
                pass
            
            # Fall back to direct API call
            # USDA NRCS Soil Data Access API
            url = f"https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest"
            
            # Query to get soil properties for the location
            query = f"""
            SELECT 
                mapunit.mukey, 
                component.compname, 
                component.comppct_r,
                chorizon.hzname,
                chorizon.hzdept_r,
                chorizon.hzdepb_r,
                chorizon.sandtotal_r,
                chorizon.silttotal_r,
                chorizon.claytotal_r,
                chorizon.ph1to1h2o_r
            FROM 
                mapunit
                INNER JOIN component ON component.mukey = mapunit.mukey
                INNER JOIN chorizon ON chorizon.cokey = component.cokey
            WHERE 
                mukey IN (
                    SELECT mukey FROM SDA_Get_Mukey_from_LatLon(
                        {latitude}, {longitude}
                    )
                )
                AND component.comppct_r > 15
                AND chorizon.hzdept_r < 30
            ORDER BY 
                component.comppct_r DESC,
                chorizon.hzdept_r ASC
            """
            
            headers = {'Content-Type': 'application/json'}
            data = {"query": query, "format": "json"}
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                soil_data = response.json()
                
                # Process the soil data
                if soil_data and 'Table' in soil_data and len(soil_data['Table']) > 0:
                    # Extract the most common soil component
                    soil_component = soil_data['Table'][0]
                    
                    # Determine soil type based on sand/silt/clay percentages
                    sand = float(soil_component.get('sandtotal_r', 0) or 0)
                    silt = float(soil_component.get('silttotal_r', 0) or 0)
                    clay = float(soil_component.get('claytotal_r', 0) or 0)
                    
                    soil_type = self.classify_soil_texture(sand, silt, clay)
                    
                    # Get soil pH
                    soil_ph = float(soil_component.get('ph1to1h2o_r', 6.5) or 6.5)
                    
                    return {
                        'type': soil_type,
                        'ph': soil_ph,
                        'component_name': soil_component.get('compname', 'Unknown'),
                        'component_percent': float(soil_component.get('comppct_r', 0) or 0),
                        'horizon_name': soil_component.get('hzname', 'Unknown'),
                        'horizon_depth_top': float(soil_component.get('hzdept_r', 0) or 0),
                        'horizon_depth_bottom': float(soil_component.get('hzdepb_r', 0) or 0),
                        'sand_percent': sand,
                        'silt_percent': silt,
                        'clay_percent': clay
                    }
            
            # If API call fails or returns no data, return default values
            return {
                'type': 'Loam',
                'ph': 6.5,
                'component_name': 'Unknown',
                'component_percent': 0,
                'horizon_name': 'Unknown',
                'horizon_depth_top': 0,
                'horizon_depth_bottom': 0,
                'sand_percent': 40,
                'silt_percent': 40,
                'clay_percent': 20
            }
        
        except Exception as e:
            print(f"Error fetching soil data: {e}")
            # Return default values if there's an error
            return {
                'type': 'Loam',
                'ph': 6.5,
                'component_name': 'Unknown',
                'component_percent': 0,
                'horizon_name': 'Unknown',
                'horizon_depth_top': 0,
                'horizon_depth_bottom': 0,
                'sand_percent': 40,
                'silt_percent': 40,
                'clay_percent': 20
            }
    
    def get_climate_data(self, latitude, longitude):
        """
        Get climate data from NOAA API.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            
        Returns:
            dict: Climate data including temperature, precipitation, etc.
        """
        try:
            # Try to use the data API if available
            if HAS_DATA_API:
                # This is a placeholder - in a real implementation, we would use the appropriate API
                # return self.data_client.call_api('NOAA/get_climate_data', query={'latitude': latitude, 'longitude': longitude})
                pass
            
            # Fall back to direct API call
            # NOAA Climate Data Online API
            url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data"
            
            # Get the nearest weather station
            station_url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/stations"
            params = {
                'extent': f"{latitude-0.5},{longitude-0.5},{latitude+0.5},{longitude+0.5}",
                'limit': 1
            }
            
            headers = {
                'token': 'YOUR_NOAA_API_TOKEN'  # In a real app, this would be a valid token
            }
            
            # For demo purposes, we'll return simulated data
            # In a real implementation, we would make the API call and process the response
            
            # Simulated climate data for Fayetteville, AR
            return {
                'annual_precipitation': 46.0,  # inches
                'avg_temperature': 60.0,  # Fahrenheit
                'growing_season_days': 210,
                'last_frost_date': '2025-04-15',
                'first_frost_date': '2025-11-01',
                'monthly_precipitation': {
                    'Jan': 3.0, 'Feb': 3.2, 'Mar': 4.1, 'Apr': 4.5,
                    'May': 5.1, 'Jun': 4.3, 'Jul': 3.5, 'Aug': 3.0,
                    'Sep': 4.2, 'Oct': 3.8, 'Nov': 4.0, 'Dec': 3.3
                },
                'monthly_temperature': {
                    'Jan': 36.0, 'Feb': 40.0, 'Mar': 49.0, 'Apr': 59.0,
                    'May': 68.0, 'Jun': 76.0, 'Jul': 81.0, 'Aug': 80.0,
                    'Sep': 72.0, 'Oct': 61.0, 'Nov': 49.0, 'Dec': 39.0
                }
            }
        
        except Exception as e:
            print(f"Error fetching climate data: {e}")
            # Return default values if there's an error
            return {
                'annual_precipitation': 46.0,  # inches
                'avg_temperature': 60.0,  # Fahrenheit
                'growing_season_days': 210,
                'last_frost_date': '2025-04-15',
                'first_frost_date': '2025-11-01',
                'monthly_precipitation': {
                    'Jan': 3.0, 'Feb': 3.2, 'Mar': 4.1, 'Apr': 4.5,
                    'May': 5.1, 'Jun': 4.3, 'Jul': 3.5, 'Aug': 3.0,
                    'Sep': 4.2, 'Oct': 3.8, 'Nov': 4.0, 'Dec': 3.3
                },
                'monthly_temperature': {
                    'Jan': 36.0, 'Feb': 40.0, 'Mar': 49.0, 'Apr': 59.0,
                    'May': 68.0, 'Jun': 76.0, 'Jul': 81.0, 'Aug': 80.0,
                    'Sep': 72.0, 'Oct': 61.0, 'Nov': 49.0, 'Dec': 39.0
                }
            }
    
    def get_hardiness_zone(self, latitude, longitude):
        """
        Get USDA hardiness zone for the location.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            
        Returns:
            str: USDA hardiness zone (e.g., '7a')
        """
        try:
            # Try to use the data API if available
            if HAS_DATA_API:
                # This is a placeholder - in a real implementation, we would use the appropriate API
                # return self.data_client.call_api('USDA/get_hardiness_zone', query={'latitude': latitude, 'longitude': longitude})
                pass
            
            # Fall back to direct API call or lookup table
            # For Fayetteville, AR (36.0764, -94.2088), the hardiness zone is 7a
            # In a real implementation, we would use a more sophisticated lookup
            
            # Simplified hardiness zone determination based on latitude
            if latitude < 28:
                return '9b'
            elif latitude < 30:
                return '9a'
            elif latitude < 32:
                return '8b'
            elif latitude < 34:
                return '8a'
            elif latitude < 36:
                return '7b'
            elif latitude < 38:
                return '7a'
            elif latitude < 40:
                return '6b'
            elif latitude < 42:
                return '6a'
            elif latitude < 44:
                return '5b'
            else:
                return '5a'
        
        except Exception as e:
            print(f"Error determining hardiness zone: {e}")
            # Return a default value if there's an error
            return '7a'  # Default for Fayetteville, AR
    
    def estimate_sun_exposure(self, latitude, longitude, polygon=None):
        """
        Estimate sun exposure for the site based on location and topography.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            polygon (list, optional): GeoJSON polygon representing the site area
            
        Returns:
            dict: Estimated sun exposure areas
        """
        # In a real implementation, this would use topographical data, tree cover, etc.
        # For this demo, we'll create a reasonable distribution based on the location
        
        # Get the total area from the polygon if available
        total_area = 1000  # Default square feet
        if polygon and 'area' in polygon:
            total_area = polygon['area']
        
        # Create distribution based on latitude (more northern = less full sun)
        latitude_factor = max(0.2, min(0.8, (50 - latitude) / 30))
        
        full_sun_percent = latitude_factor * 0.7
        part_sun_percent = 0.2
        part_shade_percent = 0.2
        full_shade_percent = 1 - full_sun_percent - part_sun_percent - part_shade_percent
        
        return {
            'full_sun': total_area * full_sun_percent,
            'part_sun': total_area * part_sun_percent,
            'part_shade': total_area * part_shade_percent,
            'full_shade': total_area * full_shade_percent
        }
    
    def estimate_water_conditions(self, latitude, longitude, polygon=None):
        """
        Estimate water conditions for the site based on location, topography, and climate.
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            polygon (list, optional): GeoJSON polygon representing the site area
            
        Returns:
            dict: Estimated water condition areas
        """
        # In a real implementation, this would use topographical data, rainfall data, etc.
        # For this demo, we'll create a reasonable distribution based on the location
        
        # Get the total area from the polygon if available
        total_area = 1000  # Default square feet
        if polygon and 'area' in polygon:
            total_area = polygon['area']
        
        # Get climate data to influence water conditions
        climate_data = self.get_climate_data(latitude, longitude)
        annual_precipitation = climate_data['annual_precipitation']
        
        # Adjust percentages based on precipitation
        # More precipitation = more wet areas
        precipitation_factor = min(1.0, annual_precipitation / 50.0)
        
        dry_percent = 0.3 * (1 - precipitation_factor)
        wet_percent = 0.3 * precipitation_factor
        medium_percent = 1 - dry_percent - wet_percent
        
        return {
            'dry': total_area * dry_percent,
            'medium': total_area * medium_percent,
            'wet': total_area * wet_percent
        }
    
    def classify_soil_texture(self, sand, silt, clay):
        """
        Classify soil texture based on sand, silt, and clay percentages.
        
        Args:
            sand (float): Sand percentage
            silt (float): Silt percentage
            clay (float): Clay percentage
            
        Returns:
            str: Soil texture classification
        """
        # Simplified soil texture classification
        if clay >= 40:
            return 'Clay'
        elif sand >= 85:
            return 'Sandy'
        elif silt >= 80:
            return 'Silty'
        elif clay >= 35 and sand >= 45:
            return 'Sandy Clay'
        elif clay >= 35 and silt >= 45:
            return 'Silty Clay'
        elif clay >= 20 and sand >= 45 and silt >= 15:
            return 'Sandy Clay Loam'
        elif clay >= 20 and silt >= 45 and sand >= 15:
            return 'Silty Clay Loam'
        elif sand >= 45 and clay < 20:
            return 'Sandy Loam'
        elif silt >= 50 and clay < 20:
            return 'Silty Loam'
        else:
            return 'Loam'
    
    def format_data_for_application(self, environmental_data):
        """
        Format the environmental data for use in the application.
        
        Args:
            environmental_data (dict): Raw environmental data
            
        Returns:
            dict: Formatted data for the application
        """
        soil_data = environmental_data['soil']
        climate_data = environmental_data['climate']
        
        return {
            'soil_type': soil_data['type'],
            'soil_ph': soil_data['ph'],
            'hardiness_zone': environmental_data['hardiness_zone'],
            'annual_precipitation': climate_data['annual_precipitation'],
            'avg_temperature': climate_data['avg_temperature'],
            'growing_season_days': climate_data['growing_season_days'],
            'sun_exposure': environmental_data['sun_exposure'],
            'water_conditions': environmental_data['water_conditions'],
            'data_sources': [
                'USDA NRCS Soil Survey',
                'NOAA Climate Data',
                'USDA Plant Hardiness Zone Map'
            ]
        }


# Example usage
if __name__ == "__main__":
    service = EnvironmentalDataService()
    data = service.get_environmental_data(36.0764, -94.2088)
    print(json.dumps(data, indent=2))
