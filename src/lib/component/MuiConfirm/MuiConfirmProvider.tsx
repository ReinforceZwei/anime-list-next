'use client'

import { ConfirmProvider, ConfirmOptions } from "material-ui-confirm"
import React from "react"

interface MuiConfirmProviderProps {
    children: React.ReactNode
}

const options: Partial<ConfirmOptions> = {
    title: 'Are you sure?',
    dialogProps: {
        maxWidth: 'xs'
    }
}

/**
 * Wrapper provider for `material-ui-confirm` package
 * @param props 
 * @returns 
 */
export default function MuiConfirmProvider(props: MuiConfirmProviderProps) {
    return (
        <ConfirmProvider defaultOptions={options}>
            {props.children}
        </ConfirmProvider>
    )
}