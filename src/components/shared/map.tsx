import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import 'ol/ol.css';
import 'ol-ext/control/LayerSwitcher.css';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import SourceOSM from 'ol/source/OSM';
import { ImageWMS, TileWMS } from 'ol/source';
import { makeStyles } from "@mui/material";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import OSM from "ol/source/OSM";
import { overlays } from "@/requests/requests";


function Newmap() {
    const [map, setMap] = useState<Map | undefined>();  // Specify the type using a generic type argument
    const mapElement = useRef(null);
    const mapRef = useRef<Map | undefined>(undefined);
    mapRef.current = map;
    const [overlayData, setOverlayData] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await overlays;
            setOverlayData(data);
            
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
    
        fetchData();
      }, []);
    
    const osm = new TileLayer({
        title: "OSM",
        type: "base",
        visible: true,
        source: new OSM(),
      } as BaseLayerOptions);

      const overlayNames = overlayData.map(dataItem => dataItem.name);
      const overlayTitles = overlayData.map(dataitem => dataitem.displayName)
      console.log(overlayTitles)
    
    const overLays =  new TileLayer({
        title: 'overlay',
        source: new TileWMS({
            
            url: 'http://4.221.32.87:8080/geoserver/wms',
            params: {'LAYERS': ['basemap:rivers_lake_centerlines', 'basemap:glaciated_areas'] },
            serverType: 'geoserver',
            transition: 0,
        })
    }as BaseLayerOptions)

    const baseMaps = new LayerGroup({
        title: "Base Maps",
        layers: [osm,overLays],
      } as GroupLayerOptions);
    
    const overlay = new LayerGroup({
        title: "overlays",
        layers: [overLays]
    } as GroupLayerOptions)

    useEffect(() => {
        if (!mapElement.current) return;

        const initialMap = new Map({
            target: mapElement.current,
            layers: [baseMaps, overlay],
            view: new View({
                center: [0, 0],
                zoom: 4
            })
        });

        const layerSwitcher = new LayerSwitcher();
        initialMap.addControl(layerSwitcher);

        setMap(initialMap);
    }, []);

    return <div style={{ height: 'calc(100vh - 120px)' }} ref={mapElement} className="map-container" />;
}

export default Newmap;

