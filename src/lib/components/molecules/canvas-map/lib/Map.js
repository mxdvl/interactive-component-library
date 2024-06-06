import { hasArea } from "./util/size"
import { arrayEquals } from "./util/array"
import { containsCoordinate } from "./util/extent"
import { MapRenderer } from "./renderers/MapRenderer"
import { zoom, zoomIdentity } from "d3-zoom"
import { select } from "d3-selection"
import { timer } from "d3-timer"
import { EventType } from "./events"
import "d3-transition"

export class Map {
  constructor(options) {
    this.options = options
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
    this.view.transform = zoomIdentity
    this._zoomBehaviour = zoom()
      .scaleExtent(this.view.scaleExtent)
      .on("zoom", (event) => {
        this.view.transform = event.transform
        this._requestRender()
      })

    // Add zoom behaviour to viewport
    select(this._viewport).call(this._zoomBehaviour)
  }

  /** PUBLIC GETTERS */

  get size() {
    return this._size
  }

  get viewPort() {
    return this._viewport
  }

  /** PUBLIC METHODS */

  fitObject(geoJSON) {
    this.view.fitObject(geoJSON)
    this._requestRender()
  }

  addLayer(layer) {
    this.addLayers([layer])
  }

  addLayers(layers) {
    this.layers = this.layers.concat(layers)

    layers.forEach((layer) => {
      layer.on(EventType.CHANGE, () => {
        this._requestRender()
      })
    })

    this._requestRender()
  }

  setLayers(layers) {
    if (layers === this.layers) {
      return
    }

    ;[...this.layers].forEach((layer) => {
      if (!layers.includes(layer)) {
        this.removeLayer(layer)
      }
    })

    this.layers = []
    this.addLayers(layers)
  }

  removeLayer(layer) {
    layer.tearDown()
    const layerIndex = this.layers.indexOf(layer)
    if (layerIndex < 0) return
    this.layers.splice(layerIndex, 1)
  }

  zoomIn() {
    select(this._viewport).transition().duration(500).call(this._zoomBehaviour.scaleBy, 2)
  }

  zoomOut() {
    select(this._viewport).transition().duration(500).call(this._zoomBehaviour.scaleBy, 0.5)
  }

  zoomTo(feature, focalPoint) {
    const extent = feature.getExtent()
    const [[x, y], [width, height]] = this.view.boundsForExtent(extent)
    const viewPortSize = this.view.viewPortSize

    const newTransform = zoomIdentity
      .translate(viewPortSize[0] / 2, viewPortSize[1] / 2)
      .scale(Math.min(this.view.maxZoom, 0.9 * Math.min(viewPortSize[0] / width, viewPortSize[1] / height)))
      .translate(-x - width / 2, -y - height / 2)

    select(this._viewport).transition().duration(500).call(this._zoomBehaviour.transform, newTransform, focalPoint)
  }

  findFeatures(point) {
    // find map coordinate based on projection
    const mapCoordinate = this.view.invert(point)

    const matchingFeatures = []
    for (const layer of this.layers) {
      const layerExtent = layer.getExtent()
      if (layer.hitDetectionEnabled && containsCoordinate(layerExtent, mapCoordinate)) {
        const features = layer.findFeatures(mapCoordinate)
        if (features) {
          matchingFeatures.push(...features)
        }
      }
    }

    return matchingFeatures
  }

  changed() {
    this._requestRender()
  }

  transition(options = { duration: 500 }, callback) {
    this._isTransitioning = true
    const _timer = timer((elapsed) => {
      const t = Math.min(elapsed / options.duration, 1)
      callback(t)
      this._renderFrame()
      if (elapsed >= options.duration) {
        _timer.stop()
        this._isTransitioning = false
      }
    })
  }

  /** PRIVATE METHODS */

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

    // constrain zoom to size of the viewport
    this._zoomBehaviour.extent([[0, 0], size])
    this._zoomBehaviour.translateExtent([[0, 0], size])

    this._requestRender()
  }

  _requestRender() {
    if (!this._renderer || !!this._animationFrameRequestID || this._isTransitioning) return
    this._animationFrameRequestID = requestAnimationFrame(this._renderFrame.bind(this))
  }

  _renderFrame() {
    const frameState = {
      size: this.size,
      viewState: this.view.getState(),
    }

    this._renderer.renderFrame(frameState)
    this._animationFrameRequestID = null
  }
}
