import { useState, useEffect, useRef } from "preact/hooks"
import { forwardRef } from "preact/compat"
import { Map as _Map } from "./lib/Map"
import { View } from "./lib/View"
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
    console.log("map", map)

    setMap(map)

    if (ref) ref.current = map
  }, [])

  const targetRef = useRef()

  return <div ref={targetRef} className={styles.mapContainer} />
})
