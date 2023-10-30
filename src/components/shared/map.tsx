import React, { useEffect, useRef, useState } from "react";
import { Map, View} from "ol";
import OSM from 'ol/source/OSM';
import TileLayer from "ol/layer/Tile";
import 'ol/ol.css';

function Newmap(){
    const [map, setMap] = useState();
    const mapElement = useRef(null);
    const mapRef = useRef();
    mapRef.current = map;



    useEffect(() =>{
        if (!mapElement.current) return;
        const initialMap:any = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 4
            })
        })
        
        setMap(initialMap);
    }, [])

    return <div  style={{ height: 'calc(100vh - 120px)' }} ref={mapElement} className="map-container" />;
}
export default Newmap;

