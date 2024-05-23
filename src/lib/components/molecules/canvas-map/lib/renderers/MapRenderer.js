import { replaceChildren } from "../util/dom"

export class MapRenderer {
  constructor(map) {
    this.map = map

    this._element = document.createElement("div")
    const style = this._element.style
    style.position = "absolute"
    style.width = "100%"
    style.height = "100%"
    style.zIndex = "0"

    const container = map.viewPort
    container.insertBefore(this._element, container.firstChild || null)
  }

  renderFrame(frameState) {
    const layers = this.map.layers

    const mapElements = []
    let previousElement = null
    for (const layer of layers) {
      const element = layer.renderFrame(frameState, previousElement)

      if (element !== previousElement) {
        mapElements.push(element)
        previousElement = element
      }
    }

    replaceChildren(this._element, mapElements)
  }
}
