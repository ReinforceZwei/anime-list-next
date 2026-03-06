'use client'

import Grid from '@mui/material/Unstable_Grid2'
import FormTextField from '../control/FormTextField'
import FormSelect from '../control/FormSelect'
import { Box, IconButton, MenuItem, Typography, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { getStatusIcon } from './StatusMenuItem'
import FormTagSelect from '../control/FormTagSelect'
import FormRating from '../control/FormRating'
import { Control } from 'react-hook-form'
import { useGetTagsQuery } from '@/lib/redux/tagSlice'
import getColor, { getMuiChipColor } from '../TagChip/getColor'
import { useAppDispatch } from '@/lib/hooks'
import { openAddTagModal } from '@/lib/redux/uiSlice'
import { DOWNLOAD_STATUS_OPTIONS, STATUS_OPTIONS } from '@/types/anime'


interface GeneralControlProps {
    control: Control<any>
}


export default function GeneralControl(props: GeneralControlProps) {
    const { control } = props
    const dispatch = useAppDispatch()
    const theme = useTheme()

    const { data: tags, isFetching: isTagsLoading } = useGetTagsQuery()

    return (
        <Grid container spacing={1.5} mt={2}>
            {/* Name */}
            <Grid xs={12}>
                <FormTextField control={control} name='name' label='Name' TextFieldProps={{ fullWidth: true }} />
            </Grid>

            {/* Status */}
            <Grid xs={6}>
                <FormSelect
                    control={control}
                    fullWidth
                    name='status'
                    label='Status'
                    FormControlProps={{
                        size: 'small'
                    }}
                >
                    { STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Box display='flex'>
                                {getStatusIcon(option.value)}
                                <Box component='span' pl={1}>{option.label}</Box>
                            </Box>
                        </MenuItem>
                    )) }
                </FormSelect>
            </Grid>

            {/* Download status */}
            <Grid xs={6}>
                <FormSelect
                    control={control}
                    fullWidth
                    name='download_status'
                    label='Download Status'
                    FormControlProps={{
                        size: 'small'
                    }}
                >
                    { DOWNLOAD_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Box display='flex'>
                                {getStatusIcon(option.value)}
                                <Box component='span' pl={1}>{option.label}</Box>
                            </Box>
                        </MenuItem>
                    )) }
                </FormSelect>
            </Grid>

            {/* Tags */}
            <Grid xs={12} container>
                <Grid xs>
                    <FormTagSelect
                        control={control}
                        name='tags'
                        label='Tags'
                        options={isTagsLoading ? [] : tags!}
                        getOptionLabel={(option) => option?.name}
                        compareOption={(a, b) => a?.id == b?.id}
                        getChipProps={(option) => {
                            return {
                                //onDelete: undefined,
                                sx: {
                                    ...getMuiChipColor(option?.color || theme.palette.primary.main),
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid xs='auto' sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => dispatch(openAddTagModal())}><AddIcon /></IconButton>
                </Grid>
            </Grid>

            {/* Category */}
            <Grid xs={12} container>
                <Grid xs>
                    <FormTagSelect
                        control={control}
                        name='categories'
                        label='Categories'
                        options={isTagsLoading ? [] : tags!}
                        getOptionLabel={(option) => option?.name}
                        compareOption={(a, b) => a?.id == b?.id}
                        getChipProps={(option) => {
                            return {
                                //onDelete: undefined,
                                sx: {
                                    backgroundColor: option?.color || ''
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid xs='auto' sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton><AddIcon /></IconButton>
                </Grid>
            </Grid>

            {/* Rating */}
            <Grid xs={12}>
                <Typography component="legend">Rating</Typography>
                <FormRating control={control} name='rating' />
            </Grid>

            {/* Comment */}
            <Grid xs={12}>
                <FormTextField
                    control={control}
                    name='comment'
                    label='Comment'
                    TextFieldProps={{
                        fullWidth: true,
                        multiline: true,
                        rows: 4,
                    }}
                />
            </Grid>

            {/* Remark */}
            <Grid xs={12}>
                <FormTextField
                    control={control}
                    name='remark'
                    label='Remark'
                    TextFieldProps={{
                        fullWidth: true,
                    }}
                />
            </Grid>
        </Grid>
    )
}