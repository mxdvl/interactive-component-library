import { VectorLayerRenderer } from "../renderers/VectorLayerRenderer"
import { Style, Stroke } from "../styles"

export class VectorLayer {
  constructor({ source, style }) {
    this.source = source
    this._style = style
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

  renderFrame(frameState, targetElement) {
    return this.renderer.renderFrame(frameState, targetElement)
  }
}
