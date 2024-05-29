import { sizeMinusPadding, scaleSize, scalePadding } from "./util/size"
import { bboxFeature } from "./util/bboxFeature"

export class View {
  constructor({ projection, extent, minZoom, maxZoom, padding }) {
    this.projection = projection
    // extent in projection coordinates
    this.extent = extent
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this._padding = padding
    this.pixelRatio = window.devicePixelRatio
  }

  set viewPortSize(size) {
    const previousSize = this._viewPortSize
    this._viewPortSize = size

    if (!previousSize) {
      const mapSize = this.mapSize
      const padding = this.padding
      this.projection.fitExtent([[padding.left, padding.top], mapSize], bboxFeature(this.extent))
    }
  }

  get viewPortSize() {
    return this._viewPortSize
  }

  set transform(transform) {
    this._transform = transform
  }

  get transform() {
    return {
      k: this._transform.k,
      x: this._transform.x * this.pixelRatio,
      y: this._transform.y * this.pixelRatio,
    }
  }

  // map size in pixels (i.e. scaled by device pixel ratio)
  get mapSize() {
    return sizeMinusPadding(scaleSize(this.viewPortSize, this.pixelRatio), this.padding)
  }

  // padding in pixels (i.e. scaled by device pixel ratio)
  get padding() {
    return scalePadding(this._padding, this.pixelRatio)
  }

  // defines the upper and lower limits for zoom behaviour
  get scaleExtent() {
    return [this.minZoom, this.maxZoom]
  }

  getState() {
    const [[minX, minY], [maxX, maxY]] = this.extent
    return {
      transform: this.transform,
      projection: this.projection,
      sizeInPixels: scaleSize(this.viewPortSize, this.pixelRatio),
      extent: [minX, minY, maxX, maxY],
    }
  }
}
