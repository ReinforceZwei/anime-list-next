import { createServerClient } from '@/lib/pocketbase';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { Box, Button, Fab, Typography } from '@mui/material'
import Item from '@/lib/item'
import AnimeList from '@/lib/component/AnimeList/AnimeList';
import AddIcon from '@mui/icons-material/Add'
import AppMenu from '@/lib/component/AppMenu/AppMenu';
import CardLayout from './cardLayout';

export default async function Home() {
    const pb = createServerClient(cookies())
    if (!pb.authStore.isValid) {
        return redirect('/login')
    }
    return (
        <div>
            <div>
                <Typography variant="h3" align="center">Anime List</Typography>
                <AnimeList title="Watched" filter="status = 'finished'" sort="+finish_time" />
                <AnimeList title="To Watch" filter="status = 'pending'" sort="+created" />
            </div>

            <Box>
                <Fab sx={{position: 'fixed', right: 10, bottom: 10}} size="small" color="primary">
                    <AddIcon />
                </Fab>
            </Box>

            <AppMenu />

            <CardLayout />
        </div>
    );
}
