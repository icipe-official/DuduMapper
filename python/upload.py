import requests
from geo.Geoserver import Geoserver

# Initialize connection to GeoServer
geo = Geoserver('http://localhost:8080/geoserver', username='dudumapper', password='dudumapper@01')

workspace_name = 'dudu'
layer_name = 'PlanetDEM_1s_Dubai'
tif_path = '/home/kelvin/Downloads/PlanetDEM_1s_Dubai/PlanetDEM_1s_Dubai.tif'

try:
    
        # Check and create workspace if it doesn't exist
    workspaces_data = geo.get_workspaces()
    workspaces = [ws['name'] for ws in workspaces_data['workspaces']['workspace']]

    if workspace_name not in workspaces:
        print(f"Workspace '{workspace_name}' not found. Creating it...")
        response = geo.create_workspace(workspace=workspace_name)
        print(f"Workspace '{workspace_name}' created.")
    else:
        print(f"Workspace '{workspace_name}' already exists.")

    # Upload the TIFF file as a coverage store
    print(f"Uploading TIFF '{layer_name}' to workspace '{workspace_name}'...")
    geo.create_coveragestore(
        layer_name=layer_name,
        path=tif_path,
        workspace=workspace_name
    )

    print("Upload complete.")

    #delete layer
    #geo.delete_layer(layer_name = layer_name, workspace = workspace_name)
    #delete storename
    #geo.delete_store(layer_name = layer_name, workspace = workspace_name)




except requests.exceptions.HTTPError as http_err:
    print(f"HTTP error occured: {http_err} - {http_err.response.text}")
except Exception as e:
    print(f" Error: {e}")
