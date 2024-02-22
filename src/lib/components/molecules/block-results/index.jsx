import styles from './style.module.css'

export function BlockResults({ blockName, parties }) {
  return (
    <div>
      <div className={styles.block}>{blockName}</div>
      {parties.map((p, index) => (
        <div key={index}>{p.name}</div>
      ))}
    </div>
  )
}
