import { memoise } from "../util/memoise"

export class Polygon {
  constructor({ type = "Polygon", extent, coordinates }) {
    this.type = type
    this.extent = extent
    this.coordinates = coordinates

    this.getProjected = memoise(this._getProjected).bind(this)
  }

  _getProjected(projection) {
    const projected = []
    const rings = this.coordinates
    for (const ring of rings) {
      const projectedRing = []
      for (const point of ring) {
        projectedRing.push(projection(point))
      }
      projected.push(projectedRing)
    }

    return {
      type: this.type,
      coordinates: projected, //[this.coordinates.map((point) => projection(point))],
    }
  }

  getGeoJSON() {
    return {
      type: this.type,
      coordinates: this.coordinates,
    }
  }
}

// FIXME: implement simplification?

// const { flatCoordinates, stride, ends } = this._flattenCoordinates(coordinates)
// this.flatCoordinates = flatCoordinates
// this.stride = stride
// this.ends = ends

// _flattenCoordinates() {
//   let flatCoordinates = []
//    const ends = deflateCoordinatesArray(
//     flatCoordinates,
//     0,
//     coordinates,
//     this.stride,
//     this.ends_,
//   );
//   this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
// }
