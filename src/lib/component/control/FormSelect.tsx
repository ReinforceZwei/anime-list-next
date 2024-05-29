'use client'

import { FormControl, FormControlProps, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps } from "@mui/material"
import { ReactNode, useState } from "react"
import { Control, Controller, RegisterOptions } from "react-hook-form";


interface FormSelectProps {
    control: Control<any>
    name: string
    label: string
    children: ReactNode
    fullWidth?: boolean
    multiple?: boolean
    SelectProps?: SelectProps
    rules?: RegisterOptions
    FormControlProps?: FormControlProps
}

export default function FormSelect(props: FormSelectProps) {
    const { control, name, label, children, fullWidth, multiple, SelectProps, rules, FormControlProps } = props

    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <FormControl fullWidth={fullWidth} {...FormControlProps}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        onBlur={onBlur}
                        onChange={onChange}
                        inputRef={ref}
                        value={value}
                        name={name}
                        disabled={disabled}
                        multiple={multiple}
                        label={label}
                        {...SelectProps}
                    >
                        {children}
                    </Select>
                </FormControl>
            )}
            control={control}
            name={name}
            rules={rules}
        />
        
    )
}