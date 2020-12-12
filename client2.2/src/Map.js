import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import StylesControl from './mapbox-gl-controls/styles';
import './mapbox-gl-controls/styles.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN;

const Map = (props) => {
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
                style: "mapbox://styles/mapbox/streets-v11",
                center: [mapState.lng, mapState.lat],
                zoom: mapState.zoom,
            });
            map.addControl(new StylesControl(), 'top-right')
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

export default Map;