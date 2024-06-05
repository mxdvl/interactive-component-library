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
    const { declutterTree } = frameState
    const { projection, sizeInPixels, visibleExtent, transform } = frameState.viewState

    const source = this.layer.source
    const features = source.getFeaturesInExtent(visibleExtent)

    const textElements = []
    for (const feature of features) {
      // get point geometry
      const geometries = feature.getProjectedGeometries(projection)
      const point = geometries.find((d) => d.type === "Point")
      if (!point) {
        throw new Error(`Expected Point geometry for feature in TextLayer: ${feature}`)
      }

      // get style
      const styleFunction = feature.getStyleFunction() || this.layer.getStyleFunction()
      const featureStyle = styleFunction(feature)

      // get text element
      const textElement = this.getTextElementWithID(feature.uid)
      textElement.innerText = featureStyle.text.content

      // calculate position
      const [x, y] = transform.apply(point.coordinates)
      const position = {
        left: `${(x / sizeInPixels[0]) * 100}%`,
        top: `${(y / sizeInPixels[1]) * 100}%`,
      }

      // apply style to text element
      this.styleTextElement(textElement, featureStyle.text, position)

      const bbox = this.getElementBBox(textElement, { x, y })

      // skip item if it collides with existing elements
      if (declutterTree.collides(bbox)) {
        console.log("element collides, skip it")
        continue
      }

      // add element to declutter tree to prevent collisions
      declutterTree.insert(bbox)

      textElements.push(textElement)
    }

    replaceChildren(this._element, textElements)

    return this._element
  }

  getTextElementWithID(id) {
    const elementId = `text-feature-${id}`
    let textElement = this._element.querySelector(`#${elementId}`)
    if (!textElement) {
      textElement = document.createElement("div")
      textElement.id = elementId
    }
    return textElement
  }

  styleTextElement(element, textStyle, position) {
    const style = element.style
    style.position = "absolute"
    style.transform = `translate(-50%, -50%)`
    style.left = position.left
    style.top = position.top
    style.textAlign = "center"
    style.maxWidth = "200px"

    style.fontFamily = textStyle.fontFamily
    style.fontSize = textStyle.fontSize
    style.fontWeight = textStyle.fontWeight
    style.lineHeight = textStyle.lineHeight
    style.color = textStyle.color
    style.textShadow = textStyle.textShadow
  }

  getElementBBox(element, position) {
    if (!element.parentElement) {
      document.body.appendChild(element)
    }

    const { width, height } = element.getBoundingClientRect()

    if (element.parentElement !== this._element) {
      element.remove()
    }

    return {
      minX: position.x,
      minY: position.y,
      maxX: position.x + width,
      maxY: position.y + height,
    }
  }
}
