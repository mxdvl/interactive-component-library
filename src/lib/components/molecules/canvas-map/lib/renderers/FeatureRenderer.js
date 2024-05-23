import { geoPath } from "d3-geo"

export class FeatureRenderer {
  constructor() {
    this.drawingFunction = geoPath()
  }

  render(frameState, feature, context) {
    const { transform } = frameState
    const { projection } = frameState.viewState

    this.drawingFunction.context(context)

    context.beginPath()
    context.lineWidth = 1 / transform.k

    const geometries = feature.getProjectedGeometries(projection)
    for (const geometry of geometries) {
      this.drawingFunction(geometry)
    }

    // context.fill()
    context.stroke()
  }
}
