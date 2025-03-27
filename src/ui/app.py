"""
User interface module for Native Landscape Design Tool

This module provides a simple web-based user interface for the landscape design tool
using Flask and HTML/CSS/JavaScript.
"""

import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
import sys
import logging

# Add parent directory to path to import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models and utilities
from models.site import Site
from models.plant import Plant
from models.design_algorithm import DesignAlgorithm
from utils.visualizer import DesignVisualizer
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ui.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'),
            template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'))

# Initialize components
design_algorithm = DesignAlgorithm(config.ALGORITHM_WEIGHTS)
visualizer = DesignVisualizer()

# Load plant database
plant_database = []
try:
    plant_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                             "data/plants/plant_database.json")
    if os.path.exists(plant_file):
        with open(plant_file, 'r') as f:
            plants_data = json.load(f)
        
        for plant_data in plants_data:
            plant_database.append(Plant.from_dict(plant_data))
        
        logger.info(f"Loaded {len(plant_database)} plants from database")
    else:
        logger.warning("Plant database file not found. Starting with empty database.")
except Exception as e:
    logger.error(f"Error loading plant database: {e}")

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/site_form')
def site_form():
    """Render the site input form."""
    return render_template('site_form.html')

@app.route('/plant_database')
def plant_database_view():
    """Render the plant database view."""
    return render_template('plant_database.html', plants=plant_database)

@app.route('/designs')
def designs_view():
    """Render the designs view."""
    designs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                              "data/designs")
    designs = []
    
    if os.path.exists(designs_dir):
        for filename in os.listdir(designs_dir):
            if filename.endswith('.json'):
                designs.append(filename)
    
    return render_template('designs.html', designs=designs)

@app.route('/api/create_site', methods=['POST'])
def create_site():
    """API endpoint to create a site."""
    try:
        site_data = request.json
        site = Site.from_dict(site_data)
        
        # Visualize site conditions
        vis_filename = f"site_conditions_{site.name.replace(' ', '_').lower()}.png"
        vis_path = visualizer.visualize_site_conditions(site.to_dict(), vis_filename)
        
        # Save site data
        site_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                "data/designs", f"site_{site.name.replace(' ', '_').lower()}.json")
        with open(site_file, 'w') as f:
            json.dump(site.to_dict(), f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Site created successfully",
            "site_name": site.name,
            "visualization": os.path.basename(vis_path)
        })
    except Exception as e:
        logger.error(f"Error creating site: {e}")
        return jsonify({
            "success": False,
            "message": f"Error creating site: {str(e)}"
        }), 500

@app.route('/api/generate_design', methods=['POST'])
def generate_design():
    """API endpoint to generate a design."""
    try:
        data = request.json
        site_name = data.get('site_name')
        
        # Load site data
        site_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                "data/designs", f"site_{site_name.replace(' ', '_').lower()}.json")
        
        if not os.path.exists(site_file):
            return jsonify({
                "success": False,
                "message": f"Site not found: {site_name}"
            }), 404
        
        with open(site_file, 'r') as f:
            site_data = json.load(f)
        
        site = Site.from_dict(site_data)
        
        # Generate design
        design = design_algorithm.generate_design(site, plant_database)
        
        # Visualize design
        vis_filename = f"design_{site.name.replace(' ', '_').lower()}.png"
        vis_path = visualizer.visualize_design(design, vis_filename)
        
        # Save design data
        design_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                  "data/designs", f"design_{site.name.replace(' ', '_').lower()}.json")
        with open(design_file, 'w') as f:
            json.dump(design, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Design generated successfully",
            "design_name": f"design_{site.name.replace(' ', '_').lower()}",
            "visualization": os.path.basename(vis_path),
            "statistics": design["statistics"]
        })
    except Exception as e:
        logger.error(f"Error generating design: {e}")
        return jsonify({
            "success": False,
            "message": f"Error generating design: {str(e)}"
        }), 500

@app.route('/api/add_plant', methods=['POST'])
def add_plant():
    """API endpoint to add a plant to the database."""
    try:
        plant_data = request.json
        plant = Plant.from_dict(plant_data)
        plant_database.append(plant)
        
        # Save plant database
        plant_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                 "data/plants/plant_database.json")
        plants_data = [p.to_dict() for p in plant_database]
        
        with open(plant_file, 'w') as f:
            json.dump(plants_data, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Plant added successfully",
            "plant_name": plant.scientific_name
        })
    except Exception as e:
        logger.error(f"Error adding plant: {e}")
        return jsonify({
            "success": False,
            "message": f"Error adding plant: {str(e)}"
        }), 500

@app.route('/visualizations/<path:filename>')
def visualizations(filename):
    """Serve visualization files."""
    vis_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          "data/designs/visualizations")
    return send_from_directory(vis_dir, filename)

@app.route('/api/designs/<path:filename>')
def get_design(filename):
    """API endpoint to get a design."""
    try:
        design_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                  "data/designs", filename)
        
        if not os.path.exists(design_file):
            return jsonify({
                "success": False,
                "message": f"Design not found: {filename}"
            }), 404
        
        with open(design_file, 'r') as f:
            design_data = json.load(f)
        
        return jsonify({
            "success": True,
            "design": design_data
        })
    except Exception as e:
        logger.error(f"Error getting design: {e}")
        return jsonify({
            "success": False,
            "message": f"Error getting design: {str(e)}"
        }), 500

def run_app(debug=True, port=5000):
    """Run the Flask application."""
    app.run(debug=debug, host='0.0.0.0', port=port)

if __name__ == '__main__':
    run_app()
