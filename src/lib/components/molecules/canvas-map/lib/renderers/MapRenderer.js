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
    console.log("render", frameState)
  }
}
