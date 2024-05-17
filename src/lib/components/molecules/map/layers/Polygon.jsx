import { useContext, useEffect } from 'preact/hooks'
import { MapContext } from '../context/MapContext'
import { dynamicPropValue } from '../helpers/dynamicPropValue'
import { geoContains } from 'd3-geo'

export function Polygon({ id, features, fill = null, stroke = null, strokeWidth = 1, zIndex = 0, styles }) {
  const context = useContext(MapContext)
  const { drawToCanvas } = context.config

  if (drawToCanvas) {
    return <PolygonCanvas context={context} features={features} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }

  useEffect(() => {
    function findFeatureAtPoint(point) {
      const projectedPoint = context.projection.invert(point)
      for (const feature of features) {
        if (geoContains(feature, projectedPoint)) {
          return feature
        }
      }
    }

    const layer = {
      zIndex,
      findFeatureAtPoint,
    }
    context.registerLayer(layer)

    return () => {
      context.unregisterLayer(layer)
    }
  }, [context, zIndex, features])

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
  const draw = (ctx, path) => {
    for (const feature of features) {
      ctx.beginPath()
      ctx.lineWidth = strokeWidth
      ctx.strokeStyle = stroke
      ctx.fillStyle = fill
      path(feature)

      if (fill) ctx.fill()
      if (stroke) ctx.stroke()
    }
  }

  useEffect(() => {
    context.register(draw)
    
    return () => {
        context.unregister(draw)
    }
  }, [])

  useEffect(() => {
    context.invalidate()
  }, [features, fill, stroke, strokeWidth])

  return '<!--Polygon layer-->'
}
