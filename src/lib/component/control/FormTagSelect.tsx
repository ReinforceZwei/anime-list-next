'use client'

import { Autocomplete, AutocompleteProps, AutocompleteRenderGetTagProps, Box, Checkbox, Chip, ChipProps, TextField, createFilterOptions } from "@mui/material"
import { ReactNode, useMemo, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Control, Controller, RegisterOptions } from "react-hook-form";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface TagSelectProps {
    /** Get label from option */
    getOptionLabel?: (option: any) => string
    /** Set extra props for Chip component by option */
    getChipProps?: (option: any) => Partial<ChipProps> | null
    compareOption?: (option: any, value: any) => boolean
    options: any[]

    control: Control<any>
    name: string
    label: string
    rules?: RegisterOptions
}

export default function FormTagSelect(props: TagSelectProps) {
    const {
        getOptionLabel,
        getChipProps,
        compareOption,
        options,
        control,
        name,
        label,
        rules,
    } = props


    //const [value, setValue] = useState<any[]>([])

    const filter = useMemo(() => createFilterOptions(), [])

    const getLabel = useMemo(() => getOptionLabel ? getOptionLabel : (option: any) => option, [getOptionLabel])

    return (
        <Box>
        <Controller
            render={({ field: { onBlur, onChange, ref, value, name, disabled } }) => (
                <Autocomplete
                    value={value}
                    onBlur={onBlur}
                    ref={ref}
                    disabled={disabled}
                    onChange={(event, newValue, reason, details) => {
                        // console.log('newValue', newValue)
                        // console.log('event', event)
                        // console.log(reason)
                        // console.log(details)
                        // if (reason === 'selectOption' && typeof details?.option === 'string') {
                        //     onCreateValue && onCreateValue(details?.option)
                        // } else {
                        //     //onChange(newValue.map(x => x.id))
                        //     onChange(newValue)
                        // }
                        onChange(newValue)
                    }}
                    onInputChange={(event, newValue, reason) => {
                        console.log('onInputChange value', newValue)
                        console.log('onInputChange reason', reason)
                    }}
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params)

                        // if (params.inputValue !== '') {
                        //     filtered.push(getCreateValueOptionText
                        //         ? getCreateValueOptionText(params.inputValue)
                        //         : `Add '${params.inputValue}'`
                        //     )
                        // }
                        return filtered
                    }}
                    getOptionLabel={(option) => {
                        // if (typeof option === 'string') {
                        //     return option
                        // }
                        
                        return getLabel(option)
                    }}
                    // renderOption={(props, option, { selected }) => {
                    //     const { key, ...rest } = props as any
                    //     return (<li key={key} {...rest}>
                    //         <Checkbox
                    //             icon={icon}
                    //             checkedIcon={checkedIcon}
                    //             sx={{ mr: 1 }}
                    //             checked={selected}
                    //         />
                    //         {getLabel(option)}
                    //     </li>)
                    // }}
                    renderTags={(value, getTagProps, state) => (
                        value.map((x, i) => {
                            const { key, ...tagProps } = getTagProps({ index: i })
                            const props = getChipProps ? getChipProps(x) : null
                            return <Chip key={key} label={getLabel(x)} {...tagProps} {...props} />
                        })
                    )}
                    isOptionEqualToValue={(option, value) => {
                        if (compareOption) {
                            return compareOption(option, value)
                        }
                        return option == value
                    }}
                    options={options}
                    selectOnFocus
                    clearOnBlur
                    disableCloseOnSelect
                    handleHomeEndKeys
                    freeSolo
                    multiple
                    renderInput={(params) => <TextField {...params} label={label} />}
                />
            )}
            control={control}
            name={name}
            rules={rules}
        />
            
        </Box>
    )
}
