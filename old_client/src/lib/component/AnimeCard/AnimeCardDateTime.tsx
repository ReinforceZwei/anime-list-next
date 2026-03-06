'use client'

import { Box, Skeleton, Typography } from "@mui/material"
import { DateTime } from "luxon"
import { useMemo } from "react"


interface AnimeCardDateTimeProps {
    createTime?: string
    startTime?: string
    finishTime?: string
    loading: boolean
}

export default function AnimeCardDateTime(props: AnimeCardDateTimeProps) {
    const { createTime, startTime, finishTime, loading } = props

    const createTimeObj = useMemo(() => createTime ? DateTime.fromSQL(createTime) : null, [createTime])
    const startTimeObj = useMemo(() => startTime ? DateTime.fromSQL(startTime) : null, [startTime])
    const finishTimeObj = useMemo(() => finishTime ? DateTime.fromSQL(finishTime) : null, [finishTime])

    return loading ? <Skeleton /> : (
        <Box>
            { createTimeObj && (
                <Typography variant="caption" color='text.secondary' component='div'>
                    新增於 {createTimeObj.toLocaleString(DateTime.DATETIME_SHORT)}
                </Typography>
            ) }
            

            { startTimeObj && (
                <Typography variant="caption" color='warning.light' component='div'>
                    開始於 {startTimeObj.toLocaleString(DateTime.DATETIME_SHORT)}
                </Typography>
            ) }

            { finishTimeObj && (
                <Typography variant="caption" color='success.light' component='div'>
                    完成於 {finishTimeObj.toLocaleString(DateTime.DATETIME_SHORT)}
                    { startTimeObj && (
                        <span>{' '}({Math.ceil(finishTimeObj.diff(startTimeObj).as('days'))}日)</span>
                    ) }
                </Typography>
            ) }
        </Box>
    )
}