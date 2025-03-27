# Native Landscape Design Tool - User Guide

## Overview

The Native Landscape Design Tool is an application designed to help create sustainable, native landscape designs based on specific environmental conditions in Fayetteville, AR (72704). The tool considers factors such as water needs, soil structure, shade, topography, and other environmental parameters to recommend appropriate native plants for your landscape.

## Features

- **Site Creation**: Define your site's environmental characteristics including dimensions, soil type, sun exposure, and water conditions
- **Plant Database**: Browse, filter, and manage a database of native plants suitable for the Fayetteville area
- **Design Generation**: Algorithmically generate landscape designs based on your site's specific conditions
- **Visualization**: View visual representations of your site conditions and generated designs
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

### Creating a Site

1. From the home page, click on "Create Site"
2. Fill in the site details:
   - **Basic Information**: Name your site
   - **Location**: The default coordinates are set for Fayetteville, AR (72704)
   - **Dimensions**: Specify the width and length of your site in feet
   - **Soil Characteristics**: Select soil type and pH
   - **Sun Exposure**: Estimate the square footage of different sun exposure types
   - **Water Conditions**: Estimate the square footage of different water conditions
   - **Additional Information**: Specify hardiness zone and any special conditions

3. Click "Create Site" to save your site information
4. View the generated site conditions visualization

### Generating a Design

1. After creating a site, click "Generate Design"
2. The system will analyze your site conditions and select appropriate native plants
3. View the generated design visualization and statistics
4. Review the plant selections recommended for your site

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
│   ├── frontend/         # User interface components
│   ├── backend/          # Server-side logic
│   ├── models/           # Data models and algorithms
│   │   ├── plant.py      # Plant model
│   │   ├── site.py       # Site model
│   │   └── design_algorithm.py # Design generation algorithm
│   ├── utils/            # Utility functions
│   │   └── visualizer.py # Visualization component
│   ├── ui/               # User interface
│   │   ├── app.py        # Flask application
│   │   └── templates/    # HTML templates
│   │       ├── index.html       # Home page
│   │       ├── site_form.html   # Site creation form
│   │       ├── plant_database.html # Plant database view
│   │       └── designs.html     # Designs view
│   └── config.py         # Configuration settings
├── data/                 # Data files
│   ├── climate/          # Climate data for Fayetteville, AR
│   ├── soil/             # Soil data from USDA NRCS
│   ├── plants/           # Plant database information
│   └── designs/          # Saved designs and visualizations
├── docs/                 # Documentation
│   └── development_roadmap.md # Development roadmap
└── tests/                # Test files
```

## Technical Details

### Core Components

1. **Data Models**:
   - `Plant`: Represents plant species with attributes like water needs, sun requirements, and soil preferences
   - `Site`: Represents a physical location with environmental characteristics
   - `DesignAlgorithm`: Matches plants to appropriate locations based on compatibility

2. **Visualization**:
   - Uses matplotlib to create visual representations of sites and designs
   - Generates heatmaps for sun exposure and water conditions
   - Places plant markers based on compatibility and design principles

3. **User Interface**:
   - Flask-based web application
   - Responsive Bootstrap frontend
   - Interactive forms and visualizations
   - RESTful API endpoints for data operations

### Algorithm

The design algorithm works by:

1. Filtering plants by basic compatibility with the site
2. Dividing the site into zones based on environmental conditions
3. Scoring plants for each zone based on compatibility and design factors
4. Selecting top-scoring plants for each zone while maintaining diversity
5. Calculating appropriate quantities based on plant spread and zone area
6. Generating design statistics including native percentage and biodiversity score

## Future Development

As outlined in the development roadmap, future enhancements may include:

1. Topography analysis and water flow modeling
2. Microclimate detection and modeling
3. Plant community and companion planting recommendations
4. Seasonal visualization options
5. Water usage calculation and optimization
6. Climate change adaptation strategies
7. Integration with external tools and services

## Troubleshooting

If you encounter issues:

1. Ensure all dependencies are installed
2. Check that the data directories exist and have appropriate permissions
3. Verify that the plant database contains entries
4. Check the log files for error messages

## Contact

For more information or assistance, please contact the project maintainer.
