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
import { basemapLayers } from "@/requests/requests";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { geoServerBaseUrl } from "@/requests/requests";


function Newmap() {
    const [map, setMap] = useState<Map | undefined>();  // Specify the type using a generic type argument
    const mapElement = useRef(null);
    const mapRef = useRef<Map | undefined>(undefined);
    mapRef.current = map;
    const [overlayData, setOverlayData] = useState<any>([]);
    const [basemapData, setbasemapData] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await overlays;
            setOverlayData(data);

            const baseData = await basemapLayers;
            setbasemapData(baseData)

          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        fetchData(); 
      }, []);
      console.log(overlayData)
      // const overlayNames = overlayData.map(dataItem => dataItem.name);
      // const overlayTitles = overlayData.map(dataitem => dataitem.displayName)
      // console.log(overlayNames)
      
      useEffect(() => {
        if (!mapElement.current || !overlayData || overlayData.length === 0 ||!basemapData || basemapData.length === 0) return;

          // const overlayLayers = overlayData.map((dataItem: any, index: number) => {
          //   const overlayLayer = new VectorTileLayer({
          //     title: dataItem.displayName,
          //     visible: true,
          //     preload: Infinity,
          //     source: new VectorTileSource({
          //       maxZoom: 18,
          //       url: geoServerBaseUrl +"/geoserver/gwc/service/tms/1.0.0/" +
          //       dataItem.name +
          //       "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                
          //     })
          //   }as BaseLayerOptions);
          //   return overlayLayer;
          // });

          const overlayLayers = overlayData.map((dataItem: any, index: number) => {
            const overlayLayer = new TileLayer({
              title: dataItem.displayName,
              source: new TileWMS({
                url: 'http://4.221.32.87:8080/geoserver/wms',
                params: {
                  'LAYERS': dataItem.name, // Set the 'LAYERS' param using dataItem.name
                  // Add other params here if needed
                },
                serverType: 'geoserver',
                transition: 0,
              })
            }as BaseLayerOptions);
            return overlayLayer;
          });

          const basemapLayers = basemapData.map((baseItem: any, index: number) => {
            const basemapLayer = new VectorTileLayer({
              title: baseItem.displayName,
              visible: true,
              preload: Infinity,
              source: new VectorTileSource({
                maxZoom: 18,
                url: geoServerBaseUrl +
                "/geoserver/gwc/service/tms/1.0.0/" +
                baseItem.name +
                "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                
              })
            }as BaseLayerOptions);
            return basemapLayer;
          });
      
          const overlay = new LayerGroup({
            title: "Overlays",
            layers: overlayLayers,
          } as GroupLayerOptions);

          const baseMaps = new LayerGroup({
            title: "Base Maps",
            layers: basemapLayers,
          } as GroupLayerOptions);
      
          if (mapRef.current) {
            mapRef.current.addLayer(overlay);
          }
        
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
    }, [overlayData, basemapData]);

    return <div style={{ height: 'calc(100vh - 120px)' }} ref={mapElement} id="map-container" />;
}

export default Newmap;

