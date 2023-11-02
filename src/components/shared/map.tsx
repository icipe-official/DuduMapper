import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import 'ol/ol.css';
import 'ol-ext/control/LayerSwitcher.css';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import SourceOSM from 'ol/source/OSM';

function Newmap() {
    const [map, setMap] = useState<Map | undefined>();  // Specify the type using a generic type argument
    const mapElement = useRef(null);
    const mapRef = useRef<Map | undefined>(undefined);
    mapRef.current = map;

    const osm = new TileLayer({
        source: new SourceOSM()
    });

    const baseMaps = new LayerGroup({
        layers: [osm]
    });

    useEffect(() => {
        if (!mapElement.current) return;

        const initialMap = new Map({
            target: mapElement.current,
            layers: [baseMaps],
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

