/**
 * Integration Tests for Visual Redesign
 * 
 * This file contains tests to verify the functionality of the hand-drawn
 * landscape architecture aesthetic and interactive plant placement system.
 */

// Test suite for the hand-drawn theme
function testHandDrawnTheme() {
  console.log('Testing hand-drawn theme...');
  
  // Test CSS loading
  const styleSheet = document.querySelector('link[href*="hand-drawn-theme.css"]');
  if (!styleSheet) {
    console.error('❌ Hand-drawn theme CSS not loaded');
    return false;
  }
  
  // Test theme application to elements
  const containers = document.querySelectorAll('.sketch-container');
  const cards = document.querySelectorAll('.sketch-card');
  const buttons = document.querySelectorAll('.sketch-btn');
  
  if (containers.length === 0) {
    console.warn('⚠️ No sketch-container elements found');
  }
  
  if (cards.length === 0) {
    console.warn('⚠️ No sketch-card elements found');
  }
  
  if (buttons.length === 0) {
    console.warn('⚠️ No sketch-btn elements found');
  }
  
  // Test computed styles
  const testElement = document.querySelector('.sketch-container') || document.body;
  const computedStyle = window.getComputedStyle(testElement);
  
  if (!computedStyle.backgroundColor.includes('rgb')) {
    console.warn('⚠️ Background color not applied correctly');
  }
  
  console.log('✅ Hand-drawn theme tests completed');
  return true;
}

// Test suite for the stylized map visualization
function testStylizedMapVisualization() {
  console.log('Testing stylized map visualization...');
  
  // Test map canvas
  const mapCanvas = document.getElementById('map-canvas');
  if (!mapCanvas) {
    console.error('❌ Map canvas not found');
    return false;
  }
  
  // Test map visualization class
  if (typeof StylizedMapVisualization !== 'function') {
    console.error('❌ StylizedMapVisualization class not loaded');
    return false;
  }
  
  try {
    // Create test instance
    const testMap = new StylizedMapVisualization('map-canvas');
    
    // Test with sample data
    const testData = {
      soil_type: 'loam',
      soil_ph: 6.5,
      sun_exposure: {
        full_sun: 0.4,
        part_sun: 0.3,
        part_shade: 0.2,
        full_shade: 0.1
      },
      water_conditions: {
        dry: 0.3,
        medium: 0.5,
        wet: 0.2
      }
    };
    
    testMap.setEnvironmentalData(testData);
    
    // Test rendering
    testMap.render();
    
    console.log('✅ Stylized map visualization tests completed');
    return true;
  } catch (error) {
    console.error('❌ Error testing map visualization:', error);
    return false;
  }
}

// Test suite for the interactive plant placement system
function testPlantPlacementSystem() {
  console.log('Testing interactive plant placement system...');
  
  // Test canvas
  const canvas = document.getElementById('design-canvas');
  if (!canvas) {
    console.error('❌ Design canvas not found');
    return false;
  }
  
  // Test plant placement class
  if (typeof PlantPlacementSystem !== 'function') {
    console.error('❌ PlantPlacementSystem class not loaded');
    return false;
  }
  
  try {
    // Create test instance
    const testSystem = new PlantPlacementSystem('design-canvas');
    
    // Test adding a plant
    const testPlant = {
      name: 'Test Plant',
      species: 'Testus plantus',
      type: 'perennial',
      size: 30,
      environmentalRequirements: {
        sun_exposure: 'full_sun',
        water_condition: 'medium',
        soil_type: 'loam'
      }
    };
    
    const addedPlant = testSystem.addPlant(testPlant, 100, 100);
    
    if (!addedPlant || !addedPlant.id) {
      console.error('❌ Failed to add test plant');
      return false;
    }
    
    // Test fixed plants
    testSystem.toggleFixedStatus(addedPlant);
    
    if (!testSystem.isPlantFixed(addedPlant)) {
      console.error('❌ Failed to set plant as fixed');
      return false;
    }
    
    // Test environmental compatibility
    const compatible = testSystem.checkEnvironmentalCompatibility();
    console.log(`Environmental compatibility: ${compatible ? 'Compatible' : 'Incompatible'}`);
    
    // Test removing a plant
    testSystem.removePlant(addedPlant.id);
    
    if (testSystem.getAllPlants().length > 0) {
      console.error('❌ Failed to remove test plant');
      return false;
    }
    
    console.log('✅ Plant placement system tests completed');
    return true;
  } catch (error) {
    console.error('❌ Error testing plant placement system:', error);
    return false;
  }
}

// Test suite for the interactive design elements
function testInteractiveDesignElements() {
  console.log('Testing interactive design elements...');
  
  // Test interactive elements class
  if (typeof InteractiveDesignElements !== 'function') {
    console.error('❌ InteractiveDesignElements class not loaded');
    return false;
  }
  
  // Test error container
  const errorContainer = document.getElementById('environmental-errors');
  if (!errorContainer) {
    console.warn('⚠️ Environmental errors container not found');
  }
  
  // Test recommendation container
  const recommendationContainer = document.getElementById('companion-recommendations');
  if (!recommendationContainer) {
    console.warn('⚠️ Companion recommendations container not found');
  }
  
  // Test plant palette
  const plantPalette = document.getElementById('plant-palette');
  if (!plantPalette) {
    console.warn('⚠️ Plant palette not found');
  }
  
  try {
    // Create test instances
    const testCanvas = document.getElementById('design-canvas') || document.createElement('canvas');
    testCanvas.id = 'design-canvas';
    document.body.appendChild(testCanvas);
    
    const testSystem = new PlantPlacementSystem('design-canvas');
    const testMap = new StylizedMapVisualization('design-canvas');
    
    // Create test instance
    const testElements = new InteractiveDesignElements(testSystem, testMap);
    
    // Test event handling
    const testEvent = new CustomEvent('environmentalErrorsChanged', {
      detail: {
        errors: []
      }
    });
    
    document.dispatchEvent(testEvent);
    
    console.log('✅ Interactive design elements tests completed');
    return true;
  } catch (error) {
    console.error('❌ Error testing interactive design elements:', error);
    return false;
  }
}

// Performance testing
function testPerformance() {
  console.log('Testing performance...');
  
  // Test rendering performance
  const testCanvas = document.getElementById('design-canvas') || document.createElement('canvas');
  testCanvas.id = 'performance-test-canvas';
  testCanvas.width = 800;
  testCanvas.height = 600;
  document.body.appendChild(testCanvas);
  
  try {
    const testSystem = new PlantPlacementSystem('performance-test-canvas');
    
    console.log('Adding 50 plants for performance testing...');
    const startTime = performance.now();
    
    // Add multiple plants
    for (let i = 0; i < 50; i++) {
      const testPlant = {
        name: `Test Plant ${i}`,
        species: 'Testus plantus',
        type: 'perennial',
        size: 20 + Math.random() * 20,
        environmentalRequirements: {
          sun_exposure: 'full_sun',
          water_condition: 'medium',
          soil_type: 'loam'
        }
      };
      
      const x = Math.random() * testCanvas.width;
      const y = Math.random() * testCanvas.height;
      
      testSystem.addPlant(testPlant, x, y);
    }
    
    // Test rendering time
    const beforeRender = performance.now();
    testSystem.render();
    const afterRender = performance.now();
    
    const addTime = beforeRender - startTime;
    const renderTime = afterRender - beforeRender;
    
    console.log(`Time to add 50 plants: ${addTime.toFixed(2)}ms`);
    console.log(`Time to render 50 plants: ${renderTime.toFixed(2)}ms`);
    
    if (renderTime > 100) {
      console.warn(`⚠️ Rendering performance may need optimization (${renderTime.toFixed(2)}ms)`);
    } else {
      console.log('✅ Rendering performance is acceptable');
    }
    
    // Clean up
    document.body.removeChild(testCanvas);
    
    console.log('✅ Performance tests completed');
    return true;
  } catch (error) {
    console.error('❌ Error testing performance:', error);
    return false;
  }
}

// Cross-browser compatibility testing
function testCrossBrowserCompatibility() {
  console.log('Testing cross-browser compatibility...');
  
  // Detect browser
  const userAgent = navigator.userAgent;
  let browser = 'unknown';
  
  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
  }
  
  console.log(`Testing in ${browser} browser`);
  
  // Check for required browser features
  const features = {
    canvas: !!window.CanvasRenderingContext2D,
    customEvents: !!window.CustomEvent,
    dragAndDrop: 'draggable' in document.createElement('div'),
    requestAnimationFrame: !!window.requestAnimationFrame
  };
  
  let allFeaturesSupported = true;
  
  for (const [feature, supported] of Object.entries(features)) {
    if (!supported) {
      console.error(`❌ Required feature not supported: ${feature}`);
      allFeaturesSupported = false;
    }
  }
  
  if (allFeaturesSupported) {
    console.log('✅ All required browser features are supported');
  }
  
  console.log('✅ Cross-browser compatibility tests completed');
  return allFeaturesSupported;
}

// Run all tests
function runAllTests() {
  console.log('Running all tests...');
  
  const results = {
    theme: testHandDrawnTheme(),
    map: testStylizedMapVisualization(),
    placement: testPlantPlacementSystem(),
    interactive: testInteractiveDesignElements(),
    performance: testPerformance(),
    compatibility: testCrossBrowserCompatibility()
  };
  
  console.log('Test results:', results);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('✅ All tests passed!');
  } else {
    console.error('❌ Some tests failed. See above for details.');
  }
  
  return allPassed;
}

// Export test functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testHandDrawnTheme,
    testStylizedMapVisualization,
    testPlantPlacementSystem,
    testInteractiveDesignElements,
    testPerformance,
    testCrossBrowserCompatibility,
    runAllTests
  };
}
