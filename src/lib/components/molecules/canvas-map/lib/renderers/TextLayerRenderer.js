import { FeatureRenderer } from "./FeatureRenderer"
import { replaceChildren } from "../util/dom"

export class TextLayerRenderer {
  constructor(layer) {
    this.layer = layer
    this.featureRenderer = new FeatureRenderer()

    this._element = document.createElement("div")
    this._element.className = "gv-text-layer"
    const style = this._element.style
    style.position = "absolute"
    style.width = "100%"
    style.height = "100%"
    style.pointerEvents = "none"
  }

  renderFrame(frameState) {
    const { projection, sizeInPixels, visibleExtent, transform } = frameState.viewState

    const source = this.layer.source
    const features = source.getFeaturesInExtent(visibleExtent)

    console.log("text features", features.length)

    const textElements = features.map((feature) => {
      const geometries = feature.getProjectedGeometries(projection)
      const point = geometries.find((d) => d.type === "Point")
      if (!point) {
        throw new Error(`Expected Point geometry for feature in TextLayer: ${feature}`)
      }

      const styleFunction = feature.getStyleFunction() || this.layer.getStyleFunction()
      const featureStyle = styleFunction(feature)

      const textElement = this.createOrGetTextElement(featureStyle)
      const style = textElement.style
      style.position = "absolute"

      const [x, y] = transform.apply(point.coordinates)
      style.left = `${(x / sizeInPixels[0]) * 100}%`
      style.top = `${(y / sizeInPixels[1]) * 100}%`

      style.transform = `translate(-50%, -50%)`

      const textStyle = featureStyle.text

      style.fontFamily = textStyle.fontFamily
      style.fontSize = textStyle.fontSize
      style.fontWeight = textStyle.fontWeight
      style.lineHeight = textStyle.lineHeight
      style.color = textStyle.color
      style.textShadow = textStyle.textShadow

      return textElement
    })

    replaceChildren(this._element, textElements)

    return this._element
  }

  createOrGetTextElement(featureStyle) {
    const textElement = document.createElement("div")
    textElement.innerText = featureStyle.text.content
    return textElement
  }
}
