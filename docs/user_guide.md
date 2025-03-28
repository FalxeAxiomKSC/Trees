# Native Landscape Design Tool - User Guide

## Overview

The Native Landscape Design Tool is an interactive application with a hand-drawn landscape architecture aesthetic designed to help create sustainable, native landscape designs based on specific environmental conditions in Fayetteville, AR (72704). The tool considers factors such as water needs, soil structure, shade, topography, and other environmental parameters to recommend appropriate native plants for your landscape.

## Features

- **Map-Based Location Selection**: Draw polygons to define your exact site boundaries and automatically retrieve environmental data
- **Hand-Drawn Aesthetic**: Professional landscape architecture drawing style with sketched UI elements
- **Interactive Plant Placement**: Place plants with intelligent shifting, fixed plants, and environmental compatibility checking
- **Companion Plant Recommendations**: Receive suggestions for plants that work well with your existing selections
- **Environmental Data Integration**: Automatically pull data from USDA NRCS, NOAA, and other authoritative sources
- **Visual Feedback**: Get real-time feedback on plant compatibility and placement
- **Design Management**: Save, view, and compare multiple landscape designs

## Getting Started

### Running the Application

1. Navigate to the project directory:
   ```
   cd ~/landscape-design-tool
   ```

2. Install required dependencies:
   ```
   pip install flask matplotlib numpy
   ```

3. Run the application:
   ```
   python src/ui/app.py
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

### Creating a Site with Map Selection

1. From the home page, click on "Create Site"
2. Use the map interface to:
   - Search for a specific location using the search box
   - Navigate to your desired location
   - Click the polygon drawing tool in the top-left toolbar
   - Click on the map to place points defining your site boundary
   - Complete the polygon by clicking on the first point
   - The system will automatically calculate the area

3. After drawing your site boundary, the system will:
   - Automatically retrieve environmental data for that location
   - Display soil information (soil type and pH)
   - Show climate information (hardiness zone, precipitation, temperature)
   - Visualize sun exposure distribution
   - Display water conditions distribution

4. Click "Use This Data" to automatically populate the form fields
5. Complete any remaining fields and click "Create Site"

### Interactive Plant Placement

1. After creating a site, click "Design Landscape"
2. Use the plant palette on the left to select plants:
   - Drag plants from the palette onto the canvas
   - Plants will be placed at the drop location
   - Other plants will shift to maintain appropriate spacing

3. Manage plants on the canvas:
   - Click and drag to move plants
   - Double-click a plant to toggle its "fixed" status (fixed plants won't be removed)
   - Fixed plants display a pin icon
   - Plants with environmental compatibility issues show warning indicators

4. Use companion plant recommendations:
   - View recommended companion plants based on your existing selections
   - Click "Add All" to add all recommended plants
   - New plants are placed near compatible existing plants

5. Handle environmental errors:
   - Warning indicators appear on incompatible plants
   - Error messages explain the incompatibility
   - Click "Fix Location" to automatically move plants to better locations

### Managing Plants

1. From the home page, click on "Plant Database"
2. Browse the existing plants in the database
3. Filter plants by type, sun exposure, water needs, or native status
4. View detailed information about each plant
5. Add new plants to the database using the "Add Plant" button

### Viewing Designs

1. From the home page, click on "Designs"
2. Browse your saved designs
3. Click "View Design" to see detailed information about a specific design
4. Compare different designs to find the best fit for your needs

## Project Structure

```
landscape-design-tool/
├── src/                  # Source code
│   ├── ui/               # User interface components
│   │   ├── static/       # CSS, JavaScript, and images
│   │   │   ├── hand-drawn-theme.css           # Hand-drawn aesthetic styles
│   │   │   ├── plant-placement-system.js      # Interactive plant placement
│   │   │   ├── stylized-map-visualization.js  # Hand-drawn map visualization
│   │   │   └── interactive-design-elements.js # Enhanced UI interactions
│   │   └── templates/    # HTML templates
│   │       ├── index.html             # Home page
│   │       ├── site_form_with_map.html # Map-based site creation
│   │       ├── plant_database.html    # Plant database view
│   │       └── designs.html           # Designs view
│   ├── models/           # Data models and algorithms
│   │   ├── plant.py      # Plant model
│   │   ├── site.py       # Site model
│   │   └── design_algorithm.py # Design generation algorithm
│   ├── utils/            # Utility functions
│   │   ├── visualizer.py # Visualization component
│   │   └── environmental_data_service.py # Data retrieval service
│   └── config.py         # Configuration settings
├── data/                 # Data files
│   ├── climate/          # Climate data for Fayetteville, AR
│   ├── soil/             # Soil data from USDA NRCS
│   ├── plants/           # Plant database information
│   └── designs/          # Saved designs and visualizations
├── docs/                 # Documentation
│   ├── development_roadmap.md           # Development roadmap
│   ├── visual_redesign_documentation.md # Visual design documentation
│   └── user_guide.md                    # This user guide
└── tests/                # Test files
    └── visual_redesign_tests.js         # Tests for visual components
```

## Technical Details

### Core Components

1. **Data Models**:
   - `Plant`: Represents plant species with attributes like water needs, sun requirements, and soil preferences
   - `Site`: Represents a physical location with environmental characteristics
   - `DesignAlgorithm`: Matches plants to appropriate locations based on compatibility

2. **Visualization**:
   - Hand-drawn landscape architecture aesthetic
   - Stylized 2D map visualization with environmental zones
   - Interactive canvas for plant placement
   - Visual feedback for plant interactions and errors

3. **User Interface**:
   - Flask-based web application
   - Hand-drawn UI elements (buttons, cards, containers)
   - Interactive map with polygon drawing
   - Drag-and-drop plant placement
   - Real-time environmental compatibility checking

### Interactive Plant Placement System

The interactive plant placement system works by:

1. Allowing users to place plants on the canvas via drag-and-drop
2. Checking environmental compatibility based on plant requirements and site conditions
3. Intelligently shifting other plants to maintain appropriate spacing
4. Providing visual feedback for fixed plants and environmental errors
5. Recommending companion plants based on existing selections
6. Allowing plants to be designated as "fixed" so they won't be removed

### Environmental Data Integration

The environmental data service:

1. Retrieves soil information from USDA NRCS based on location
2. Obtains climate data from NOAA for the selected area
3. Determines the USDA hardiness zone
4. Maps sun exposure and water conditions across the site
5. Provides comprehensive environmental data for plant compatibility checking

## Hand-Drawn Aesthetic

The visual design implements:

1. Paper-like background with textured appearance
2. Sketched UI elements with hand-drawn borders
3. Custom buttons and form elements with a hand-drawn feel
4. Stylized visualization of environmental zones
5. Decorative elements like rocks and paths
6. Smooth animations for plant movements and interactions

## Future Development

As outlined in the development roadmap, future enhancements may include:

1. Seasonal visualization to show landscape changes throughout the year
2. Topography analysis and water flow modeling
3. Microclimate detection and modeling
4. Water usage calculation and optimization
5. Climate change adaptation strategies
6. Export functionality for designs (PDF, images)
7. Collaboration features for sharing designs

## Troubleshooting

### Common Issues

1. **Plants Not Shifting Properly**
   - Check if too many plants are set as fixed
   - Ensure there's enough space in the garden
   - Try moving plants to less crowded areas

2. **Environmental Errors Persist**
   - Review the specific environmental requirements
   - Consider changing the plant selection
   - Modify the environmental conditions if possible

3. **Performance Issues**
   - Reduce the number of plants in very large gardens
   - Close other browser tabs and applications
   - Check for browser updates

4. **Map Loading Issues**
   - Ensure you have a stable internet connection
   - Try refreshing the page
   - Clear browser cache and cookies

If you encounter other issues:

1. Ensure all dependencies are installed
2. Check that the data directories exist and have appropriate permissions
3. Verify that the plant database contains entries
4. Check the log files for error messages

## Browser Compatibility

The application is compatible with:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contact

For more information or assistance, please contact the project maintainer.
