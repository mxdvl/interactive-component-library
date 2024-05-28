import { VectorSource } from "./VectorSource"
import { Feature } from "../Feature"
import { Polygon, LineString } from "../geometry"
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
    } else if (geoJSONObject["type"] === "Feature") {
      features = [this.readFeatureFromObject(geoJSONObject)]
    } else {
      try {
        const geometries = this.readGeometriesFromObject(geoJSONObject)
        const feature = new Feature({ geometries })
        features = [feature]
      } catch (_) {
        console.warn("Unable to interpret GeoJSON:", geoJSONObject)
        return
      }
    }

    return features.flat()
  }

  readFeatureFromObject(geoJSONObject) {
    const geometries = this.readGeometriesFromObject(geoJSONObject["geometry"])
    if (geometries.length > 0) {
      return new Feature({ id: geoJSONObject["id"], geometries, properties: geoJSONObject["properties"] })
    }

    return null
  }

  readGeometriesFromObject(geometry) {
    const geometries = []
    if (geometry.type === "Polygon") {
      const polygon = this.readPolygonForCoordinates(geometry.coordinates)
      geometries.push(polygon)
    } else if (geometry.type === "MultiPolygon") {
      for (const polygonCoordinates of geometry.coordinates) {
        const polygon = this.readPolygonForCoordinates(polygonCoordinates)
        geometries.push(polygon)
      }
    } else if (geometry.type === "LineString") {
      const lineString = this.readLineStringForCoordinates(geometry.coordinates)
      geometries.push(lineString)
    } else if (geometry.type === "MultiLineString") {
      for (const lineStringCoordinates of geometry.coordinates) {
        const lineString = this.readLineStringForCoordinates(lineStringCoordinates)
        geometries.push(lineString)
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

  readLineStringForCoordinates(coordinates) {
    const extent = extentForCoordinates(coordinates)
    return new LineString({ extent, coordinates })
  }
}
