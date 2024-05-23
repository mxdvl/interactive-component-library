import { sizeMinusPadding, scaleSize } from "./util/size"
import { bboxFeature } from "./util/bboxFeature"

export class View {
  constructor({ projection, extent, minZoom, maxZoom, padding }) {
    this.projection = projection
    this.extent = extent
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.padding = padding
    this.pixelRatio = window.devicePixelRatio
  }

  set viewPortSize(size) {
    const previousSize = this._viewPortSize
    this._viewPortSize = size

    if (!previousSize) {
      // fit projection to extent when size is first set
      const mapSize = this.mapSize
      this.projection.fitExtent(
        [
          [this.padding.left, this.padding.top],
          [mapSize.width, mapSize.height],
        ],
        bboxFeature(this.extent),
      )
    }
  }

  get mapSize() {
    return sizeMinusPadding(this._viewPortSize, this.padding)
  }

  get scaleExtent() {
    return [this.minZoom, this.maxZoom]
  }

  getState() {
    const [[minX, minY], [maxX, maxY]] = this.extent
    return {
      projection: this.projection,
      sizeInPixels: scaleSize(this._viewPortSize, this.pixelRatio),
      extent: [minX, minY, maxX, maxY],
    }
  }
}
