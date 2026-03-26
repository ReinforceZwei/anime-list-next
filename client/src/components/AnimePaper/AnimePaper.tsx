import { Paper } from "@mantine/core"
import Title from "./Title"
import styles from './AnimePaper.module.css'
import Subtitle from "./Subtitle"
import List from "./List"
import Item from "./Item"

interface AnimePaperProps {
  children: React.ReactNode
}

export default function AnimePaper(props: AnimePaperProps) {
  const { children } = props

  return (
    <Paper shadow="xl" className={styles.paper}>
      {children}
    </Paper>
  )
}

AnimePaper.Title = Title;
AnimePaper.Subtitle = Subtitle;
AnimePaper.List = List;
AnimePaper.Item = Item;