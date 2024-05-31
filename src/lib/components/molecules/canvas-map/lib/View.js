import { sizeMinusPadding, scaleSize, scalePadding } from "./util/size"
import { bboxFeature } from "./util/bboxFeature"
import { ZoomTransform } from "d3-zoom"

export class View {
  constructor({ projection, extent, minZoom, maxZoom, padding }) {
    projection.revision = 0
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

    if (previousSize !== size) {
      const [width, height] = this.mapSize
      const { left, top } = this.scaledPadding

      this.projection.fitExtent(
        [
          [left, top],
          [width, height],
        ],
        bboxFeature(this.extent),
      )
      ++this.projection.revision
    }
  }

  get viewPortSize() {
    return this._viewPortSize
  }

  set transform(transform) {
    this._transform = transform
  }

  get transform() {
    return new ZoomTransform(this._transform.k, this._transform.x * this.pixelRatio, this._transform.y * this.pixelRatio)
  }

  // map size in pixels (i.e. scaled by device pixel ratio)
  get mapSize() {
    return sizeMinusPadding(scaleSize(this.viewPortSize, this.pixelRatio), this.scaledPadding)
  }

  // padding in pixels (i.e. scaled by device pixel ratio)
  get padding() {
    return this._padding
  }

  get scaledPadding() {
    const scaledPadding = { ...this._padding }
    return scalePadding(scaledPadding, this.pixelRatio)
  }

  // defines the upper and lower limits for zoom behaviour
  get scaleExtent() {
    return [this.minZoom, this.maxZoom]
  }

  fitObject(geoJSON) {
    const [width, height] = this.mapSize
    const { left, top } = this.scaledPadding

    this.projection.fitExtent(
      [
        [left, top],
        [width, height],
      ],
      geoJSON,
    )

    ++this.projection.revision
  }

  // visible extent in map coordinates
  getVisibleExtent(transform, projection) {
    const [width, height] = this.mapSize
    const southWest = projection.invert(transform.invert([0, height]))
    const northEast = projection.invert(transform.invert([width, 0]))
    return [southWest[0], southWest[1], northEast[0], northEast[1]]
  }

  getState() {
    const transform = this.transform
    const projection = this.projection

    return {
      transform,
      projection,
      pixelRatio: this.pixelRatio,
      padding: this.padding,
      sizeInPixels: scaleSize(this.viewPortSize, this.pixelRatio),
      visibleExtent: this.getVisibleExtent(transform, projection),
    }
  }
}
