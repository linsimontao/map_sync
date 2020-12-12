import './App.css';
import { router, w3cwebsocket as W3CWebsocket } from "websocket";
import Map from './Map.js'
import Map3d from './Map3dTerrain.js'

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const client = new W3CWebsocket("ws://127.0.0.1:8000");

function App() {
  useEffect(() => {
    client.onopen = () => {
      console.log("client: connected");
    };
    return () => {
      client.close();
    }
  }, [])

  return (
    <Router>
      < div className="App" >
        <Route path="/" exact render={() => <Map client={client} />} />
        <Route path="/3d" exact render={() => <Map3d client={client} />} />
      </div >
    </Router>
  );
}

export default App;
