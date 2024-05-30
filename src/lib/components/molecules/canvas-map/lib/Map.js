import { hasArea } from "./util/size"
import { arrayEquals } from "./util/array"
import { containsCoordinate } from "./util/extent"
import { MapRenderer } from "./renderers/MapRenderer"
import { zoom, zoomIdentity } from "d3-zoom"
import { select } from "d3-selection"
import EventType from "./events/EventType"

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

  findFeatures(point) {
    const { projection, pixelRatio, transform } = this.view.getState()

    // scale for device pixel ratio
    const scaledPoint = [point[0] * pixelRatio, point[1] * pixelRatio]

    // invert zoom transformation
    const untransformedPoint = transform.invert(scaledPoint)

    // find map coordinate based on projection
    const mapCoordinate = projection.invert(untransformedPoint)

    // console.log("find feature for", point[0], point[1], projection.invert(point)[1])
    // console.log("and coordinate", mapCoordinate.toReversed())
    // console.log("projected", projection.invert(point))

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
    if (!this._renderer || !!this._animationFrameRequestID) return
    this._animationFrameRequestID = requestAnimationFrame(this._renderFrame.bind(this))
  }

  _renderFrame() {
    console.log("render frame")
    const frameState = {
      size: this.size,
      viewState: this.view.getState(),
    }

    this._renderer.renderFrame(frameState)
    this._animationFrameRequestID = null
  }
}
