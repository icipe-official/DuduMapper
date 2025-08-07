from flask import Flask, request, jsonify
from decouple import config
from geo.Geoserver import Geoserver
import os

app = Flask(__name__)

GEOSERVER_URL = config('GEOSERVER_URL')
GEOSERVER_USER = config('GEOSERVER_USER')
GEOSERVER_PASSWORD = config('GEOSERVER_PASSWORD')
GEOSERVER_WORKSPACE = config('GEOSERVER_WORKSPACE')

geo = Geoserver(GEOSERVER_URL, username=GEOSERVER_USER, password=GEOSERVER_PASSWORD)


@app.route('/upload', methods=['POST'])
def upload_raster():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    layer_name = request.form.get('layer_name')

    if not file or not layer_name:
        return jsonify({'error': 'Missing file or layer_name'}), 400

    file_path = os.path.join('/data', file.filename)
    file.save(file_path)

    try:
        geo.create_coveragestore(layer_name=layer_name, path=file_path, workspace=GEOSERVER_WORKSPACE)
        return jsonify({'message': 'Raster uploaded successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete', methods=['DELETE'])
def delete_layer():
    layer_name = request.args.get('layer_name')
    if not layer_name:
        return jsonify({'error': 'Missing layer_name'}), 400

    try:
        geo.delete_layer(layer_name=layer_name, workspace=GEOSERVER_WORKSPACE)
        return jsonify({'message': f'Layer {layer_name} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
