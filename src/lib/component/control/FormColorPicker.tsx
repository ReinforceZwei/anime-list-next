'use client'

import { Control, Controller, RegisterOptions } from "react-hook-form"
import { Box, ButtonBase, Popover } from "@mui/material"
import { HexColorPicker } from "react-colorful"
import { useState, MouseEvent } from "react"

interface FormColorPickerProps {
    control: Control<any>
    name: string
    rules?: RegisterOptions
}


export default function FormColorPicker(props: FormColorPickerProps) {
    const { control, name, rules } = props

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <Box>
                    <ButtonBase
                        sx={{
                            width: '48px',
                            height: '28px',
                            borderRadius: '8px',
                            borderWidth: '3px',
                            borderStyle: 'solid',
                            borderColor: '#fff',
                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={handleClick}
                        style={{
                            backgroundColor: value, // put in sx will have performence impact
                        }}
                    ></ButtonBase>
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    overflowY: 'hidden'
                                }
                            }
                        }}
                    >
                        <Box>
                            <HexColorPicker
                                color={value}
                                onChange={onChange}
                            />
                        </Box>
                    </Popover>
                    
                </Box>
            )}
            control={control}
            name={name}
            rules={rules}
        />
    )
}