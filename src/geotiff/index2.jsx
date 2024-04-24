/**
 * @format
 * */

import React, { Component } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { fromArrayBuffer, Pool } from "geotiff";
import { getStats } from "geotiff-stats";
import ImageLayer from "ol/layer/Image.js";
import ImageStatic from "ol/source/ImageStatic.js";
import "ol/ol.css";
import "./index.css";

export default class App extends Component {
  state = {
    _map: null,
  };
  async getInfo(image) {
    const stats = await getStats(image);
    console.log("🚀 ~ file: index2.jsx ~ line 46 ~ App ~ stats", stats);
  }
  loadGeoTiff() {
    const { _map: map } = this.state;
    let width, height, extent;
    fetch("./data/image.tif")
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (arrayBuffer) {
        return fromArrayBuffer(arrayBuffer);
      })
      .then(function (tiff) {
        return tiff.getImage();
      })
      .then(function (image) {
        width = image.getWidth();
        height = image.getHeight();
        extent = image.getBoundingBox();
        console.log(width, height, extent, image.getGDALMetadata());
        // getInfo(image);
        const pool = new Pool();
        return image.readRGB({ pool });
      })
      .then(function (rgb) {
        console.log(5);
        // if(width > 1000){
        //   console.log(5);
        //   return;
        // }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        const data = context.getImageData(0, 0, width, height);
        const rgba = data.data;
        let j = 0;
        for (let i = 0; i < rgb.length; i += 3) {
          // @ts-ignore
          rgba[j] = rgb[i];
          // @ts-ignore
          rgba[j + 1] = rgb[i + 1];
          // @ts-ignore
          rgba[j + 2] = rgb[i + 2];
          rgba[j + 3] = rgb[i + 3] === 0 ? 0 : 255;
          j += 4;
        }
        context.putImageData(data, 0, 0);
        map
          .getView()
          .setCenter([
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2,
          ]);
        map.addLayer(
          new ImageLayer({
            source: new ImageStatic({
              url: canvas.toDataURL(),
              projection: "EPSG:4326",
              imageExtent: extent,
            }),
          })
        );
      });
  }
  componentDidMount() {
    const map = new Map({
      layers: [],
      target: "map-container",
      view: new View({
        center: [105.53349951313653, 29.792499996410882],
        projection: "EPSG:4326",
        zoom: 10,
      }),
    });
    this.setState({
      _map: map,
    });
  }
  render() {
    return (
      <div>
        <div>
          <button onClick={this.loadGeoTiff.bind(this)}>加载</button>
        </div>
        <div id="map-container">地图</div>
      </div>
    );
  }
}
