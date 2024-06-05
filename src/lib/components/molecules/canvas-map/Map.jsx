import { useState, useEffect, useRef } from "preact/hooks"
import { forwardRef } from "preact/compat"
import { Map as _Map } from "./lib/Map"
import { View } from "./lib/View"
import { ZoomControl } from "./controls"
import styles from "./style.module.css"

export const Map = forwardRef(({ config, children }, ref) => {
  const { controls, layers } = children

  const [map, setMap] = useState()

  useEffect(() => {
    const map = new _Map({
      view: new View(config.view),
      target: targetRef.current,
    })
    map.addLayers(layers)

    setMap(map)

    if (ref) ref.current = map

    return () => {
      setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!map) return
    map.setLayers(layers)
  }, [map, layers])

  const targetRef = useRef()

  return (
    <div ref={targetRef} className={styles.mapContainer}>
      <div className={styles.zoomControl}>
        <ZoomControl onZoomIn={() => map.zoomIn()} onZoomOut={() => map.zoomOut()} />
      </div>
    </div>
  )
})
