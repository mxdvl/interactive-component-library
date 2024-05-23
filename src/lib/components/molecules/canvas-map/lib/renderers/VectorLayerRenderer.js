import { FeatureRenderer } from "./FeatureRenderer"

export class VectorLayerRenderer {
  constructor(layer) {
    this.layer = layer
    this.featureRenderer = new FeatureRenderer()
  }

  renderFrame(frameState, targetElement) {
    console.log("render frame with state", frameState)

    const { transform } = frameState
    const { projection, sizeInPixels, extent } = frameState.viewState

    const container = this.getOrCreateContainer(targetElement)
    const context = container.firstElementChild.getContext("2d")

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
      this.featureRenderer.render(feature, context, projection)
      context.restore()
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
    style.left = "0"
    style.transformOrigin = "top left"
    container.appendChild(canvas)

    return container
  }
}
