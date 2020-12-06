import React, { Component } from "react";
import ReactDom from "react-dom";
import mapboxgl from "mapbox-gl";
import { w3cwebsocket as W3CWebsocket } from "websocket";

const client = new W3CWebsocket("ws://127.0.0.1:8000");

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN;

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: 139.75058388557693,
      lat: 35.66840472071193,
      zoom: 14,
      pitch: 0,
      bearing: 0
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });

    const handleEvt = () => {
      let s = {
        lng: map.getCenter().lng,
        lat: map.getCenter().lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      };
      this.setState(s);
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

    client.onopen = () => {
      console.log("client: connected");
    };

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
  }
  render() {
    return (
      <div>
        <div className="sidebarStyle">
          LNG: {this.state.lng.toFixed(2)} | 
          LAT: {this.state.lat.toFixed(2)} | 
          Zoom: {this.state.zoom.toFixed(2)} |
          Pitch: {this.state.pitch.toFixed(2)} |
          Bearing: {this.state.bearing.toFixed(2)}
        </div>
        <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
      </div>
    );
  }
}

ReactDom.render(<Application />, document.getElementById("root"));
