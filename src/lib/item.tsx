'use client'



export default function Item({ id, name }: { id: string, name: string }) {
    const click = () => {
        console.log(id)
    }
    return (
        <li key={id} onClick={click}>{name}</li>
    )
}