'use client'
import AnimeCard from "@/lib/component/AnimeCard/AnimeCard";
import FormTagSelect from "@/lib/component/control/FormTagSelect";
import { useGetAnimeQuery } from "@/lib/redux/animeSlice";
import { useGetTagsQuery } from "@/lib/redux/tagSlice";
import { Button, Chip, useTheme } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";



export default function Page() {
    const theme = useTheme()
    const { data, isFetching } = useGetTagsQuery()
    const { data: anime, isFetching: animeFetching } = useGetAnimeQuery('v8lfogou4vwsb3c')

    const { control, handleSubmit, reset } = useForm<any>({
        defaultValues: {
            tags: []
        }
    })

    const handle = (value: string) => {
        console.log('create new value', value)
    }
    
    const submit = (data) => {
        console.log(data)
    }

    useEffect(() => {
        if (!animeFetching) {
            reset({...anime!})
        }
    }, [animeFetching, anime])

    if (isFetching || !data) {
        return <div>Loading</div>
    }

    const tagBy = data.reduce((prev, curr) => {prev[curr.id] = curr; return prev}, {})

    return (
        <div>
            <form onSubmit={handleSubmit(submit)}>
            <FormTagSelect
                options={data.map(x => x.id)}
                getOptionLabel={(option) => tagBy[option]?.name || option}
                getChipProps={(option) => ({
                    sx: {
                        backgroundColor: tagBy[option]?.color || '',
                        // '& .MuiChip-deleteIcon': {
                        //     color: theme.palette.text.primary
                        // }
                    }
                })}
                name='tags'
                label='Tags'
                control={control}
            />
            <Button type='submit'>Submit</Button>
            </form>
        </div>
    )
}