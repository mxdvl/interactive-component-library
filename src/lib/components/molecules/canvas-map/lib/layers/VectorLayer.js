import { VectorLayerRenderer } from "../renderers/VectorLayerRenderer"
import { Style, Stroke } from "../styles"
import { combineExtents } from "../util/extent"

export class VectorLayer {
  constructor({ source, style, hitDetectionEnabled = true }) {
    this.source = source
    this._style = style
    this.hitDetectionEnabled = hitDetectionEnabled
    this.renderer = new VectorLayerRenderer(this)
  }

  get style() {
    if (this._style) return this._style

    // create default vector style
    const defaultStyle = new Style({
      stroke: new Stroke(),
    })
    return defaultStyle
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

    const features = this.source.getFeatures()
    return features.filter((feature) => {
      return feature.containsCoordinate(coordinate)
    })
  }

  renderFrame(frameState, targetElement) {
    return this.renderer.renderFrame(frameState, targetElement)
  }
}
