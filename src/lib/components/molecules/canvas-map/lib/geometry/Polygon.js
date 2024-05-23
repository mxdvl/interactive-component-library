import { memoise } from "../util/memoise"

export class Polygon {
  constructor({ type = "Polygon", extent, coordinates }) {
    this.type = type
    this.extent = extent
    this.coordinates = coordinates

    this.getProjected = memoise(this._getProjected).bind(this)
  }

  _getProjected(projection) {
    return {
      type: this.type,
      coordinates: [this.coordinates.map((point) => projection(point))],
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
