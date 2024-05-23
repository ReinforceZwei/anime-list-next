'use client'

import { Button, Box, IconButton, Rating, RatingProps } from "@mui/material"
import { Control, Controller, RegisterOptions } from "react-hook-form"
import ClearIcon from '@mui/icons-material/Clear';
import CancelIcon from '@mui/icons-material/Cancel';

interface FormRatingProps {
    control: Control<any>
    name: string
    RatingProps?: RatingProps
    rules?: RegisterOptions
}

export default function FormRating(props: FormRatingProps) {
    const { control, name, RatingProps, rules } = props

    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <Box display='flex' alignItems='center'>
                    <IconButton onClick={() => onChange(null, null)}><CancelIcon /></IconButton>
                    <Rating
                        onBlur={onBlur}
                        onChange={onChange}
                        ref={ref}
                        value={value}
                        name={name}
                        disabled={disabled}
                        {...RatingProps}
                    />
                
                </Box>
            )}
            name={name}
            control={control}
            rules={rules}
        />
    )
}