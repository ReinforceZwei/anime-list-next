import { createServerClient } from '@/lib/pocketbase';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { Box, Button, Fab, Paper, Typography } from '@mui/material'
import Item from '@/lib/item'
import AnimeList from '@/lib/component/AnimeList/AnimeList';
import AddIcon from '@mui/icons-material/Add'
import AppMenu from '@/lib/component/AppMenu/AppMenu';
import AnimeCardModalHolder from '@/lib/modalHolder/AnimeCardModalHolder';
import EditorModalHolder from '@/lib/modalHolder/EditorModalHolder';
import AddAnimeModalHolder from '@/lib/modalHolder/AddAnimeModalHolder';
import AddTagModalHolder from '@/lib/modalHolder/AddTagModalHolder';
import PosterViewerModalHolder from '@/lib/modalHolder/PosterViewerModalHolder';
import GlassmorphismPaper from '@/lib/component/Wallpaper/GlassmorphismPaper';
import { Metadata, ResolvingMetadata } from 'next';
import { getUserSettings } from '@/lib/service/userSettings';

export async function generateMetadata(props: any, parent: ResolvingMetadata): Promise<Metadata> {
    const userSettings = await getUserSettings()

    return {
        title: userSettings ? userSettings.app_title : (await parent).title
    }
}

export default async function Home() {
    const pb = createServerClient(cookies())
    if (!pb.authStore.isValid) {
        return redirect('/login')
    }
    const userSettings = await getUserSettings()
    const title = userSettings ? userSettings.app_title : 'Anime List'
    const useGlassEffect = userSettings ? userSettings.glass_effect : false

    const listLayout = [
        {
            title: 'Watched',
            filter: "status = 'finished'",
            sort: '+finish_time',
        },
        {
            title: 'Watching',
            filter: "status = 'in-progress'",
            sort: '+start_time',
        },
        {
            title: 'To Watch',
            filter: "status = 'pending'",
            sort: '+created',
        },
    ]

    const PaperToUse = useGlassEffect ? GlassmorphismPaper : Paper
    
    return (
        <div>
            <PaperToUse elevation={5}>
                <Box padding={{ sm: 6, xs: 2 }}>
                    <Typography variant="h3" align="center">{title}</Typography>
                    {listLayout.map(x => (
                        <AnimeList key={x.title} title={x.title} filter={x.filter} sort={x.sort} />
                    ))}
                    {/* <AnimeList title="Watched" filter="status = 'finished'" sort="+finish_time" />
                    <AnimeList title="Watching" filter="status = 'in-progress'" sort="+start_time" />
                    <AnimeList title="To Watch" filter="status = 'pending'" sort="+created" /> */}
                </Box>
            </PaperToUse>

            <AppMenu />

            <AnimeCardModalHolder />
            <EditorModalHolder />
            <AddAnimeModalHolder />
            <AddTagModalHolder />
            <PosterViewerModalHolder />
        </div>
    );
}
