import { createServerClient } from '@/lib/pocketbase';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { Button } from '@mui/material'
import Item from '@/lib/item'

export default async function Home() {
    const pb = createServerClient(cookies())
    if (!pb.authStore.isValid) {
        return redirect('/login')
    }
    const data = await pb.collection('animes').getFullList()
    return (
        <div>
            <h1>Hi</h1>
            <Button variant='contained'>Hi</Button>
            <div>
                <ol>
                    {data.map((anime) => (
                        // <li key={anime.id}>{anime.name}</li>
                        <Item key={anime.id} id={anime.id} name={anime.name} />
                    ))}
                </ol>
            </div>
        </div>
    );
}
