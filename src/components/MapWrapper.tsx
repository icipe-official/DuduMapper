import React, {useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import farms from "@/api/farms.json";
import {transform} from "ol/proj";

function MapWrapper() {

    // set intial state
    const [map, setMap] = useState<Map | undefined>()
    const [featuresLayer, setFeaturesLayer] = useState<VectorLayer<any> | undefined>()
    const [selectedCoord, setSelectedCoord] = useState<number[] | undefined>()

    // pull refs
    const mapElement = useRef<HTMLDivElement | undefined>()

    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef<Map>()
    mapRef.current = map

    // initialize map on first render - logic formerly put into componentDidMount
    useEffect(() => {

        // create and add vector source layer
        const initalFeaturesLayer = new VectorLayer({
            source: new VectorSource()
        })

        // create map
        const initialMap : Map | undefined = new Map({
            target: mapElement.current,
            layers: [

                // USGS Topo
                new TileLayer({
                    source: new XYZ({
                        url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                    })
                }),

                // Google Maps Terrain
                /* new TileLayer({
                  source: new XYZ({
                    url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                  })
                }), */

                initalFeaturesLayer

            ],
            view: new View({
                projection: 'EPSG:3857',
                center: [0, 0],
                zoom: 2
            }),
            controls: []
        })

        // set map onclick handler
        initialMap.on('click', handleMapClick)

        // save map and vector layer references to state
        setMap(initialMap)
        setFeaturesLayer(initalFeaturesLayer)
        //return () => initialMap.setTarget(null)
    }, [])

    // update map if features prop changes - logic formerly put into componentDidUpdate
    useEffect(() => {

        if (farms.features.length) { // may be null on first render

            // set features to map
            featuresLayer?.setSource(
                new VectorSource({
                    features: farms.features // make sure features is an array
                })
            )

            // fit map to feature extent (with 100px of padding)
            map?.getView().fit(featuresLayer?.getSource().getExtent(), {
                padding: [100, 100, 100, 100]
            })

        }

    }, [farms.features])

    // map click handler
    const handleMapClick = (event) => {

        // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
        //  https://stackoverflow.com/a/60643670
        if (mapRef.current instanceof Map) {
            const clickedCoord = mapRef.current.getFeaturesAtPixel(event.pixel)!;

            // transform coord to EPSG 4326 standard Lat Long
            const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

            // set React state
            setSelectedCoord(transormedCoord)

            console.log(selectedCoord)
        }


    }

    // render component
    return (
        <div className="map-container"></div>
    )

}

export default MapWrapper