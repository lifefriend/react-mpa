/** @format */

import React, { Component } from 'react';
import 'ol/ol.css';
import './index.css';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';

export default class App extends Component {
  componentDidMount() {
    const source = new GeoTIFF({
      sources: [
        {
          url: './data/image.tif',
        },
      ],
    });

    const layer = new TileLayer({
      style: {
        variables: {
          red: 172,
          redMax: 256,
          green: 0,
          greenMax: 256,
          blue: 36,
          blueMax: 256,
        },
        color: ['array', ['/', ['band', ['var', 'red']], ['var', 'redMax']], ['/', ['band', ['var', 'green']], ['var', 'greenMax']], ['/', ['band', ['var', 'blue']], ['var', 'blueMax']], 1],
      },
      source: source,
    });

    const map = new Map({
      target: 'map-container',
      layers: [layer],
      view: source.getView(),
    });

    console.log('🚀 ~ file: ol.jsx ~ line 35 ~ App ~ componentDidMount ~ map', map);
  }
  render() {
    return <div id='map-container'>地图</div>;
  }
}
