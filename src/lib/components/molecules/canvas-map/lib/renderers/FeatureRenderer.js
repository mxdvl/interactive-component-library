import { geoPath } from "d3-geo"

export class FeatureRenderer {
  constructor() {
    this.drawingFunction = geoPath()
  }

  render(frameState, feature, context) {
    const { transform } = frameState
    const { projection } = frameState.viewState

    context.beginPath()
    context.lineWidth = 1 / transform.k

    const geometry = feature.getProjectedGeometry(projection)
    this.drawingFunction.context(context)
    this.drawingFunction(geometry)

    // context.fill()
    context.stroke()
  }

  drawHouse(context) {
    const ctx = context

    // Set line width
    ctx.lineWidth = 10

    // Wall
    ctx.strokeRect(75, 140, 150, 110)

    // Door
    ctx.fillRect(130, 190, 40, 60)

    // Roof
    ctx.beginPath()
    ctx.moveTo(50, 140)
    ctx.lineTo(150, 60)
    ctx.lineTo(250, 140)
    ctx.closePath()
    ctx.stroke()
  }
}
