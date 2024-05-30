import { VectorLayerRenderer } from "../renderers/VectorLayerRenderer"
import { Style, Stroke } from "../styles"
import { combineExtents } from "../util/extent"
import { Dispatcher } from "../events/dispatcher"
import EventType from "../events/EventType"

export class VectorLayer {
  constructor({ source, style, hitDetectionEnabled = true }) {
    this.source = source
    this._style = style
    this.hitDetectionEnabled = hitDetectionEnabled
    this.renderer = new VectorLayerRenderer(this)
    this.dispatcher = new Dispatcher(this)
  }

  tearDown() {
    this.dispatcher = null
  }

  get style() {
    if (this._style) return this._style

    // create default vector style
    const defaultStyle = new Style({
      stroke: new Stroke(),
    })
    return defaultStyle
  }

  set style(style) {
    this._style = style
    this.dispatcher.dispatch(EventType.CHANGE)
  }

  getStyleFunction() {
    const style = this.style
    if (typeof style === "function") return style
    return () => {
      return style
    }
  }

  getExtent() {
    if (this._extent) return this._extent

    const features = this.source.getFeatures()
    const extent = features.reduce((combinedExtent, feature) => {
      const featureExtent = feature.getExtent()
      if (!combinedExtent) return featureExtent
      return combineExtents(featureExtent, combinedExtent)
    }, null)
    this._extent = extent
    return extent
  }

  findFeatures(coordinate) {
    if (!this.hitDetectionEnabled) return
    return this.source.getFeaturesAtCoordinate(coordinate)
  }

  renderFrame(frameState, targetElement) {
    return this.renderer.renderFrame(frameState, targetElement)
  }
}
