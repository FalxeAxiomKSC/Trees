# Native Landscape Design Tool

An interactive landscape design tool with a hand-drawn aesthetic that creates native plant designs based on environmental factors including water needs, soil structure, shade, topography, and other site conditions. This tool focuses on native plants for the Fayetteville, AR (72704) area.

## Project Overview

This tool helps users create sustainable, native landscape designs through:

- Interactive map-based location selection with polygon drawing
- Automatic environmental data retrieval from authoritative sources
- Hand-drawn landscape architecture aesthetic
- Intelligent plant placement with environmental compatibility checking
- Companion plant recommendations based on selected species

## Key Features

### Map-Based Location Selection
- Draw polygons to define exact site boundaries
- Automatically retrieve environmental data for the selected location
- Visualize soil, sun exposure, and water conditions

### Hand-Drawn Aesthetic
- Professional landscape architecture drawing style
- Sketched UI elements (buttons, cards, containers)
- Paper-like textures and hand-drawn borders

### Interactive Plant Placement
- Designate plants as "fixed" to prevent removal
- Intelligent shifting of plants to maintain spacing
- Environmental compatibility checking with error warnings
- Visual feedback for plant interactions

### Environmental Data Integration
- USDA NRCS soil information
- NOAA climate data
- Hardiness zone determination
- Sun exposure and water condition mapping

## Data Sources

The tool integrates data from multiple authoritative sources:

- USDA NRCS (Natural Resources Conservation Service)
  - Ecological sites information
  - Soil classifications
  - PLANTS Database
- NOAA climate data
- Missouri Botanical Garden Plant Finder
- Fayetteville AR drainage manual (Appendices B, C, D, F)
- Local university agricultural and botanical data

## Project Structure

```
landscape-design-tool/
├── src/                  # Source code
│   ├── ui/               # User interface components
│   │   ├── static/       # CSS, JavaScript, and images
│   │   └── templates/    # HTML templates
│   ├── models/           # Data models and algorithms
│   └── utils/            # Utility functions and services
├── data/                 # Data files
│   ├── climate/          # Climate data for Fayetteville, AR
│   ├── soil/             # Soil data from USDA NRCS
│   ├── plants/           # Plant database information
│   └── designs/          # Saved landscape designs
├── docs/                 # Documentation
│   ├── development_roadmap.md      # Project development plan
│   ├── user_guide.md               # User instructions
│   └── visual_redesign_documentation.md  # Visual design documentation
└── tests/                # Test files
    └── visual_redesign_tests.js    # Tests for visual components
```

## Current Status

This project has completed several major development phases:

1. ✅ Project setup and foundation
2. ✅ Environmental data integration
3. ✅ Map-based location selection
4. ✅ Hand-drawn landscape architecture aesthetic
5. ✅ Interactive plant placement system
6. ✅ Testing and documentation

The tool is now functional with all core features implemented.

## Getting Started

### Prerequisites
- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+)
- Node.js and npm (for development)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/FalxeAxiomKSC/Trees.git
   cd Trees
   ```

2. Install dependencies:
   ```
   pip install flask matplotlib numpy
   ```

3. Run the application:
   ```
   python src/ui/app.py
   ```

4. Access the interface at: http://localhost:5000

## Usage

1. **Create a Site**:
   - Click "Create Site" from the home page
   - Use the map to search for a location
   - Draw a polygon to define your site boundary
   - Review the environmental data and click "Use This Data"

2. **Design Your Landscape**:
   - Add plants from the palette by dragging them onto the canvas
   - Double-click plants to fix them in place
   - Review environmental compatibility warnings
   - Add recommended companion plants

3. **Save and Share**:
   - Save your design for future editing
   - Export designs as images (coming soon)
   - Share designs with others (coming soon)

## Future Development

Planned enhancements include:
- Seasonal visualization to show landscape changes throughout the year
- Additional plant species specific to Fayetteville, AR
- Export functionality for designs (PDF, images)
- Collaboration features for sharing designs

## License

[License information to be added]

## Contact

[Contact information to be added]
