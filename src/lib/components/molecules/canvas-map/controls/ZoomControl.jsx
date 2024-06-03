import { IconPlus, IconMinus } from "./icons"
import styles from "./style.module.css"

export function ZoomControl({ onZoomIn, onZoomOut }) {
  const _onZoomIn = (event) => {
    event.stopPropagation()
    onZoomIn(event)
  }

  const _onZoomOut = (event) => {
    event.stopPropagation()
    onZoomOut(event)
  }

  return (
    <div className={styles.zoomControl}>
      <button className={styles.button} onClick={_onZoomIn}>
        <IconPlus />
      </button>
      <button className={styles.button} onClick={_onZoomOut}>
        <IconMinus />
      </button>
    </div>
  )
}
