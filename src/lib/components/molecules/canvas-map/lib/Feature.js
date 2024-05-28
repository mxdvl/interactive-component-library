import { createUid } from "./util/uid"
import { combineExtents } from "./util/extent"

export class Feature {
  constructor({ id, geometries, properties, style }) {
    this.id = id
    this.geometries = geometries
    this.properties = properties
    this.style = style

    // create a unique ID for this feature
    this.uid = createUid()

    this._projectedGeometry = null
  }

  getExtent() {
    return this.geometries.reduce((combinedExtent, geometry) => {
      if (!combinedExtent) return geometry.extent
      return combineExtents(geometry.extent, combinedExtent)
    }, null)
  }

  getProjectedGeometries(projection) {
    return this.geometries.map((d) => d.getProjected(projection))
  }
}
