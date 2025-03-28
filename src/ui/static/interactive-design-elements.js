/**
 * Interactive Design Elements Enhancement
 * 
 * This module enhances the interactive design elements with visual feedback,
 * environmental error warnings, and smooth transitions for plant shifts.
 */

class InteractiveDesignElements {
  constructor(plantPlacementSystem, mapVisualization) {
    this.plantSystem = plantPlacementSystem;
    this.mapVisualization = mapVisualization;
    
    // UI elements
    this.errorContainer = document.getElementById('environmental-errors');
    this.recommendationContainer = document.getElementById('companion-recommendations');
    this.plantPalette = document.getElementById('plant-palette');
    
    // Animation properties
    this.animationDuration = 300; // ms
    this.animationEasing = 'ease-out';
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for interactive elements
   */
  setupEventListeners() {
    // Listen for environmental errors
    document.addEventListener('environmentalErrorsChanged', (e) => {
      this.updateEnvironmentalErrors(e.detail.errors);
    });
    
    // Listen for companion recommendations
    document.addEventListener('companionRecommendationsChanged', (e) => {
      this.updateCompanionRecommendations(e.detail.recommendations);
    });
    
    // Listen for plant fixed status changes
    document.addEventListener('plantFixedStatusChanged', (e) => {
      this.animatePlantFixedStatus(e.detail.plant, e.detail.fixed);
    });
    
    // Listen for plant position changes
    document.addEventListener('plantPositionChanged', (e) => {
      this.updatePlantInfoPanel(e.detail.plant);
    });
    
    // Set up plant palette interactions
    if (this.plantPalette) {
      this.setupPlantPalette();
    }
  }
  
  /**
   * Update the environmental errors display
   * 
   * @param {Array} errors - The environmental errors
   */
  updateEnvironmentalErrors(errors) {
    if (!this.errorContainer) return;
    
    // Clear existing errors
    this.errorContainer.innerHTML = '';
    
    if (errors.length === 0) {
      this.errorContainer.classList.add('hidden');
      return;
    }
    
    // Show the error container
    this.errorContainer.classList.remove('hidden');
    
    // Group errors by plant
    const errorsByPlant = {};
    
    for (const error of errors) {
      if (!errorsByPlant[error.plant.id]) {
        errorsByPlant[error.plant.id] = {
          plant: error.plant,
          errors: []
        };
      }
      
      errorsByPlant[error.plant.id].errors.push(error);
    }
    
    // Create error messages
    for (const plantId in errorsByPlant) {
      const plantErrors = errorsByPlant[plantId];
      const errorElement = document.createElement('div');
      errorElement.className = 'environmental-error sketch-animate';
      
      // Create error message
      let errorMessage = `<strong>${plantErrors.plant.name}</strong> is incompatible with its location:<ul>`;
      
      for (const error of plantErrors.errors) {
        const requirement = error.requirement.replace('_', ' ');
        errorMessage += `<li>${requirement}: expected ${this.formatErrorValue(error.expected)}, but got ${this.formatErrorValue(error.actual)}</li>`;
      }
      
      errorMessage += '</ul>';
      
      // Add fix button
      errorMessage += `<button class="sketch-btn sketch-btn-warning fix-plant-btn" data-plant-id="${plantErrors.plant.id}">Fix Location</button>`;
      
      errorElement.innerHTML = errorMessage;
      this.errorContainer.appendChild(errorElement);
      
      // Add event listener to the fix button
      const fixButton = errorElement.querySelector('.fix-plant-btn');
      fixButton.addEventListener('click', () => {
        this.suggestBetterLocation(plantErrors.plant);
      });
    }
    
    // Animate the errors in
    this.animateElements(this.errorContainer.querySelectorAll('.environmental-error'));
  }
  
  /**
   * Update the companion recommendations display
   * 
   * @param {Array} recommendations - The companion plant recommendations
   */
  updateCompanionRecommendations(recommendations) {
    if (!this.recommendationContainer) return;
    
    // Clear existing recommendations
    this.recommendationContainer.innerHTML = '';
    
    if (recommendations.length === 0) {
      this.recommendationContainer.classList.add('hidden');
      return;
    }
    
    // Show the recommendation container
    this.recommendationContainer.classList.remove('hidden');
    
    // Create recommendation message
    const recommendationElement = document.createElement('div');
    recommendationElement.className = 'companion-recommendation sketch-animate';
    
    let recommendationMessage = '<strong>Recommended companion plants:</strong><ul>';
    
    for (const plant of recommendations) {
      recommendationMessage += `<li>${plant}</li>`;
    }
    
    recommendationMessage += '</ul>';
    
    // Add button to add all recommendations
    recommendationMessage += `<button class="sketch-btn sketch-btn-primary add-companions-btn">Add All</button>`;
    
    recommendationElement.innerHTML = recommendationMessage;
    this.recommendationContainer.appendChild(recommendationElement);
    
    // Add event listener to the add button
    const addButton = recommendationElement.querySelector('.add-companions-btn');
    addButton.addEventListener('click', () => {
      this.addCompanionPlants(recommendations);
    });
    
    // Animate the recommendations in
    this.animateElements(this.recommendationContainer.querySelectorAll('.companion-recommendation'));
  }
  
  /**
   * Animate plant fixed status change
   * 
   * @param {Object} plant - The plant
   * @param {boolean} fixed - Whether the plant is fixed
   */
  animatePlantFixedStatus(plant, fixed) {
    // Find the plant element
    const plantElement = document.querySelector(`.plant-item[data-plant-id="${plant.id}"]`);
    
    if (!plantElement) return;
    
    if (fixed) {
      // Add fixed class with animation
      plantElement.classList.add('fixing');
      
      setTimeout(() => {
        plantElement.classList.add('fixed');
        plantElement.classList.remove('fixing');
      }, 300);
      
      // Add pin icon
      const pinIcon = document.createElement('div');
      pinIcon.className = 'pin-icon';
      plantElement.appendChild(pinIcon);
      
      // Animate pin icon
      pinIcon.style.animation = 'pin-drop 0.3s ease-out forwards';
    } else {
      // Remove fixed class with animation
      plantElement.classList.add('unfixing');
      
      // Find and animate pin icon
      const pinIcon = plantElement.querySelector('.pin-icon');
      
      if (pinIcon) {
        pinIcon.style.animation = 'pin-remove 0.3s ease-out forwards';
        
        setTimeout(() => {
          pinIcon.remove();
        }, 300);
      }
      
      setTimeout(() => {
        plantElement.classList.remove('fixed');
        plantElement.classList.remove('unfixing');
      }, 300);
    }
  }
  
  /**
   * Update the plant information panel
   * 
   * @param {Object} plant - The plant
   */
  updatePlantInfoPanel(plant) {
    const infoPanel = document.getElementById('plant-info-panel');
    
    if (!infoPanel) return;
    
    // Update plant information
    infoPanel.innerHTML = `
      <div class="sketch-card">
        <div class="card-header">${plant.name}</div>
        <div class="card-body">
          <p><strong>Species:</strong> ${plant.species}</p>
          <p><strong>Type:</strong> ${plant.type}</p>
          <p><strong>Position:</strong> (${Math.round(plant.x)}, ${Math.round(plant.y)})</p>
          <p><strong>Fixed:</strong> ${this.plantSystem.isPlantFixed(plant) ? 'Yes' : 'No'}</p>
          
          <div class="plant-actions">
            <button class="sketch-btn ${this.plantSystem.isPlantFixed(plant) ? 'sketch-btn-warning' : 'sketch-btn-primary'} toggle-fixed-btn">
              ${this.plantSystem.isPlantFixed(plant) ? 'Unfix Plant' : 'Fix Plant'}
            </button>
            <button class="sketch-btn sketch-btn-secondary remove-plant-btn">Remove Plant</button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners to buttons
    const toggleFixedBtn = infoPanel.querySelector('.toggle-fixed-btn');
    const removePlantBtn = infoPanel.querySelector('.remove-plant-btn');
    
    toggleFixedBtn.addEventListener('click', () => {
      this.plantSystem.toggleFixedStatus(plant);
      this.updatePlantInfoPanel(plant);
    });
    
    removePlantBtn.addEventListener('click', () => {
      this.plantSystem.removePlant(plant.id);
      infoPanel.innerHTML = '<p>No plant selected</p>';
    });
    
    // Animate the panel update
    infoPanel.classList.add('updating');
    
    setTimeout(() => {
      infoPanel.classList.remove('updating');
    }, 300);
  }
  
  /**
   * Set up the plant palette
   */
  setupPlantPalette() {
    // Get plant data
    const plants = [
      {
        name: 'Oak Tree',
        species: 'Quercus alba',
        type: 'tree',
        size: 50,
        environmentalRequirements: {
          sun_exposure: ['full_sun', 'part_sun'],
          water_condition: 'medium',
          soil_type: ['loam', 'clay']
        },
        companionPlants: ['Dogwood', 'Wild Ginger', 'Fern']
      },
      {
        name: 'Dogwood',
        species: 'Cornus florida',
        type: 'tree',
        size: 40,
        environmentalRequirements: {
          sun_exposure: ['part_sun', 'part_shade'],
          water_condition: 'medium',
          soil_type: ['loam']
        },
        companionPlants: ['Oak Tree', 'Azalea', 'Fern']
      },
      {
        name: 'Azalea',
        species: 'Rhododendron',
        type: 'shrub',
        size: 30,
        environmentalRequirements: {
          sun_exposure: ['part_shade', 'full_shade'],
          water_condition: 'medium',
          soil_type: ['loam', 'sandy']
        },
        companionPlants: ['Dogwood', 'Fern', 'Hosta']
      },
      {
        name: 'Fern',
        species: 'Dryopteris',
        type: 'perennial',
        size: 20,
        environmentalRequirements: {
          sun_exposure: ['part_shade', 'full_shade'],
          water_condition: ['medium', 'wet'],
          soil_type: ['loam']
        },
        companionPlants: ['Dogwood', 'Azalea', 'Hosta']
      },
      {
        name: 'Hosta',
        species: 'Hosta plantaginea',
        type: 'perennial',
        size: 25,
        environmentalRequirements: {
          sun_exposure: ['part_shade', 'full_shade'],
          water_condition: ['medium', 'wet'],
          soil_type: ['loam', 'clay']
        },
        companionPlants: ['Fern', 'Azalea']
      },
      {
        name: 'Black-Eyed Susan',
        species: 'Rudbeckia hirta',
        type: 'perennial',
        size: 15,
        environmentalRequirements: {
          sun_exposure: ['full_sun', 'part_sun'],
          water_condition: ['dry', 'medium'],
          soil_type: ['loam', 'sandy', 'clay']
        },
        companionPlants: ['Coneflower', 'Ornamental Grass']
      },
      {
        name: 'Coneflower',
        species: 'Echinacea purpurea',
        type: 'perennial',
        size: 15,
        environmentalRequirements: {
          sun_exposure: ['full_sun', 'part_sun'],
          water_condition: ['dry', 'medium'],
          soil_type: ['loam', 'clay']
        },
        companionPlants: ['Black-Eyed Susan', 'Ornamental Grass']
      },
      {
        name: 'Ornamental Grass',
        species: 'Miscanthus sinensis',
        type: 'grass',
        size: 35,
        environmentalRequirements: {
          sun_exposure: ['full_sun'],
          water_condition: ['dry', 'medium'],
          soil_type: ['loam', 'sandy', 'clay']
        },
        companionPlants: ['Black-Eyed Susan', 'Coneflower']
      }
    ];
    
    // Create plant palette items
    for (const plant of plants) {
      const plantItem = document.createElement('div');
      plantItem.className = 'plant-item sketch-card';
      plantItem.setAttribute('data-plant-name', plant.name);
      
      plantItem.innerHTML = `
        <div class="plant-icon" style="background-color: ${this.plantSystem.getPlantTypeColor(plant.type)}"></div>
        <div class="plant-info">
          <div class="plant-name">${plant.name}</div>
          <div class="plant-species">${plant.species}</div>
        </div>
      `;
      
      this.plantPalette.appendChild(plantItem);
      
      // Add drag and drop functionality
      this.addDragAndDrop(plantItem, plant);
    }
  }
  
  /**
   * Add drag and drop functionality to a plant palette item
   * 
   * @param {HTMLElement} element - The plant palette item
   * @param {Object} plant - The plant data
   */
  addDragAndDrop(element, plant) {
    element.setAttribute('draggable', 'true');
    
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/json', JSON.stringify(plant));
      e.dataTransfer.effectAllowed = 'copy';
      
      // Create a drag image
      const dragImage = element.cloneNode(true);
      dragImage.style.width = `${element.offsetWidth}px`;
      dragImage.style.height = `${element.offsetHeight}px`;
      dragImage.style.opacity = '0.7';
      
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
      
      element.classList.add('dragging');
    });
    
    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
    });
    
    // Add drop target to the canvas
    const canvas = this.plantSystem.canvas;
    
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      
      // Add a visual indicator for the drop target
      canvas.classList.add('drop-target');
    });
    
    canvas.addEventListener('dragleave', () => {
      canvas.classList.remove('drop-target');
    });
    
    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      canvas.classList.remove('drop-target');
      
      // Get the drop position
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Get the plant data
      const plantData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Add the plant to the design
      const newPlant = this.plantSystem.addPlant(plantData, x, y);
      
      // Animate the plant addition
      this.animatePlantAddition(newPlant);
    });
  }
  
  /**
   * Animate plant addition
   * 
   * @param {Object} plant - The added plant
   */
  animatePlantAddition(plant) {
    // Create a ripple effect at the plant position
    const ripple = document.createElement('div');
    ripple.className = 'plant-ripple';
    ripple.style.left = `${plant.x}px`;
    ripple.style.top = `${plant.y}px`;
    
    this.plantSystem.canvas.parentElement.appendChild(ripple);
    
    // Remove the ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }
  
  /**
   * Suggest a better location for a plant with environmental errors
   * 
   * @param {Object} plant - The plant with errors
   */
  suggestBetterLocation(plant) {
    // Find a suitable location based on the plant's requirements
    const requirements = plant.environmentalRequirements;
    
    if (!requirements) return;
    
    // Get canvas dimensions
    const canvasWidth = this.plantSystem.canvas.width;
    const canvasHeight = this.plantSystem.canvas.height;
    
    // Try different locations
    const gridSize = 50;
    let bestLocation = null;
    let bestScore = -1;
    
    for (let x = gridSize; x < canvasWidth; x += gridSize) {
      for (let y = gridSize; y < canvasHeight; y += gridSize) {
        // Get environmental conditions at this location
        const conditions = this.plantSystem.getEnvironmentalConditionsAt(x, y);
        
        // Calculate compatibility score
        let score = 0;
        
        for (const [requirement, value] of Object.entries(requirements)) {
          if (conditions[requirement] && this.plantSystem.isCompatible(conditions[requirement], value)) {
            score++;
          }
        }
        
        // Check if this is the best location so far
        if (score > bestScore) {
          bestScore = score;
          bestLocation = { x, y };
        }
        
        // If we found a perfect match, stop searching
        if (score === Object.keys(requirements).length) {
          break;
        }
      }
    }
    
    if (bestLocation) {
      // Animate moving the plant to the new location
      this.animatePlantMovement(plant, bestLocation.x, bestLocation.y);
    }
  }
  
  /**
   * Animate plant movement
   * 
   * @param {Object} plant - The plant to move
   * @param {number} targetX - The target x coordinate
   * @param {number} targetY - The target y coordinate
   */
  animatePlantMovement(plant, targetX, targetY) {
    // Store original position
    const startX = plant.x;
    const startY = plant.y;
    
    // Create animation frames
    const frames = 30;
    let frame = 0;
    
    const animate = () => {
      frame++;
      
      // Calculate new position
      const progress = frame / frames;
      const easedProgress = this.easeInOutQuad(progress);
      
      plant.x = startX + (targetX - startX) * easedProgress;
      plant.y = startY + (targetY - startY) * easedProgress;
      
      // Update the plant system
      this.plantSystem.render();
      
      // Continue animation if not complete
      if (frame < frames) {
        requestAnimationFrame(animate);
      } else {
        // Finalize position
        this.plantSystem.finalizePosition(plant);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
  
  /**
   * Add companion plants to the design
   * 
   * @param {Array} companions - The companion plants to add
   */
  addCompanionPlants(companions) {
    // Find plant data for companions
    const plantItems = Array.from(this.plantPalette.querySelectorAll('.plant-item'));
    
    for (const companion of companions) {
      const plantItem = plantItems.find(item => item.getAttribute('data-plant-name') === companion);
      
      if (plantItem) {
        // Get plant data
        const plantName = plantItem.getAttribute('data-plant-name');
        const plantType = plantItem.querySelector('.plant-icon').style.backgroundColor;
        const plantSpecies = plantItem.querySelector('.plant-species').textContent;
        
        // Find a suitable location
        const canvasWidth = this.plantSystem.canvas.width;
        const canvasHeight = this.plantSystem.canvas.height;
        
        // Place near existing plants
        const existingPlants = this.plantSystem.getAllPlants();
        let x, y;
        
        if (existingPlants.length > 0) {
          // Choose a random existing plant
          const randomPlant = existingPlants[Math.floor(Math.random() * existingPlants.length)];
          
          // Place near it
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 100 + 50;
          
          x = randomPlant.x + Math.cos(angle) * distance;
          y = randomPlant.y + Math.sin(angle) * distance;
          
          // Ensure within canvas
          x = Math.max(50, Math.min(canvasWidth - 50, x));
          y = Math.max(50, Math.min(canvasHeight - 50, y));
        } else {
          // Place randomly
          x = Math.random() * (canvasWidth - 100) + 50;
          y = Math.random() * (canvasHeight - 100) + 50;
        }
        
        // Add the plant
        const plant = {
          name: plantName,
          species: plantSpecies,
          type: this.getPlantTypeFromColor(plantType),
          size: 30
        };
        
        const newPlant = this.plantSystem.addPlant(plant, x, y);
        
        // Animate the plant addition
        this.animatePlantAddition(newPlant);
        
        // Add with a delay for visual effect
        setTimeout(() => {
          this.plantSystem.render();
        }, 300);
      }
    }
  }
  
  /**
   * Get plant type from color
   * 
   * @param {string} color - The color
   * @returns {string} The plant type
   */
  getPlantTypeFromColor(color) {
    const colorMap = {
      'rgb(46, 204, 113)': 'tree',
      'rgb(39, 174, 96)': 'shrub',
      'rgb(52, 152, 219)': 'perennial',
      'rgb(155, 89, 182)': 'annual',
      'rgb(26, 188, 156)': 'groundcover',
      'rgb(241, 196, 15)': 'grass',
      'rgb(230, 126, 34)': 'vine',
      'rgb(231, 76, 60)': 'vegetable',
      'rgb(149, 165, 166)': 'herb'
    };
    
    return colorMap[color] || 'perennial';
  }
  
  /**
   * Format error value for display
   * 
   * @param {*} value - The error value
   * @returns {string} The formatted value
   */
  formatErrorValue(value) {
    if (Array.isArray(value)) {
      return value.join(' or ');
    }
    
    if (typeof value === 'object' && value !== null) {
      if ('min' in value && 'max' in value) {
        return `between ${value.min} and ${value.max}`;
      }
    }
    
    return value;
  }
  
  /**
   * Animate elements
   * 
   * @param {NodeList} elements - The elements to animate
   */
  animateElements(elements) {
    Array.from(elements).forEach((element, index) => {
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }
  
  /**
   * Easing function for animations
   * 
   * @param {number} t - The progress (0-1)
   * @returns {number} The eased progress
   */
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveDesignElements;
}
