'use client'
import { createBrowserClient } from "@/lib/pocketbase"
import { useRouter } from "next/navigation"
import { FormEvent, FormEventHandler } from "react"



export default function LoginPage() {
    const router = useRouter()
    const pb = createBrowserClient()
    const handleSubmit: FormEventHandler = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const username = data.get('username') as string
        const password = data.get('password') as string
        try {
            await pb.collection('users').authWithPassword(username, password)
        } catch (err) {
            console.error(err)
            alert(err)
            return
        }
        router.push('/')
    }

    return (
        <div>
            <h1>This is login page</h1>
            <form onSubmit={handleSubmit}>
                <input name='username' />
                <input name='password' type='password' />
                <button type="submit">A</button>
            </form>
        </div>
    )
}