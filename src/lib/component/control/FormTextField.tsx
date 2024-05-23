'use client'

import { TextField, TextFieldProps } from "@mui/material"
import { Control, Controller, RegisterOptions } from "react-hook-form"

interface FormTextFieldProps {
    control: Control<any>
    name: string
    label: string
    TextFieldProps?: TextFieldProps
    rules?: RegisterOptions
}

export default function FormTextField(props: FormTextFieldProps) {
    const { control, name, label, TextFieldProps, rules } = props


    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <TextField
                    onBlur={onBlur}
                    onChange={onChange}
                    inputRef={ref}
                    value={value}
                    name={name}
                    disabled={disabled}
                    label={label}
                    {...TextFieldProps}
                />
            )}
            name={name}
            control={control}
            rules={rules}
        />
    )
}