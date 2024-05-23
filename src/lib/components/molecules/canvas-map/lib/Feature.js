import { createUid } from "./util/uid"

export class Feature {
  constructor({ id, geometries, properties }) {
    this.id = id
    this._geometries = geometries
    this.properties = properties

    // create a unique ID for this feature
    this.uid = createUid()
  }

  getGeometry() {
    return this._geometries[0]
  }
}
