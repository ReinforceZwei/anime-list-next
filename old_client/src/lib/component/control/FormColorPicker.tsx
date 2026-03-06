'use client'

import { Control, Controller, RegisterOptions } from "react-hook-form"
import { Box, ButtonBase, ClickAwayListener, Popover, Popper } from "@mui/material"
import { HexColorPicker } from "react-colorful"
import { useState, MouseEvent } from "react"

interface FormColorPickerProps {
    control: Control<any>
    name: string
    rules?: RegisterOptions
}


export default function FormColorPicker(props: FormColorPickerProps) {
    const { control, name, rules } = props

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl);

    return (
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <ClickAwayListener onClickAway={() => handleClose()}>
                    <span>
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
                    <Popper
                        open={open}
                        anchorEl={anchorEl}
                        placement='right-start'
                        //disablePortal
                        // modifiers={[
                        //     {
                        //         name: 'flip',
                        //         enabled: false,
                        //     },
                        //     {
                        //         name: 'preventOverflow',
                        //         enabled: false,
                        //     }
                        // ]}
                        sx={{
                            zIndex: 9999
                        }}
                    >
                        <Box sx={{ pl: 3 }}>
                            <HexColorPicker
                                color={value}
                                onChange={onChange}
                            />
                        </Box>
                    </Popper>
                    </span>
                </ClickAwayListener>
            )}
            control={control}
            name={name}
            rules={rules}
        />
    )
}