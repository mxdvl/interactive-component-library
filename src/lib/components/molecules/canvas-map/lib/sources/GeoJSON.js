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

    const geometries = this.readGeometryFromObject(geoJSONObject["geometry"])
    if (geometries.length > 0) {
      return new Feature({ id: geoJSONObject["id"], geometries, properties: geoJSONObject["properties"] })
    }

    return null
  }

  readGeometryFromObject(geometry) {
    const geometries = []
    if (geometry.type === "Polygon") {
      const polygon = this.readPolygonForCoordinates(geometry.coordinates)
      geometries.push(polygon)
    } else if (geometry.type === "MultiPolygon") {
      for (const polygonCoordinates of geometry.coordinates) {
        const polygon = this.readPolygonForCoordinates(polygonCoordinates)
        geometries.push(polygon)
      }
    }

    return geometries
  }

  readPolygonForCoordinates(coordinates) {
    // the first ring of a Polygon is always the outer ring
    const outerRing = coordinates[0]
    const extent = extentForCoordinates(outerRing)
    return new Polygon({ extent, coordinates })
  }
}
