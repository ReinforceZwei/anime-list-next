import type { ReactNode } from 'react'
import styles from './InfoCard.module.css'

interface InfoCardActionGroupProps {
  children: ReactNode
}

export default function InfoCardActionGroup({ children }: InfoCardActionGroupProps) {
  return <div className={styles.actionGroup}>{children}</div>
}
