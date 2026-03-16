import { List as MantineList } from "@mantine/core"
import styles from './List.module.css'

export default function List({ children }: { children: React.ReactNode }) {
  return (
    <MantineList type="ordered" className={styles.list}>
      {children}
    </MantineList>
  )
}