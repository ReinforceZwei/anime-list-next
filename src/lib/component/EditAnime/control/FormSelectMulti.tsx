'use client'

import { FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps } from "@mui/material"
import { ReactNode, useState } from "react"
import AddIcon from '@mui/icons-material/Add';
import { Control } from "react-hook-form";

const options = [
    'Option A',
    'Option B',
    'Option C',
]

interface FormSelectMultiProps {
    control: Control<any>
    name: string
    label: string
    children: ReactNode
    fullWidth?: boolean
    SelectProps?: SelectProps
}

export default function FormSelectMulti() {

    const [values, setValues] = useState<string[]>([])

    const handleOnchange = (event: SelectChangeEvent<typeof values>) => {
        const { target: { value } } = event
        setValues(typeof value === 'string' ? value.split(',') : value)
        console.log('on change new value: ', value)
    }

    return (
        <FormControl fullWidth>
            <InputLabel>Label</InputLabel>
            <Select
                value={values}
                onChange={handleOnchange}
                multiple
                label='Label'
            >
                {options.map(x => (
                    <MenuItem
                        key={x}
                        value={x}
                    >
                        {x}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}