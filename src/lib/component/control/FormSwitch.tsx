'use client'

import { FormControlLabel, Switch, SwitchProps } from "@mui/material"
import { Control, Controller, RegisterOptions } from "react-hook-form"

interface FormSwitchProps {
    control: Control<any>
    name: string
    label: string
    SwitchProps?: SwitchProps
    rules?: RegisterOptions
}

export default function FormSwitch(props: FormSwitchProps) {
    const { control, name, label, SwitchProps, rules } = props

    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <FormControlLabel
                    control={
                        <Switch
                            onBlur={onBlur}
                            onChange={onChange}
                            inputRef={ref}
                            checked={value}
                            name={name}
                            disabled={disabled}
                            {...SwitchProps}
                        />
                    }
                    label={label}
                />
            )}
            control={control}
            name={name}
            rules={rules}
        />
    )
}