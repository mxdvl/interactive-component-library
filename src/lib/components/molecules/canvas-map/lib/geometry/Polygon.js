export class Polygon {
  constructor({ type = "Polygon", extent, coordinates }) {
    this.type = type
    this.extent = extent
    this.coordinates = coordinates
  }

  simplifyTransformed(squaredTolerance, transform) {
    return this.simplifyTransformedInternal(squaredTolerance, transform)
  }
}
