import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN;

const Map3d = (props) => {
    const client = props.client;
    const mapContainerRef = useRef(null);
    const [mapState, setMapState] = useState({
        lng: 139.75058388557693,
        lat: 35.66840472071193,
        zoom: 14,
        pitch: 0,
        bearing: 0
    });

    useEffect(
        () => {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y",
                center: [mapState.lng, mapState.lat],
                zoom: mapState.zoom,
            });
            map.on('load', function () {
                map.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                // add the DEM source as a terrain layer with exaggerated height
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

                // add a sky layer that will show when the map is highly pitched
                map.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'atmosphere',
                        'sky-atmosphere-sun': [0.0, 0.0],
                        'sky-atmosphere-sun-intensity': 15
                    }
                });
            });
            
            const handleEvt = () => {
                let s = {
                    lng: map.getCenter().lng,
                    lat: map.getCenter().lat,
                    zoom: map.getZoom(),
                    pitch: map.getPitch(),
                    bearing: map.getBearing()
                };
                setMapState(s);
                client.send(
                    JSON.stringify({
                        type: "message",
                        ...s,
                    })
                );
            }

            map.on("dragend", handleEvt);
            map.on("zoomend", handleEvt);
            map.on("rotateend", handleEvt);
            map.on("ptichend", handleEvt);

            client.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                console.log("From server: ", data);
        
                map.jumpTo({
                    center: [data.lng, data.lat],
                    zoom: data.zoom,
                    pitch: data.pitch,
                    bearing: data.bearing
                });
            };

            return () => map.remove();
        }, [])

    return (
        <div>
            <div className="sidebarStyle">
                LNG: {mapState.lng.toFixed(2)} |
                LAT: {mapState.lat.toFixed(2)} |
                Zoom: {mapState.zoom.toFixed(2)} |
                Pitch: {mapState.pitch.toFixed(2)} |
                Bearing: {mapState.bearing.toFixed(2)}
            </div>
            <div ref={mapContainerRef} className='mapContainer' />

        </div>
    );
}

export default Map3d;