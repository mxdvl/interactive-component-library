import { VectorLayerRenderer } from "../renderers/VectorLayerRenderer"

export class VectorLayer {
  constructor({ source }) {
    this.source = source
    this.renderer = new VectorLayerRenderer(this)
  }

  renderFrame(frameState, targetElement) {
    return this.renderer.renderFrame(frameState, targetElement)
  }
}
