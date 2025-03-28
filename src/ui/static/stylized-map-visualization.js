/**
 * Stylized 2D Map Visualization
 * 
 * This module provides a hand-drawn, landscape architecture style
 * visualization for the map and environmental data.
 */

class StylizedMapVisualization {
  constructor(canvasId, environmentalData) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.environmentalData = environmentalData || {};
    
    // Map elements
    this.mapElements = [];
    this.textures = {};
    
    // Initialize the canvas
    this.resizeCanvas();
    this.loadTextures();
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
   * Load textures for the map visualization
   */
  loadTextures() {
    const textureNames = [
      'paper', 'soil', 'grass', 'water', 
      'sun', 'shade', 'rock', 'path'
    ];
    
    let loadedCount = 0;
    
    textureNames.forEach(name => {
      const img = new Image();
      img.src = `/static/images/${name}-texture.png`;
      
      img.onload = () => {
        this.textures[name] = img;
        loadedCount++;
        
        if (loadedCount === textureNames.length) {
          this.render();
        }
      };
      
      img.onerror = () => {
        console.warn(`Failed to load texture: ${name}`);
        loadedCount++;
        
        if (loadedCount === textureNames.length) {
          this.render();
        }
      };
    });
  }
  
  /**
   * Set the environmental data
   * 
   * @param {Object} data - The environmental data
   */
  setEnvironmentalData(data) {
    this.environmentalData = data;
    this.generateMapElements();
    this.render();
  }
  
  /**
   * Generate map elements based on environmental data
   */
  generateMapElements() {
    this.mapElements = [];
    
    if (!this.environmentalData) return;
    
    // Generate soil texture
    this.addSoilTexture();
    
    // Generate sun exposure zones
    this.addSunExposureZones();
    
    // Generate water condition zones
    this.addWaterConditionZones();
    
    // Add decorative elements
    this.addDecorativeElements();
  }
  
  /**
   * Add soil texture to the map
   */
  addSoilTexture() {
    const soilType = this.environmentalData.soil_type || 'loam';
    
    this.mapElements.push({
      type: 'soil',
      soilType: soilType,
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height,
      zIndex: 0
    });
  }
  
  /**
   * Add sun exposure zones to the map
   */
  addSunExposureZones() {
    if (!this.environmentalData.sun_exposure) return;
    
    const sunExposure = this.environmentalData.sun_exposure;
    let totalArea = 0;
    
    for (const [type, area] of Object.entries(sunExposure)) {
      totalArea += area;
    }
    
    if (totalArea === 0) return;
    
    let yOffset = 0;
    
    for (const [type, area] of Object.entries(sunExposure)) {
      const percentage = area / totalArea;
      const height = this.canvas.height * percentage;
      
      this.mapElements.push({
        type: 'sun_exposure',
        exposureType: type,
        x: 0,
        y: yOffset,
        width: this.canvas.width,
        height: height,
        zIndex: 1
      });
      
      yOffset += height;
    }
  }
  
  /**
   * Add water condition zones to the map
   */
  addWaterConditionZones() {
    if (!this.environmentalData.water_conditions) return;
    
    const waterConditions = this.environmentalData.water_conditions;
    let totalArea = 0;
    
    for (const [type, area] of Object.entries(waterConditions)) {
      totalArea += area;
    }
    
    if (totalArea === 0) return;
    
    let xOffset = 0;
    
    for (const [type, area] of Object.entries(waterConditions)) {
      const percentage = area / totalArea;
      const width = this.canvas.width * percentage;
      
      this.mapElements.push({
        type: 'water_condition',
        conditionType: type,
        x: xOffset,
        y: 0,
        width: width,
        height: this.canvas.height,
        zIndex: 2
      });
      
      xOffset += width;
    }
  }
  
  /**
   * Add decorative elements to the map
   */
  addDecorativeElements() {
    // Add rocks
    const rockCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < rockCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 20 + 10;
      
      this.mapElements.push({
        type: 'rock',
        x: x,
        y: y,
        size: size,
        zIndex: 3
      });
    }
    
    // Add path
    if (Math.random() > 0.5) {
      const pathPoints = [];
      const pointCount = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < pointCount; i++) {
        pathPoints.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height
        });
      }
      
      this.mapElements.push({
        type: 'path',
        points: pathPoints,
        width: Math.random() * 10 + 5,
        zIndex: 4
      });
    }
  }
  
  /**
   * Render the map visualization
   */
  render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw paper background
    this.drawPaperBackground();
    
    // Sort map elements by zIndex
    const sortedElements = [...this.mapElements].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw map elements
    for (const element of sortedElements) {
      switch (element.type) {
        case 'soil':
          this.drawSoil(element);
          break;
        case 'sun_exposure':
          this.drawSunExposure(element);
          break;
        case 'water_condition':
          this.drawWaterCondition(element);
          break;
        case 'rock':
          this.drawRock(element);
          break;
        case 'path':
          this.drawPath(element);
          break;
      }
    }
    
    // Draw grid
    this.drawGrid();
    
    // Draw legend
    this.drawLegend();
  }
  
  /**
   * Draw paper background
   */
  drawPaperBackground() {
    if (this.textures.paper) {
      // Create pattern
      const pattern = this.ctx.createPattern(this.textures.paper, 'repeat');
      this.ctx.fillStyle = pattern;
    } else {
      this.ctx.fillStyle = '#f8f5e6';
    }
    
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw a hand-drawn border
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 3;
    this.ctx.lineJoin = 'round';
    
    // Add slight imperfections to the border
    this.ctx.beginPath();
    this.ctx.moveTo(3, 3);
    this.ctx.lineTo(this.canvas.width - 3, 5);
    this.ctx.lineTo(this.canvas.width - 4, this.canvas.height - 4);
    this.ctx.lineTo(5, this.canvas.height - 3);
    this.ctx.closePath();
    this.ctx.stroke();
  }
  
  /**
   * Draw soil texture
   * 
   * @param {Object} element - The soil element
   */
  drawSoil(element) {
    const soilColors = {
      clay: '#d35400',
      loam: '#a67c52',
      sandy: '#f39c12',
      silty: '#bdc3c7',
      chalky: '#ecf0f1'
    };
    
    const color = soilColors[element.soilType] || soilColors.loam;
    
    if (this.textures.soil) {
      // Create pattern
      const pattern = this.ctx.createPattern(this.textures.soil, 'repeat');
      this.ctx.fillStyle = pattern;
    } else {
      this.ctx.fillStyle = color;
    }
    
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillRect(element.x, element.y, element.width, element.height);
    this.ctx.globalAlpha = 1.0;
    
    // Draw soil type label
    this.ctx.font = '16px "Caveat", cursive';
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `Soil Type: ${element.soilType.charAt(0).toUpperCase() + element.soilType.slice(1)}`,
      this.canvas.width / 2,
      this.canvas.height - 20
    );
  }
  
  /**
   * Draw sun exposure zone
   * 
   * @param {Object} element - The sun exposure element
   */
  drawSunExposure(element) {
    const exposureColors = {
      full_sun: 'rgba(255, 235, 59, 0.2)',
      part_sun: 'rgba(255, 193, 7, 0.2)',
      part_shade: 'rgba(121, 85, 72, 0.2)',
      full_shade: 'rgba(69, 90, 100, 0.2)'
    };
    
    const color = exposureColors[element.exposureType] || exposureColors.full_sun;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(element.x, element.y, element.width, element.height);
    
    // Draw a hand-drawn line to separate zones
    if (element.y > 0) {
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      
      // Draw a slightly wavy line
      const segments = 20;
      const segmentWidth = element.width / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = element.x + i * segmentWidth;
        const yOffset = Math.sin(i * 0.5) * 2;
        
        if (i === 0) {
          this.ctx.moveTo(x, element.y + yOffset);
        } else {
          this.ctx.lineTo(x, element.y + yOffset);
        }
      }
      
      this.ctx.stroke();
    }
    
    // Draw sun exposure label
    const displayType = element.exposureType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    this.ctx.font = '14px "Caveat", cursive';
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      displayType,
      element.x + 10,
      element.y + 20
    );
  }
  
  /**
   * Draw water condition zone
   * 
   * @param {Object} element - The water condition element
   */
  drawWaterCondition(element) {
    const conditionColors = {
      dry: 'rgba(255, 87, 34, 0.2)',
      medium: 'rgba(76, 175, 80, 0.2)',
      wet: 'rgba(33, 150, 243, 0.2)'
    };
    
    const color = conditionColors[element.conditionType] || conditionColors.medium;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(element.x, element.y, element.width, element.height);
    
    // Draw a hand-drawn line to separate zones
    if (element.x > 0) {
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      
      // Draw a slightly wavy line
      const segments = 20;
      const segmentHeight = element.height / segments;
      
      for (let i = 0; i <= segments; i++) {
        const y = element.y + i * segmentHeight;
        const xOffset = Math.sin(i * 0.5) * 2;
        
        if (i === 0) {
          this.ctx.moveTo(element.x + xOffset, y);
        } else {
          this.ctx.lineTo(element.x + xOffset, y);
        }
      }
      
      this.ctx.stroke();
    }
    
    // Draw water condition label
    const displayType = element.conditionType.charAt(0).toUpperCase() + element.conditionType.slice(1);
    
    this.ctx.font = '14px "Caveat", cursive';
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      displayType,
      element.x + element.width / 2,
      element.height - 10
    );
  }
  
  /**
   * Draw a rock
   * 
   * @param {Object} element - The rock element
   */
  drawRock(element) {
    if (this.textures.rock) {
      this.ctx.drawImage(
        this.textures.rock,
        element.x - element.size / 2,
        element.y - element.size / 2,
        element.size,
        element.size
      );
    } else {
      // Draw a simple rock shape
      this.ctx.fillStyle = '#95a5a6';
      this.ctx.beginPath();
      this.ctx.ellipse(
        element.x,
        element.y,
        element.size / 2,
        element.size / 3,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Add some texture
      this.ctx.strokeStyle = '#7f8c8d';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(element.x - element.size / 4, element.y);
      this.ctx.lineTo(element.x + element.size / 4, element.y);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a path
   * 
   * @param {Object} element - The path element
   */
  drawPath(element) {
    if (element.points.length < 2) return;
    
    if (this.textures.path) {
      // Draw path using texture
      this.ctx.strokeStyle = this.ctx.createPattern(this.textures.path, 'repeat');
    } else {
      // Draw a simple path
      this.ctx.strokeStyle = '#d2b48c';
    }
    
    this.ctx.lineWidth = element.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(element.points[0].x, element.points[0].y);
    
    for (let i = 1; i < element.points.length; i++) {
      this.ctx.lineTo(element.points[i].x, element.points[i].y);
    }
    
    this.ctx.stroke();
  }
  
  /**
   * Draw a grid
   */
  drawGrid() {
    const gridSize = 50;
    
    this.ctx.strokeStyle = 'rgba(44, 62, 80, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      
      // Draw a slightly wavy line
      const segments = 20;
      const segmentHeight = this.canvas.height / segments;
      
      for (let i = 0; i <= segments; i++) {
        const y = i * segmentHeight;
        const xOffset = Math.sin(i * 0.2) * 2;
        
        if (i === 0) {
          this.ctx.moveTo(x + xOffset, y);
        } else {
          this.ctx.lineTo(x + xOffset, y);
        }
      }
      
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      
      // Draw a slightly wavy line
      const segments = 20;
      const segmentWidth = this.canvas.width / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const yOffset = Math.sin(i * 0.2) * 2;
        
        if (i === 0) {
          this.ctx.moveTo(x, y + yOffset);
        } else {
          this.ctx.lineTo(x, y + yOffset);
        }
      }
      
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a legend
   */
  drawLegend() {
    const legendWidth = 200;
    const legendHeight = 150;
    const x = this.canvas.width - legendWidth - 20;
    const y = 20;
    
    // Draw legend background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + legendWidth, y);
    this.ctx.lineTo(x + legendWidth, y + legendHeight);
    this.ctx.lineTo(x, y + legendHeight);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw legend title
    this.ctx.font = '16px "Caveat", cursive';
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Legend', x + legendWidth / 2, y + 20);
    
    // Draw legend items
    this.ctx.font = '14px "Caveat", cursive';
    this.ctx.textAlign = 'left';
    
    // Sun exposure
    this.ctx.fillStyle = 'rgba(255, 235, 59, 0.5)';
    this.ctx.fillRect(x + 10, y + 40, 20, 10);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText('Full Sun', x + 40, y + 50);
    
    this.ctx.fillStyle = 'rgba(121, 85, 72, 0.5)';
    this.ctx.fillRect(x + 10, y + 60, 20, 10);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText('Shade', x + 40, y + 70);
    
    // Water conditions
    this.ctx.fillStyle = 'rgba(255, 87, 34, 0.5)';
    this.ctx.fillRect(x + 10, y + 80, 20, 10);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText('Dry', x + 40, y + 90);
    
    this.ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
    this.ctx.fillRect(x + 10, y + 100, 20, 10);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText('Wet', x + 40, y + 110);
    
    // Soil
    this.ctx.fillStyle = '#a67c52';
    this.ctx.fillRect(x + 10, y + 120, 20, 10);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText('Soil', x + 40, y + 130);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StylizedMapVisualization;
}
