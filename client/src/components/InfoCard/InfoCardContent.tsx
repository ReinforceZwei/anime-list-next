import type { ReactNode } from 'react'
import styles from './InfoCard.module.css'

interface InfoCardContentProps {
  children: ReactNode
}

export default function InfoCardContent({ children }: InfoCardContentProps) {
  return (
    <div className={styles.content}>
      {children}
    </div>
  )
}
