'use client'

import { Badge, Button } from "@mui/material"
import { Control, Controller, RegisterOptions } from "react-hook-form"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface FormSingleFileInputProps {
    control: Control<any>
    name: string
    label: string
    rules?: RegisterOptions
    accept?: string
    multiple?: boolean
}

export default function FormFileInput(props: FormSingleFileInputProps) {
    const { control, name, label, rules, accept, multiple } = props


    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled }, fieldState: { error } }) => (
                <Badge color="secondary" badgeContent={value?.length || 0}>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    {label}
                    <VisuallyHiddenInput
                        type="file"
                        //value={value}
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        ref={ref}
                        disabled={disabled}
                        name={name}
                        accept={accept}
                        multiple={multiple}
                    />
                </Button>
                </Badge>
            )}
            name={name}
            control={control}
            rules={rules}
        />
    )
}