/**
 * Move an item within an array from one index to another.
 * Returns a new array (immutable).
 */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
