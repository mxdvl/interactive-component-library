import { hasArea } from "./util/size"
import { arrayEquals } from "./util/array"
import { MapRenderer } from "./renderers/MapRenderer"
import { zoom, zoomIdentity } from "d3-zoom"

export class Map {
  constructor(options) {
    this.view = options.view
    this.target = options.target
    this.layers = []

    // Create container div and add to viewport
    this._viewport = document.createElement("div")
    this._viewport.style.position = "relative"
    this._viewport.style.overflow = "hidden"
    this._viewport.style.width = "100%"
    this._viewport.style.height = "100%"
    this.target.appendChild(this._viewport)

    // Create renderer
    this._renderer = new MapRenderer(this)

    // Create resize observer
    this._resizeObserver = new ResizeObserver(() => this._updateSize())
    // Trigger fires when observer is first added, ensuring _updateSize() is called
    this._resizeObserver.observe(this.target)

    // Create d3-zoom object to allow panning and zooming
    this._zoomTransform = zoomIdentity
    this._zoomBehaviour = zoom().scaleExtent(this.view.scaleExtent).on("zoom", this._onZoom)
  }

  addLayer(layer) {
    this.layers.push(layer)
  }

  addLayers(layers) {
    this.layers = this.layers.concat(layers)
  }

  get size() {
    return this._size
  }

  get viewPort() {
    return this._viewport
  }

  _updateSize() {
    const targetElement = this.target

    let size
    if (targetElement) {
      const computedStyle = getComputedStyle(targetElement)
      const width =
        targetElement.offsetWidth -
        parseFloat(computedStyle["borderLeftWidth"]) -
        parseFloat(computedStyle["paddingLeft"]) -
        parseFloat(computedStyle["paddingRight"]) -
        parseFloat(computedStyle["borderRightWidth"])
      const height =
        targetElement.offsetHeight -
        parseFloat(computedStyle["borderTopWidth"]) -
        parseFloat(computedStyle["paddingTop"]) -
        parseFloat(computedStyle["paddingBottom"]) -
        parseFloat(computedStyle["borderBottomWidth"])
      if (!isNaN(width) && !isNaN(height)) {
        size = [width, height]
        if (!hasArea(size) && !!(targetElement.offsetWidth || targetElement.offsetHeight || targetElement.getClientRects().length)) {
          console.warn("No map visible because the map container's width or height are 0.")
        }
      }
    }

    const oldSize = this.size
    if (size && (!oldSize || !arrayEquals(size, oldSize))) {
      this._size = size
      this._updateViewportSize(size)
    }
  }

  _updateViewportSize(size) {
    const view = this.view
    if (view) {
      view.viewPortSize = size
    }

    this._requestRender()
  }

  _requestRender() {
    if (!this._renderer || !!this._animationFrameRequestID) return
    this._animationFrameRequestID = requestAnimationFrame(this._renderFrame.bind(this))
  }

  _renderFrame() {
    const frameState = {
      size: this.size,
      viewState: this.view.getState(),
      zoomTransform: this._zoomTransform,
    }

    this._renderer.renderFrame(frameState)
    this._animationFrameRequestID = null
  }

  _onZoom(event) {
    this._zoomTransform = event.transform
  }
}
