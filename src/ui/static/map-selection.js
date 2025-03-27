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
 * Fetch environmental data for the selected location from the server API
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
    
    // Prepare polygon data for the API
    let polygonData = null;
    if (polygon) {
        const latLngs = polygon.getLatLngs()[0];
        const coordinates = latLngs.map(latLng => [latLng.lng, latLng.lat]);
        
        polygonData = {
            type: 'Polygon',
            coordinates: [coordinates],
            area: currentArea
        };
    }
    
    // Call the server API to get environmental data
    fetch('/api/environmental_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            polygon: polygonData
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Display the fetched data
            displayEnvironmentalData(result.data);
        } else {
            console.error('Error fetching environmental data:', result.message);
            // Display error message
            displayErrorMessage('Failed to fetch environmental data. Please try again.');
        }
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Display error message
        displayErrorMessage('An error occurred while fetching environmental data. Please try again.');
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
    });
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
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0">Soil Information</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Soil Type:</strong> ${data.soil_type}</p>
                        <p><strong>Soil pH:</strong> ${data.soil_ph}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">Climate Information</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Hardiness Zone:</strong> ${data.hardiness_zone}</p>
                        <p><strong>Annual Precipitation:</strong> ${data.annual_precipitation} inches</p>
                        <p><strong>Average Temperature:</strong> ${data.avg_temperature}°F</p>
                        <p><strong>Growing Season:</strong> ${data.growing_season_days} days</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-warning">
                        <h6 class="mb-0">Sun Exposure</h6>
                    </div>
                    <div class="card-body">
                        <ul class="list-group">
    `;
    
    // Add sun exposure data
    for (const [type, area] of Object.entries(data.sun_exposure)) {
        const displayType = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const percentage = ((area / currentArea) * 100).toFixed(1);
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${displayType}
                <span>${area.toFixed(2)} sq ft (${percentage}%)</span>
            </li>
        `;
    }
    
    html += `
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-info">
                        <h6 class="mb-0">Water Conditions</h6>
                    </div>
                    <div class="card-body">
                        <ul class="list-group">
    `;
    
    // Add water conditions data
    for (const [type, area] of Object.entries(data.water_conditions)) {
        const displayType = type.charAt(0).toUpperCase() + type.slice(1);
        const percentage = ((area / currentArea) * 100).toFixed(1);
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${displayType}
                <span>${area.toFixed(2)} sq ft (${percentage}%)</span>
            </li>
        `;
    }
    
    html += `
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card mb-3">
                    <div class="card-header bg-secondary text-white">
                        <h6 class="mb-0">Data Sources</h6>
                    </div>
                    <div class="card-body">
                        <ul>
    `;
    
    // Add data sources
    for (const source of data.data_sources) {
        html += `<li>${source}</li>`;
    }
    
    html += `
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-3">
            <button id="useEnvironmentalData" class="btn btn-success btn-lg">Use This Data</button>
        </div>
    `;
    
    // Update the container
    dataContainer.innerHTML = html;
    
    // Add event listener to the new button
    document.getElementById('useEnvironmentalData').addEventListener('click', function() {
        applyEnvironmentalDataToForm();
    });
}

/**
 * Display an error message
 * 
 * @param {string} message - The error message to display
 */
function displayErrorMessage(message) {
    const dataContainer = document.getElementById('environmentalDataContainer');
    if (!dataContainer) return;
    
    dataContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h5>Error</h5>
            <p>${message}</p>
        </div>
        <button id="retryFetch" class="btn btn-primary">Retry</button>
    `;
    
    // Add event listener to retry button
    document.getElementById('retryFetch').addEventListener('click', function() {
        if (currentPolygon) {
            const center = currentPolygon.getBounds().getCenter();
            fetchEnvironmentalData(center.lat, center.lng, currentPolygon);
        }
    });
}

/**
 * Apply the environmental data to the site form
 */
function applyEnvironmentalDataToForm() {
    // Get the environmental data from the display
    const soilTypeText = document.querySelector('#environmentalDataContainer .card:nth-child(1) p:nth-child(1)').textContent;
    const soilPHText = document.querySelector('#environmentalDataContainer .card:nth-child(1) p:nth-child(2)').textContent;
    const hardinessZoneText = document.querySelector('#environmentalDataContainer .card:nth-child(2) p:nth-child(1)').textContent;
    
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
    
    // Get the sun exposure values from the list items
    const sunExposureItems = document.querySelectorAll('#environmentalDataContainer .card:nth-child(3) .list-group-item');
    sunExposureItems.forEach(function(item) {
        const text = item.textContent.trim();
        const type = text.split(/\s+/)[0].toLowerCase() + (text.split(/\s+/)[1] ? '_' + text.split(/\s+/)[1].toLowerCase() : '');
        const areaMatch = text.match(/(\d+\.\d+)\s+sq\s+ft/);
        const area = areaMatch ? parseFloat(areaMatch[1]) : 0;
        
        const field = document.getElementById(type);
        if (field) {
            field.value = area.toFixed(2);
        }
    });
    
    // Get the water condition values from the list items
    const waterConditionItems = document.querySelectorAll('#environmentalDataContainer .card:nth-child(4) .list-group-item');
    waterConditionItems.forEach(function(item) {
        const text = item.textContent.trim();
        const type = text.split(/\s+/)[0].toLowerCase();
        const areaMatch = text.match(/(\d+\.\d+)\s+sq\s+ft/);
        const area = areaMatch ? parseFloat(areaMatch[1]) : 0;
        
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
