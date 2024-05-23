import Flatbush from "flatbush"

export class VectorSource {
  getFeaturesInExtent(extent) {
    const [minX, minY, maxX, maxY] = extent
    return this._featuresRtree.search(minX, minY, maxX, maxY).map((i) => this._features[i])
  }

  setFeatures(features) {
    // create spatial index
    let index = new Flatbush(features.length)
    for (const feature of features) {
      const geometry = feature.getGeometry()
      const [minX, minY, maxX, maxY] = geometry.extent
      index.add(Math.floor(minX), Math.floor(minY), Math.ceil(maxX), Math.ceil(maxY))
    }
    index.finish()

    this._features = features
    this._featuresRtree = index
  }
}
