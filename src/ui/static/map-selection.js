/**
 * Map Selection Module for Native Landscape Design Tool
 * 
 * This module provides functionality for selecting a location and drawing a polygon
 * to define a site area using Leaflet.js and OpenStreetMap.
 */

// Initialize map variables
let map;
let drawnItems;
let drawControl;
let currentPolygon = null;
let currentArea = 0;

// Initialize the map when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

/**
 * Initialize the Leaflet map with OpenStreetMap tiles
 */
function initializeMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Initialize the map centered on Fayetteville, AR
    map = L.map('map').setView([36.0764, -94.2088], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize the FeatureGroup to store editable layers
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Initialize the draw control and pass it the FeatureGroup of editable layers
    drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            poly: {
                allowIntersection: false
            }
        },
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: {
                    color: '#28a745'
                }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    map.addControl(drawControl);
    
    // Add a scale control to the map
    L.control.scale().addTo(map);
    
    // Add a search control
    const searchControl = L.Control.geocoder({
        defaultMarkGeocode: false
    }).addTo(map);
    
    // Handle search results
    searchControl.on('markgeocode', function(e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]);
        map.fitBounds(poly.getBounds());
    });
}

/**
 * Set up event listeners for map interactions
 */
function setupEventListeners() {
    if (!map) return;
    
    // Event listener for when a new polygon is created
    map.on('draw:created', function(e) {
        const type = e.layerType;
        const layer = e.layer;
        
        if (type === 'polygon') {
            // Clear any existing polygons
            drawnItems.clearLayers();
            
            // Add the new polygon to the feature group
            drawnItems.addLayer(layer);
            
            // Store the current polygon for later use
            currentPolygon = layer;
            
            // Calculate the area in square feet
            const areaInSquareMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            currentArea = areaInSquareMeters * 10.7639; // Convert to square feet
            
            // Update the area display
            updateAreaDisplay(currentArea);
            
            // Get the center of the polygon
            const center = layer.getBounds().getCenter();
            
            // Update the latitude and longitude fields
            document.getElementById('latitude').value = center.lat.toFixed(6);
            document.getElementById('longitude').value = center.lng.toFixed(6);
            
            // Show the environmental data section
            document.getElementById('mapDataDisplay').classList.add('active');
            
            // Trigger the fetch of environmental data
            fetchEnvironmentalData(center.lat, center.lng, currentPolygon);
        }
    });
    
    // Event listener for when a polygon is edited
    map.on('draw:edited', function(e) {
        const layers = e.layers;
        
        layers.eachLayer(function(layer) {
            if (layer instanceof L.Polygon) {
                // Update the current polygon
                currentPolygon = layer;
                
                // Recalculate the area
                const areaInSquareMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                currentArea = areaInSquareMeters * 10.7639; // Convert to square feet
                
                // Update the area display
                updateAreaDisplay(currentArea);
                
                // Get the center of the polygon
                const center = layer.getBounds().getCenter();
                
                // Update the latitude and longitude fields
                document.getElementById('latitude').value = center.lat.toFixed(6);
                document.getElementById('longitude').value = center.lng.toFixed(6);
                
                // Trigger the fetch of environmental data
                fetchEnvironmentalData(center.lat, center.lng, currentPolygon);
            }
        });
    });
    
    // Event listener for when a polygon is deleted
    map.on('draw:deleted', function(e) {
        currentPolygon = null;
        currentArea = 0;
        
        // Update the area display
        updateAreaDisplay(0);
        
        // Hide the environmental data section
        document.getElementById('mapDataDisplay').classList.remove('active');
        
        // Clear the latitude and longitude fields
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
    });
    
    // Event listener for the reset button
    const resetButton = document.getElementById('resetMap');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Clear all layers
            drawnItems.clearLayers();
            
            // Reset variables
            currentPolygon = null;
            currentArea = 0;
            
            // Update the area display
            updateAreaDisplay(0);
            
            // Hide the environmental data section
            document.getElementById('mapDataDisplay').classList.remove('active');
            
            // Clear the latitude and longitude fields
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            
            // Reset the site form fields
            resetSiteFormFields();
        });
    }
    
    // Event listener for the use data button
    const useDataButton = document.getElementById('useEnvironmentalData');
    if (useDataButton) {
        useDataButton.addEventListener('click', function() {
            // Apply the environmental data to the form
            applyEnvironmentalDataToForm();
        });
    }
}

/**
 * Update the area display with the calculated area
 * 
 * @param {number} area - The area in square feet
 */
function updateAreaDisplay(area) {
    const areaDisplay = document.getElementById('areaDisplay');
    if (areaDisplay) {
        areaDisplay.textContent = area.toFixed(2);
    }
    
    // Also update the area field in the form
    const areaField = document.getElementById('area');
    if (areaField) {
        areaField.value = area.toFixed(2);
    }
    
    // Update the width and length fields with estimated dimensions
    // Assuming a rectangular shape for simplicity
    const width = Math.sqrt(area);
    const length = Math.sqrt(area);
    
    const widthField = document.getElementById('width');
    const lengthField = document.getElementById('length');
    
    if (widthField && lengthField) {
        widthField.value = width.toFixed(2);
        lengthField.value = length.toFixed(2);
    }
}

/**
 * Fetch environmental data for the selected location
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {L.Polygon} polygon - The drawn polygon
 */
function fetchEnvironmentalData(lat, lng, polygon) {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
    }
    
    // In a real implementation, this would make API calls to various environmental data sources
    // For this demo, we'll simulate the data fetch with a timeout
    setTimeout(function() {
        // Simulate fetched data
        const environmentalData = {
            soil_type: getRandomSoilType(),
            soil_ph: getRandomSoilPH(),
            hardiness_zone: "7a",
            sun_exposure: estimateSunExposure(polygon),
            water_conditions: estimateWaterConditions(polygon)
        };
        
        // Display the fetched data
        displayEnvironmentalData(environmentalData);
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
    }, 1500);
}

/**
 * Display the fetched environmental data
 * 
 * @param {Object} data - The environmental data
 */
function displayEnvironmentalData(data) {
    const dataContainer = document.getElementById('environmentalDataContainer');
    if (!dataContainer) return;
    
    // Create HTML for the data display
    let html = `
        <h5>Environmental Data</h5>
        <p><strong>Soil Type:</strong> ${data.soil_type}</p>
        <p><strong>Soil pH:</strong> ${data.soil_ph}</p>
        <p><strong>Hardiness Zone:</strong> ${data.hardiness_zone}</p>
        <h6>Estimated Sun Exposure:</h6>
        <ul>
    `;
    
    // Add sun exposure data
    for (const [type, area] of Object.entries(data.sun_exposure)) {
        html += `<li>${type}: ${area.toFixed(2)} sq ft (${((area / currentArea) * 100).toFixed(1)}%)</li>`;
    }
    
    html += `</ul><h6>Estimated Water Conditions:</h6><ul>`;
    
    // Add water conditions data
    for (const [type, area] of Object.entries(data.water_conditions)) {
        html += `<li>${type}: ${area.toFixed(2)} sq ft (${((area / currentArea) * 100).toFixed(1)}%)</li>`;
    }
    
    html += `
        </ul>
        <button id="useEnvironmentalData" class="btn btn-success">Use This Data</button>
    `;
    
    // Update the container
    dataContainer.innerHTML = html;
    
    // Add event listener to the new button
    document.getElementById('useEnvironmentalData').addEventListener('click', function() {
        applyEnvironmentalDataToForm();
    });
}

/**
 * Apply the environmental data to the site form
 */
function applyEnvironmentalDataToForm() {
    // Get the environmental data from the display
    const soilTypeText = document.querySelector('#environmentalDataContainer p:nth-child(2)').textContent;
    const soilPHText = document.querySelector('#environmentalDataContainer p:nth-child(3)').textContent;
    const hardinessZoneText = document.querySelector('#environmentalDataContainer p:nth-child(4)').textContent;
    
    // Extract the values
    const soilType = soilTypeText.split(':')[1].trim().toLowerCase();
    const soilPH = parseFloat(soilPHText.split(':')[1].trim());
    const hardinessZone = hardinessZoneText.split(':')[1].trim();
    
    // Set the form field values
    const soilTypeField = document.getElementById('soilType');
    const soilPHField = document.getElementById('soilPh');
    const hardinessField = document.getElementById('hardiness');
    
    if (soilTypeField) {
        // Find the closest match in the dropdown
        for (const option of soilTypeField.options) {
            if (option.value.toLowerCase() === soilType) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (soilPHField) {
        soilPHField.value = soilPH;
    }
    
    if (hardinessField) {
        // Find the closest match in the dropdown
        for (const option of hardinessField.options) {
            if (option.value === hardinessZone) {
                option.selected = true;
                break;
            }
        }
    }
    
    // Set the sun exposure values
    const sunExposureItems = document.querySelectorAll('#environmentalDataContainer ul:first-of-type li');
    sunExposureItems.forEach(function(item) {
        const text = item.textContent;
        const type = text.split(':')[0].trim().toLowerCase().replace(' ', '_');
        const area = parseFloat(text.split(':')[1].trim().split(' ')[0]);
        
        const field = document.getElementById(type);
        if (field) {
            field.value = area.toFixed(2);
        }
    });
    
    // Set the water condition values
    const waterConditionItems = document.querySelectorAll('#environmentalDataContainer ul:last-of-type li');
    waterConditionItems.forEach(function(item) {
        const text = item.textContent;
        const type = text.split(':')[0].trim().toLowerCase();
        const area = parseFloat(text.split(':')[1].trim().split(' ')[0]);
        
        const field = document.getElementById(type);
        if (field) {
            field.value = area.toFixed(2);
        }
    });
    
    // Update progress bars
    if (typeof updateProgressBars === 'function') {
        updateProgressBars();
    }
    
    // Scroll to the form
    document.getElementById('siteForm').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset all site form fields
 */
function resetSiteFormFields() {
    const form = document.getElementById('siteForm');
    if (!form) return;
    
    // Reset all input fields
    const inputs = form.querySelectorAll('input');
    inputs.forEach(function(input) {
        if (input.type === 'text' || input.type === 'number') {
            input.value = '';
        }
    });
    
    // Reset all select fields
    const selects = form.querySelectorAll('select');
    selects.forEach(function(select) {
        select.selectedIndex = 0;
    });
    
    // Reset all textarea fields
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(function(textarea) {
        textarea.value = '';
    });
    
    // Update progress bars
    if (typeof updateProgressBars === 'function') {
        updateProgressBars();
    }
}

/**
 * Get a random soil type for demo purposes
 * 
 * @returns {string} A random soil type
 */
function getRandomSoilType() {
    const soilTypes = ['Clay', 'Loam', 'Sandy', 'Silty', 'Chalky'];
    return soilTypes[Math.floor(Math.random() * soilTypes.length)];
}

/**
 * Get a random soil pH for demo purposes
 * 
 * @returns {number} A random soil pH between 5.0 and 7.5
 */
function getRandomSoilPH() {
    return (Math.random() * 2.5 + 5.0).toFixed(1);
}

/**
 * Estimate sun exposure based on the polygon
 * 
 * @param {L.Polygon} polygon - The drawn polygon
 * @returns {Object} Estimated sun exposure areas
 */
function estimateSunExposure(polygon) {
    // In a real implementation, this would use topographical data, tree cover, etc.
    // For this demo, we'll create a random distribution
    const totalArea = currentArea;
    
    // Create random percentages that sum to 100%
    const fullSunPercent = Math.random() * 0.6 + 0.2; // 20-80%
    const partSunPercent = Math.random() * 0.3 + 0.1; // 10-40%
    const partShadePercent = Math.random() * 0.2 + 0.05; // 5-25%
    const fullShadePercent = 1 - fullSunPercent - partSunPercent - partShadePercent;
    
    return {
        'full_sun': totalArea * fullSunPercent,
        'part_sun': totalArea * partSunPercent,
        'part_shade': totalArea * partShadePercent,
        'full_shade': totalArea * fullShadePercent
    };
}

/**
 * Estimate water conditions based on the polygon
 * 
 * @param {L.Polygon} polygon - The drawn polygon
 * @returns {Object} Estimated water condition areas
 */
function estimateWaterConditions(polygon) {
    // In a real implementation, this would use topographical data, rainfall data, etc.
    // For this demo, we'll create a random distribution
    const totalArea = currentArea;
    
    // Create random percentages that sum to 100%
    const dryPercent = Math.random() * 0.4 + 0.1; // 10-50%
    const mediumPercent = Math.random() * 0.5 + 0.3; // 30-80%
    const wetPercent = 1 - dryPercent - mediumPercent;
    
    return {
        'dry': totalArea * dryPercent,
        'medium': totalArea * mediumPercent,
        'wet': totalArea * wetPercent
    };
}
