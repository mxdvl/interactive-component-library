import { FeatureRenderer } from "./FeatureRenderer"

export class VectorLayerRenderer {
  constructor(layer) {
    this.layer = layer
    this.featureRenderer = new FeatureRenderer()
  }

  renderFrame(frameState, targetElement) {
    const { transform } = frameState
    const { projection, sizeInPixels, extent } = frameState.viewState

    const container = this.getOrCreateContainer(targetElement)
    const context = container.firstElementChild.getContext("2d")

    // set size of canvas
    context.canvas.width = sizeInPixels[0]
    context.canvas.height = sizeInPixels[1]

    context.save()
    context.clearRect(0, 0, sizeInPixels[0], sizeInPixels[1])

    context.translate(transform.x, transform.y)
    context.scale(transform.k, transform.k)

    // set defaults
    context.lineJoin = "round"
    context.lineCap = "round"

    const source = this.layer.source
    // FIXME: this should be the current extent of the map, not the initial bounds
    const features = source.getFeaturesInExtent(extent)

    for (const feature of features) {
      context.save()
      this.featureRenderer.render(frameState, feature, context)
      context.restore()
    }

    if (Object.prototype.hasOwnProperty.call(projection, "getCompositionBorders")) {
      context.beginPath()
      context.lineWidth = 1 / transform.k
      context.strokeStyle = "#999"
      projection.drawCompositionBorders(context)
      context.stroke()
    }

    context.restore()

    return container
  }

  getOrCreateContainer(targetElement) {
    let canvas = targetElement && targetElement.firstElementChild
    if (canvas instanceof HTMLCanvasElement) {
      // use container passed down from renderer
      return targetElement
    } else if (this._container) {
      // reuse existing container for this layer
      return this._container
    }

    // Create new container
    this._container = this.createContainer()
    return this._container
  }

  createContainer() {
    const container = document.createElement("div")
    let style = container.style
    style.position = "absolute"
    style.width = "100%"
    style.height = "100%"

    const canvas = document.createElement("canvas")
    style = canvas.style
    style.position = "absolute"
    style.width = "100%"
    style.height = "100%"
    container.appendChild(canvas)

    return container
  }
}
