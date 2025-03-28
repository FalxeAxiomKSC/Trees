/**
 * Interactive Plant Placement System
 * 
 * This module provides functionality for placing plants in a landscape design
 * with intelligent shifting, fixed plants, environmental compatibility checking,
 * and companion plant recommendations.
 */

class PlantPlacementSystem {
  constructor(canvasId, environmentalData) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.environmentalData = environmentalData;
    this.plants = [];
    this.fixedPlants = new Set();
    this.selectedPlant = null;
    this.draggedPlant = null;
    this.recommendedPlants = [];
    this.environmentalErrors = [];
    
    // Plant images cache
    this.plantImages = {};
    
    // Initialize the canvas
    this.resizeCanvas();
    this.setupEventListeners();
    
    // Grid settings
    this.gridSize = 20;
    this.showGrid = true;
  }
  
  /**
   * Resize the canvas to fit its container
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.render();
  }
  
  /**
   * Set up event listeners for user interactions
   */
  setupEventListeners() {
    // Mouse down event for selecting plants
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if a plant was clicked
      const clickedPlant = this.getPlantAt(x, y);
      
      if (clickedPlant) {
        this.selectedPlant = clickedPlant;
        this.draggedPlant = clickedPlant;
        this.dragOffsetX = x - clickedPlant.x;
        this.dragOffsetY = y - clickedPlant.y;
        
        // Bring the selected plant to the front
        const index = this.plants.indexOf(clickedPlant);
        if (index !== -1) {
          this.plants.splice(index, 1);
          this.plants.push(clickedPlant);
        }
        
        this.render();
      }
    });
    
    // Mouse move event for dragging plants
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.draggedPlant) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update the plant position
        this.draggedPlant.x = x - this.dragOffsetX;
        this.draggedPlant.y = y - this.dragOffsetY;
        
        // Snap to grid if enabled
        if (this.showGrid) {
          this.draggedPlant.x = Math.round(this.draggedPlant.x / this.gridSize) * this.gridSize;
          this.draggedPlant.y = Math.round(this.draggedPlant.y / this.gridSize) * this.gridSize;
        }
        
        // Check for environmental compatibility
        this.checkEnvironmentalCompatibility();
        
        // Shift other plants if needed
        if (!this.environmentalErrors.length) {
          this.shiftOtherPlants();
        }
        
        // Update companion plant recommendations
        this.updateCompanionRecommendations();
        
        this.render();
      }
    });
    
    // Mouse up event for releasing plants
    this.canvas.addEventListener('mouseup', () => {
      if (this.draggedPlant) {
        // Finalize the plant position
        this.finalizePosition(this.draggedPlant);
        
        this.draggedPlant = null;
        this.render();
      }
    });
    
    // Double click event for toggling fixed status
    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedPlant = this.getPlantAt(x, y);
      
      if (clickedPlant) {
        this.toggleFixedStatus(clickedPlant);
        this.render();
      }
    });
    
    // Resize event for the window
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }
  
  /**
   * Add a plant to the design
   * 
   * @param {Object} plant - The plant to add
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {boolean} fixed - Whether the plant is fixed
   * @returns {Object} The added plant
   */
  addPlant(plant, x, y, fixed = false) {
    const newPlant = {
      id: Date.now().toString(),
      name: plant.name,
      species: plant.species,
      type: plant.type,
      size: plant.size || 30,
      x: x,
      y: y,
      color: plant.color || this.getPlantTypeColor(plant.type),
      environmentalRequirements: plant.environmentalRequirements,
      companionPlants: plant.companionPlants || []
    };
    
    this.plants.push(newPlant);
    
    if (fixed) {
      this.fixedPlants.add(newPlant.id);
    }
    
    // Load the plant image if available
    if (plant.image) {
      this.loadPlantImage(newPlant.id, plant.image);
    }
    
    // Check for environmental compatibility
    this.checkEnvironmentalCompatibility();
    
    // Update companion plant recommendations
    this.updateCompanionRecommendations();
    
    this.render();
    
    return newPlant;
  }
  
  /**
   * Remove a plant from the design
   * 
   * @param {string} plantId - The ID of the plant to remove
   */
  removePlant(plantId) {
    const index = this.plants.findIndex(p => p.id === plantId);
    
    if (index !== -1) {
      this.plants.splice(index, 1);
      this.fixedPlants.delete(plantId);
      
      // Check for environmental compatibility
      this.checkEnvironmentalCompatibility();
      
      // Update companion plant recommendations
      this.updateCompanionRecommendations();
      
      this.render();
    }
  }
  
  /**
   * Toggle the fixed status of a plant
   * 
   * @param {Object} plant - The plant to toggle
   */
  toggleFixedStatus(plant) {
    if (this.fixedPlants.has(plant.id)) {
      this.fixedPlants.delete(plant.id);
    } else {
      this.fixedPlants.add(plant.id);
    }
    
    // Trigger a custom event
    const event = new CustomEvent('plantFixedStatusChanged', {
      detail: {
        plant: plant,
        fixed: this.fixedPlants.has(plant.id)
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Check if a plant is fixed
   * 
   * @param {Object} plant - The plant to check
   * @returns {boolean} Whether the plant is fixed
   */
  isPlantFixed(plant) {
    return this.fixedPlants.has(plant.id);
  }
  
  /**
   * Get the plant at the specified coordinates
   * 
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {Object|null} The plant at the coordinates, or null if none
   */
  getPlantAt(x, y) {
    // Check plants in reverse order (top to bottom)
    for (let i = this.plants.length - 1; i >= 0; i--) {
      const plant = this.plants[i];
      const distance = Math.sqrt(Math.pow(x - plant.x, 2) + Math.pow(y - plant.y, 2));
      
      if (distance <= plant.size / 2) {
        return plant;
      }
    }
    
    return null;
  }
  
  /**
   * Shift other plants to accommodate the moved plant
   */
  shiftOtherPlants() {
    if (!this.draggedPlant) return;
    
    // Don't shift plants if there are environmental errors
    if (this.environmentalErrors.length > 0) return;
    
    const minDistance = 40; // Minimum distance between plants
    
    for (const plant of this.plants) {
      // Skip the dragged plant and fixed plants
      if (plant === this.draggedPlant || this.isPlantFixed(plant)) continue;
      
      const dx = plant.x - this.draggedPlant.x;
      const dy = plant.y - this.draggedPlant.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const combinedRadius = (plant.size + this.draggedPlant.size) / 2;
      
      // If plants are too close, shift the other plant
      if (distance < combinedRadius + minDistance) {
        const angle = Math.atan2(dy, dx);
        const shiftDistance = combinedRadius + minDistance - distance;
        
        // Calculate new position
        const newX = plant.x + Math.cos(angle) * shiftDistance;
        const newY = plant.y + Math.sin(angle) * shiftDistance;
        
        // Ensure the new position is within the canvas
        plant.x = Math.max(plant.size / 2, Math.min(this.canvas.width - plant.size / 2, newX));
        plant.y = Math.max(plant.size / 2, Math.min(this.canvas.height - plant.size / 2, newY));
        
        // Snap to grid if enabled
        if (this.showGrid) {
          plant.x = Math.round(plant.x / this.gridSize) * this.gridSize;
          plant.y = Math.round(plant.y / this.gridSize) * this.gridSize;
        }
      }
    }
  }
  
  /**
   * Check for environmental compatibility of all plants
   */
  checkEnvironmentalCompatibility() {
    this.environmentalErrors = [];
    
    for (const plant of this.plants) {
      // Skip checking if no environmental requirements
      if (!plant.environmentalRequirements) continue;
      
      // Get the environmental conditions at the plant's location
      const conditions = this.getEnvironmentalConditionsAt(plant.x, plant.y);
      
      // Check each requirement
      for (const [requirement, value] of Object.entries(plant.environmentalRequirements)) {
        if (conditions[requirement] && !this.isCompatible(conditions[requirement], value)) {
          this.environmentalErrors.push({
            plant: plant,
            requirement: requirement,
            expected: value,
            actual: conditions[requirement]
          });
        }
      }
    }
    
    // Trigger a custom event
    const event = new CustomEvent('environmentalErrorsChanged', {
      detail: {
        errors: this.environmentalErrors
      }
    });
    
    document.dispatchEvent(event);
    
    return this.environmentalErrors.length === 0;
  }
  
  /**
   * Check if a plant's requirement is compatible with the actual condition
   * 
   * @param {*} actual - The actual environmental condition
   * @param {*} expected - The expected condition
   * @returns {boolean} Whether the conditions are compatible
   */
  isCompatible(actual, expected) {
    // If expected is an array, check if actual is in the array
    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }
    
    // If expected is an object with min/max, check if actual is in range
    if (typeof expected === 'object' && expected !== null) {
      if ('min' in expected && 'max' in expected) {
        return actual >= expected.min && actual <= expected.max;
      }
    }
    
    // Otherwise, check for equality
    return actual === expected;
  }
  
  /**
   * Get the environmental conditions at the specified coordinates
   * 
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {Object} The environmental conditions
   */
  getEnvironmentalConditionsAt(x, y) {
    // Calculate relative position in the canvas
    const relX = x / this.canvas.width;
    const relY = y / this.canvas.height;
    
    // In a real implementation, this would use the actual environmental data
    // For now, we'll simulate different zones in the canvas
    
    // Sun exposure zones
    let sunExposure;
    if (relY < 0.25) {
      sunExposure = 'full_sun';
    } else if (relY < 0.5) {
      sunExposure = 'part_sun';
    } else if (relY < 0.75) {
      sunExposure = 'part_shade';
    } else {
      sunExposure = 'full_shade';
    }
    
    // Water condition zones
    let waterCondition;
    if (relX < 0.33) {
      waterCondition = 'dry';
    } else if (relX < 0.66) {
      waterCondition = 'medium';
    } else {
      waterCondition = 'wet';
    }
    
    // Use environmental data if available
    if (this.environmentalData) {
      // In a real implementation, this would interpolate based on the position
      return {
        soil_type: this.environmentalData.soil_type,
        soil_ph: this.environmentalData.soil_ph,
        hardiness_zone: this.environmentalData.hardiness_zone,
        sun_exposure: sunExposure,
        water_condition: waterCondition
      };
    }
    
    // Default values if no environmental data is available
    return {
      soil_type: 'loam',
      soil_ph: 6.5,
      hardiness_zone: '7a',
      sun_exposure: sunExposure,
      water_condition: waterCondition
    };
  }
  
  /**
   * Update companion plant recommendations based on current plants
   */
  updateCompanionRecommendations() {
    this.recommendedPlants = [];
    
    // Skip if no plants
    if (this.plants.length === 0) return;
    
    // Get all companion plants for the current plants
    const potentialCompanions = new Set();
    
    for (const plant of this.plants) {
      if (plant.companionPlants && plant.companionPlants.length > 0) {
        for (const companion of plant.companionPlants) {
          potentialCompanions.add(companion);
        }
      }
    }
    
    // Filter out plants that are already in the design
    const existingPlantNames = new Set(this.plants.map(p => p.name));
    
    for (const companion of potentialCompanions) {
      if (!existingPlantNames.has(companion)) {
        this.recommendedPlants.push(companion);
      }
    }
    
    // Trigger a custom event
    const event = new CustomEvent('companionRecommendationsChanged', {
      detail: {
        recommendations: this.recommendedPlants
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Finalize the position of a plant
   * 
   * @param {Object} plant - The plant to finalize
   */
  finalizePosition(plant) {
    // Ensure the plant is within the canvas
    plant.x = Math.max(plant.size / 2, Math.min(this.canvas.width - plant.size / 2, plant.x));
    plant.y = Math.max(plant.size / 2, Math.min(this.canvas.height - plant.size / 2, plant.y));
    
    // Snap to grid if enabled
    if (this.showGrid) {
      plant.x = Math.round(plant.x / this.gridSize) * this.gridSize;
      plant.y = Math.round(plant.y / this.gridSize) * this.gridSize;
    }
    
    // Check for environmental compatibility
    this.checkEnvironmentalCompatibility();
    
    // Update companion plant recommendations
    this.updateCompanionRecommendations();
    
    // Trigger a custom event
    const event = new CustomEvent('plantPositionChanged', {
      detail: {
        plant: plant
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Load a plant image
   * 
   * @param {string} plantId - The ID of the plant
   * @param {string} imageSrc - The image source URL
   */
  loadPlantImage(plantId, imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      this.plantImages[plantId] = img;
      this.render();
    };
  }
  
  /**
   * Get a color for a plant type
   * 
   * @param {string} type - The plant type
   * @returns {string} A color for the plant type
   */
  getPlantTypeColor(type) {
    const colors = {
      tree: '#2ecc71',
      shrub: '#27ae60',
      perennial: '#3498db',
      annual: '#9b59b6',
      groundcover: '#1abc9c',
      grass: '#f1c40f',
      vine: '#e67e22',
      vegetable: '#e74c3c',
      herb: '#95a5a6',
      default: '#2c3e50'
    };
    
    return colors[type] || colors.default;
  }
  
  /**
   * Render the design
   */
  render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the grid if enabled
    if (this.showGrid) {
      this.drawGrid();
    }
    
    // Draw environmental zones
    this.drawEnvironmentalZones();
    
    // Draw all plants
    for (const plant of this.plants) {
      this.drawPlant(plant);
    }
  }
  
  /**
   * Draw the grid
   */
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw environmental zones
   */
  drawEnvironmentalZones() {
    // Draw sun exposure zones
    const sunZoneHeight = this.canvas.height / 4;
    
    // Full sun zone
    this.ctx.fillStyle = 'rgba(255, 235, 59, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, sunZoneHeight);
    
    // Part sun zone
    this.ctx.fillStyle = 'rgba(255, 193, 7, 0.1)';
    this.ctx.fillRect(0, sunZoneHeight, this.canvas.width, sunZoneHeight);
    
    // Part shade zone
    this.ctx.fillStyle = 'rgba(121, 85, 72, 0.1)';
    this.ctx.fillRect(0, sunZoneHeight * 2, this.canvas.width, sunZoneHeight);
    
    // Full shade zone
    this.ctx.fillStyle = 'rgba(69, 90, 100, 0.1)';
    this.ctx.fillRect(0, sunZoneHeight * 3, this.canvas.width, sunZoneHeight);
    
    // Draw water condition zones
    const waterZoneWidth = this.canvas.width / 3;
    
    // Dry zone
    this.ctx.fillStyle = 'rgba(255, 87, 34, 0.1)';
    this.ctx.fillRect(0, 0, waterZoneWidth, this.canvas.height);
    
    // Medium zone
    this.ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
    this.ctx.fillRect(waterZoneWidth, 0, waterZoneWidth, this.canvas.height);
    
    // Wet zone
    this.ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
    this.ctx.fillRect(waterZoneWidth * 2, 0, waterZoneWidth, this.canvas.height);
    
    // Add labels
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Sun exposure labels
    this.ctx.fillText('Full Sun', 10, 20);
    this.ctx.fillText('Part Sun', 10, sunZoneHeight + 20);
    this.ctx.fillText('Part Shade', 10, sunZoneHeight * 2 + 20);
    this.ctx.fillText('Full Shade', 10, sunZoneHeight * 3 + 20);
    
    // Water condition labels
    this.ctx.fillText('Dry', 10, this.canvas.height - 10);
    this.ctx.fillText('Medium', waterZoneWidth + 10, this.canvas.height - 10);
    this.ctx.fillText('Wet', waterZoneWidth * 2 + 10, this.canvas.height - 10);
  }
  
  /**
   * Draw a plant
   * 
   * @param {Object} plant - The plant to draw
   */
  drawPlant(plant) {
    // Check if we have an image for this plant
    if (this.plantImages[plant.id]) {
      // Draw the image
      this.ctx.drawImage(
        this.plantImages[plant.id],
        plant.x - plant.size / 2,
        plant.y - plant.size / 2,
        plant.size,
        plant.size
      );
    } else {
      // Draw a circle as a placeholder
      this.ctx.beginPath();
      this.ctx.arc(plant.x, plant.y, plant.size / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = plant.color;
      this.ctx.fill();
      
      // Draw the plant name
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(plant.name, plant.x, plant.y + 4);
    }
    
    // Draw a border for the selected plant
    if (plant === this.selectedPlant) {
      this.ctx.beginPath();
      this.ctx.arc(plant.x, plant.y, plant.size / 2 + 3, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#3498db';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // Draw a pin icon for fixed plants
    if (this.isPlantFixed(plant)) {
      this.ctx.beginPath();
      this.ctx.arc(plant.x, plant.y - plant.size / 2 - 5, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.fill();
    }
    
    // Draw an error indicator if the plant has environmental errors
    const hasError = this.environmentalErrors.some(error => error.plant === plant);
    
    if (hasError) {
      this.ctx.beginPath();
      this.ctx.arc(plant.x + plant.size / 2 + 5, plant.y - plant.size / 2 - 5, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#f39c12';
      this.ctx.fill();
    }
  }
  
  /**
   * Toggle the grid visibility
   */
  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.render();
  }
  
  /**
   * Set the environmental data
   * 
   * @param {Object} data - The environmental data
   */
  setEnvironmentalData(data) {
    this.environmentalData = data;
    this.checkEnvironmentalCompatibility();
    this.render();
  }
  
  /**
   * Get all plants in the design
   * 
   * @returns {Array} All plants in the design
   */
  getAllPlants() {
    return [...this.plants];
  }
  
  /**
   * Get all fixed plants in the design
   * 
   * @returns {Array} All fixed plants in the design
   */
  getFixedPlants() {
    return this.plants.filter(plant => this.isPlantFixed(plant));
  }
  
  /**
   * Get all environmental errors
   * 
   * @returns {Array} All environmental errors
   */
  getEnvironmentalErrors() {
    return [...this.environmentalErrors];
  }
  
  /**
   * Get all companion plant recommendations
   * 
   * @returns {Array} All companion plant recommendations
   */
  getCompanionRecommendations() {
    return [...this.recommendedPlants];
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlantPlacementSystem;
}
