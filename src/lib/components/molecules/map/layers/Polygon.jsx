import { useContext, useEffect, useCallback, useState } from 'preact/hooks'
import { MapContext } from '../context/MapContext'
import { dynamicPropValue } from '../helpers/dynamicPropValue'
import { geoContains } from 'd3-geo'
import Flatbush from 'flatbush'

export function Polygon({ id, features, fill = null, stroke = null, strokeWidth = 1, zIndex = 0, styles }) {
  const context = useContext(MapContext)
  const { drawToCanvas } = context.config

  const [searchIndex, setSearchIndex] = useState()

  useEffect(() => {
    if (!context.path) return;

    let index = new Flatbush(features.length)

    for (const feature of features) {
      const bounds = context.path.bounds(feature)

      index.add(
        Math.floor(bounds[0][0]),
        Math.floor(bounds[0][1]),
        Math.ceil(bounds[1][0]),
        Math.ceil(bounds[1][1]),
      )
    }

    index.finish()

    setSearchIndex(index)
  }, [context.path, features])

  const findFeatureAtPoint = useCallback(
    ([x, y]) => {
      const projectedPoint = context.projection.invert([x, y])
      // console.log('projected point', projectedPoint)

      const results = searchIndex.search(x, y, x, y)

      let found = results[0]

      results.forEach((idx) => {
        const feature = features[idx]
        if (geoContains(feature, projectedPoint)) {
          found = idx
        }
      })

      return features[found]
    },
    [context, searchIndex],
  )

  useEffect(() => {
    const layer = {
      zIndex,
      findFeatureAtPoint,
    }
    context.registerLayer(layer)

    return () => {
      context.unregisterLayer(layer)
    }
  }, [context, zIndex, findFeatureAtPoint])

  if (drawToCanvas) {
    return <PolygonCanvas context={context} features={features} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }

  return (
    <>
      {features.map((d, index) => {
        return (
          <path
            key={index}
            id={dynamicPropValue(id, d, index)}
            className={dynamicPropValue(styles, d, index)}
            fill={dynamicPropValue(fill, d, index)}
            stroke={dynamicPropValue(stroke, d, index)}
            stroke-width={dynamicPropValue(strokeWidth, d, index)}
            d={context.path(d)}
          />
        )
      })}
    </>
  )
}

function PolygonCanvas({ context, features, fill, stroke, strokeWidth }) {
  const draw = useCallback(
    (ctx, path, transform) => {
      for (const [index, feature] of features.entries()) {
        ctx.beginPath()
        ctx.lineWidth = dynamicPropValue(strokeWidth, feature, index) / transform.k
        ctx.strokeStyle = dynamicPropValue(stroke, feature, index)
        ctx.fillStyle = dynamicPropValue(fill, feature, index)
        path(feature)

        if (fill) ctx.fill()
        if (stroke) ctx.stroke()
      }
    },
    [features, fill, stroke, strokeWidth],
  )

  useEffect(() => {
    context.register(draw)

    return () => {
      context.unregister(draw)
    }
  }, [draw])

  useEffect(() => {
    context.invalidate()
  }, [features, fill, stroke, strokeWidth])

  return '<!--Polygon layer-->'
}
