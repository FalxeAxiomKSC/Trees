import os
import json
import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for
from src.utils.environmental_data_service import EnvironmentalDataService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.debug = True

# Initialize environmental data service
env_data_service = EnvironmentalDataService()

# Data paths
PLANTS_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'plants', 'plant_database.json')
DESIGNS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'designs')
VISUALIZATIONS_PATH = os.path.join(DESIGNS_PATH, 'visualizations')

# Ensure directories exist
os.makedirs(DESIGNS_PATH, exist_ok=True)
os.makedirs(VISUALIZATIONS_PATH, exist_ok=True)

# Load plant database
def load_plant_database():
    try:
        with open(PLANTS_DB_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.warning("Plant database file not found. Starting with empty database.")
        return []

# Save plant database
def save_plant_database(plants):
    with open(PLANTS_DB_PATH, 'w') as f:
        json.dump(plants, f, indent=2)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/site_form')
def site_form():
    # Use the new template with map integration
    return render_template('site_form_with_map.html')

@app.route('/create_site', methods=['POST'])
def create_site():
    # Process form data
    site_data = {
        'name': request.form.get('site_name'),
        'location': {
            'latitude': float(request.form.get('latitude')),
            'longitude': float(request.form.get('longitude'))
        },
        'dimensions': {
            'width': float(request.form.get('width')),
            'length': float(request.form.get('length')),
            'area': float(request.form.get('area'))
        },
        'soil_type': request.form.get('soil_type'),
        'soil_ph': float(request.form.get('soil_ph')),
        'sun_exposure': {
            'full_sun': float(request.form.get('full_sun') or 0),
            'part_sun': float(request.form.get('part_sun') or 0),
            'part_shade': float(request.form.get('part_shade') or 0),
            'full_shade': float(request.form.get('full_shade') or 0)
        },
        'water_conditions': {
            'dry': float(request.form.get('dry') or 0),
            'medium': float(request.form.get('medium') or 0),
            'wet': float(request.form.get('wet') or 0)
        },
        'hardiness_zone': request.form.get('hardiness_zone'),
        'special_conditions': request.form.getlist('special_conditions'),
        'notes': request.form.get('notes')
    }
    
    # Save site data
    site_filename = f"site_{site_data['name'].lower().replace(' ', '_')}.json"
    site_path = os.path.join(DESIGNS_PATH, site_filename)
    
    with open(site_path, 'w') as f:
        json.dump(site_data, f, indent=2)
    
    # Generate a design based on the site data
    # This would normally call the design algorithm
    # For now, we'll create a simple placeholder design
    design_data = {
        'site': site_data,
        'plant_selections': [],
        'statistics': {
            'total_plants': 0,
            'native_percentage': 0,
            'water_usage_score': 0,
            'maintenance_score': 0,
            'biodiversity_score': 0
        }
    }
    
    # Save design data
    design_filename = f"design_{site_data['name'].lower().replace(' ', '_')}.json"
    design_path = os.path.join(DESIGNS_PATH, design_filename)
    
    with open(design_path, 'w') as f:
        json.dump(design_data, f, indent=2)
    
    # Redirect to designs page
    return jsonify({'success': True, 'redirect': '/designs'})

@app.route('/plant_database')
def plant_database():
    plants = load_plant_database()
    return render_template('plant_database.html', plants=plants)

@app.route('/api/add_plant', methods=['POST'])
def add_plant():
    plant_data = request.json
    plants = load_plant_database()
    plants.append(plant_data)
    save_plant_database(plants)
    return jsonify({'success': True})

@app.route('/designs')
def designs():
    # Get list of design files
    design_files = [f for f in os.listdir(DESIGNS_PATH) if f.startswith('design_') and f.endswith('.json')]
    return render_template('designs.html', designs=design_files)

@app.route('/api/designs/<filename>')
def get_design(filename):
    try:
        with open(os.path.join(DESIGNS_PATH, filename), 'r') as f:
            design_data = json.load(f)
        return jsonify({'success': True, 'design': design_data})
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/environmental_data', methods=['POST'])
def get_environmental_data():
    """
    API endpoint to fetch environmental data for a location
    """
    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    polygon = data.get('polygon')
    
    # Use the environmental data service to get real data
    environmental_data = env_data_service.get_environmental_data(latitude, longitude, polygon)
    
    return jsonify({'success': True, 'data': environmental_data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
