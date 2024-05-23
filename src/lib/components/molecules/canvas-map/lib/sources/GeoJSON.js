import { VectorSource } from "./VectorSource"
import { Feature } from "../Feature"
import { Polygon } from "../geometry/Polygon"
import { extentForCoordinates } from "../util/extent"

export class GeoJSON extends VectorSource {
  constructor(object) {
    super()

    this.setFeatures(this.readFeaturesFromObject(object))
  }

  readFeaturesFromObject(object) {
    const geoJSONObject = object
    let features = null
    if (geoJSONObject["type"] === "FeatureCollection") {
      const geoJSONFeatureCollection = object
      features = []
      const geoJSONFeatures = geoJSONFeatureCollection["features"]
      for (let i = 0, ii = geoJSONFeatures.length; i < ii; ++i) {
        const featureObject = this.readFeatureFromObject(geoJSONFeatures[i])
        if (!featureObject) {
          continue
        }
        features.push(featureObject)
      }
    } else {
      features = [this.readFeatureFromObject(geoJSONObject)]
    }
    return features.flat()
  }

  readFeatureFromObject(geoJSONObject) {
    if (geoJSONObject["type"] !== "Feature") {
      console.warn("Encountered invalid feature object", geoJSONObject)
    }

    const geometry = this.readGeometryFromObject(geoJSONObject["geometry"])
    if (geometry) {
      return new Feature({ id: geoJSONObject["id"], geometries: [geometry], properties: geoJSONObject["properties"] })
    }

    return null
  }

  readGeometryFromObject(geometry) {
    if (geometry.type === "Polygon") {
      const flatCoordinates = geometry.coordinates.flat()
      const extent = extentForCoordinates(flatCoordinates)
      return new Polygon({ extent, coordinates: flatCoordinates })
    }

    return null
  }
}
