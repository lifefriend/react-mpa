/**
 * @format 推荐
 * */

import React, { Component } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { fromArrayBuffer, Pool } from "geotiff";
import ImageLayer from "ol/layer/Image.js";
import ImageStatic from "ol/source/ImageStatic.js";
import "ol/ol.css";
import "./index.css";

export default class App extends Component {
  state = {
    _map: null,
  };
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
        const pool = new Pool();
        return image.readRasters({ pool });
      })
      .then(function (rgb) {
        // @ts-ignore
        const [red = [], green = red, blue = red] = rgb;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        let imageData = ctx.createImageData(width, height);
        console.time("写入像素");
        for (var i = 0; i < imageData.data.length / 4; i += 1) {
          imageData.data[i * 4 + 0] = red[i] * 50;
          imageData.data[i * 4 + 1] = (green[i] || 0) * 50;
          imageData.data[i * 4 + 2] = (blue[i] || 0) * 50;
          imageData.data[i * 4 + 3] = red[i] === 0 ? 0 : 255;
        }
        ctx.putImageData(imageData, 0, 0);
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
