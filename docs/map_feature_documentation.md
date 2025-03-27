# Map-Based Location Selection Feature Documentation

## Overview

The map-based location selection feature allows users to visually define their site area by drawing a polygon on an interactive map. The application then automatically retrieves environmental data for the selected location, including soil characteristics, climate information, sun exposure, and water conditions.

## Components

### 1. Map Interface

The map interface is built using Leaflet.js with OpenStreetMap as the base layer. It provides the following functionality:

- **Interactive Map**: Users can pan, zoom, and navigate the map to find their location
- **Search Functionality**: Users can search for addresses or locations using the search box
- **Polygon Drawing**: Users can draw a polygon to define their site area
- **Area Calculation**: The system automatically calculates the area of the drawn polygon
- **Coordinate Tracking**: The system captures the latitude and longitude of the site center

### 2. Environmental Data Service

The environmental data service integrates with various authoritative data sources to retrieve accurate information about the selected location:

- **USDA NRCS Soil Survey**: Provides soil type, pH, and other soil characteristics
- **NOAA Climate Data**: Provides precipitation, temperature, and growing season information
- **USDA Hardiness Zone Map**: Determines the plant hardiness zone for the location
- **Topographical Analysis**: Estimates sun exposure and water conditions based on location and terrain

### 3. User Interface Integration

The environmental data is presented to the user in a structured, easy-to-understand format:

- **Soil Information Card**: Displays soil type and pH
- **Climate Information Card**: Shows hardiness zone, annual precipitation, average temperature, and growing season
- **Sun Exposure Card**: Lists the estimated square footage and percentage of different sun exposure types
- **Water Conditions Card**: Lists the estimated square footage and percentage of different water condition types
- **Data Sources Section**: Provides information about the data sources used

## How to Use

1. **Navigate to the Site Creation Page**:
   - Click on "Create Site" from the home page

2. **Find Your Location**:
   - Use the map controls to pan and zoom
   - Use the search box to find a specific address or location

3. **Draw Your Site Boundary**:
   - Click the polygon drawing tool in the top-left corner of the map
   - Click on the map to place points defining your site boundary
   - Complete the polygon by clicking on the first point

4. **Review Environmental Data**:
   - After drawing the polygon, the system will automatically retrieve environmental data
   - Review the information in the cards below the map

5. **Apply Data to Form**:
   - Click "Use This Data" to automatically fill the site creation form with the retrieved data
   - The form will be populated with soil type, pH, hardiness zone, sun exposure, and water conditions

6. **Complete the Form**:
   - Add any additional information required
   - Click "Create Site" to save your site

## Technical Implementation

### Map Implementation

The map functionality is implemented using:
- **Leaflet.js**: A leading open-source JavaScript library for interactive maps
- **Leaflet.Draw**: A plugin for creating and editing vector layers
- **Leaflet.Control.Geocoder**: A plugin for address search functionality
- **Leaflet.GeometryUtil**: A utility library for geometric calculations

### Environmental Data Retrieval

The environmental data is retrieved through:
- **Flask API Endpoint**: `/api/environmental_data` processes requests for environmental data
- **EnvironmentalDataService**: A Python service that aggregates data from multiple sources
- **Data Caching**: Responses are cached to improve performance and reduce API calls

### Data Sources Integration

The system integrates with external data sources through:
- **USDA NRCS Soil Data Access API**: For soil information
- **NOAA Climate Data Online API**: For climate information
- **Algorithmic Estimation**: For sun exposure and water conditions based on location and topography

## Error Handling

The system includes robust error handling:
- **API Error Detection**: Catches and processes errors from external data sources
- **Fallback Mechanisms**: Uses default values when specific data cannot be retrieved
- **User Feedback**: Displays error messages and provides retry options
- **Data Validation**: Ensures retrieved data is in the expected format before display

## Future Enhancements

Potential future enhancements to the map-based location selection feature:
1. **Satellite Imagery**: Add option to view satellite imagery for better site visualization
2. **Elevation Data**: Incorporate elevation data for more accurate topographical analysis
3. **Historical Weather Data**: Include historical weather patterns for better climate understanding
4. **Real-time Soil Moisture**: Integrate with soil moisture sensors or recent precipitation data
5. **Tree Cover Analysis**: Use satellite imagery to estimate existing tree cover and shade patterns
6. **Microclimate Detection**: Identify potential microclimates within the site boundary
7. **Water Flow Modeling**: Model water flow across the site based on topography
