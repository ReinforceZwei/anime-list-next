'use client'
import { useContext, useEffect, useMemo, useState } from "react"
import { Alert, Box, Button, ButtonGroup, Container, CssBaseline, Divider, Paper, TextField, Typography } from "@mui/material"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import Grid from "@mui/material/Unstable_Grid2"
import GitHubIcon from '@mui/icons-material/GitHub';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import { createBrowserClient } from "@/lib/pocketbase"
import { useRouter } from "next/navigation"
import { AuthProviderInfo } from "pocketbase"
import FormTextField from "@/lib/component/control/FormTextField"
import { LoadingButton } from "@mui/lab"
import { useAppDispatch } from "@/lib/hooks"
import { baseApi } from "@/lib/redux/api"


type FormValues = {
    username: string
    password: string
}

export default function LoginPage() {
    const dispatch = useAppDispatch()
    const pb = createBrowserClient()
    const router = useRouter()
    const [authMethods, setAuthMethods] = useState<AuthProviderInfo[]>([])
    
    const { handleSubmit, reset, setValue, setFocus, setError, control, formState } = useForm<FormValues>({
        defaultValues: {
            username: '',
            password: '',
        }
    })

    const { isSubmitting, isSubmitSuccessful, errors } = formState

    useEffect(() => {
        dispatch(baseApi.util.resetApiState())
        let getAuthMethods = async () => {
            let methods = await pb.collection('users').listAuthMethods()
            setAuthMethods(methods.authProviders)
        }
        getAuthMethods()
    }, [])

    const handleLogin: SubmitHandler<FormValues> = async ({ username, password }) => {
        try {
            await pb.collection('users').authWithPassword(username, password)
            router.push('/')
        } catch (err: any) {
            console.log(err)
            setError('root', {
                type: 'custom',
                message: err?.message || 'Unknown error',
            })
        }
    }

    const handleOauth = (providerName: string) => {
        let w = window.open()
        pb.collection('users').authWithOAuth2({
            provider: providerName,
            urlCallback: (url) => {
                if (w?.location) {
                    w.location.href = url
                }
            },
        })
        .then(authData => {
            router.push("/")
        })
    }

    const getProviderIcon = (name: string) => {
        switch (name) {
            case 'github': return <GitHubIcon />
            case 'apple': return <AppleIcon />
            case 'google': return <GoogleIcon />
            case 'microsoft': return <MicrosoftIcon />
            case 'facebook': return <FacebookIcon />
            default: return <LanguageIcon />
        }
    }

    return (
        <div>
            <Container maxWidth='sm' sx={{mt: 5}}>
                <Paper sx={{ margin: 2, padding: 2 }}>
                    <Box mb={1}>
                        <Typography variant="h4">Anime List</Typography>
                        <Typography variant="subtitle1">Anime List</Typography>
                    </Box>
                    
                    <form onSubmit={handleSubmit(handleLogin)}>
                        <Grid container spacing={2}>
                            <Grid xs={12}>
                                <FormTextField
                                    control={control}
                                    name='username'
                                    label='登入名稱'
                                    rules={{ required: true }}
                                    TextFieldProps={{
                                        fullWidth: true,
                                    }}
                                />
                            </Grid>
                            <Grid xs={12}>
                                <FormTextField
                                    control={control}
                                    name='password'
                                    label='密碼'
                                    rules={{ required: true }}
                                    TextFieldProps={{
                                        fullWidth: true,
                                        type: 'password',
                                    }}
                                />
                            </Grid>
                            <Grid xs={12} sx={{textAlign: 'center'}}>
                                {/* Assume submit successful = loading new route */}
                                <LoadingButton type='submit' variant="outlined" loading={isSubmitting || isSubmitSuccessful}>登入</LoadingButton>
                            </Grid>
                            {errors?.root?.message && (
                                <Grid xs={12}>
                                    <Alert severity="error">登入失敗: {errors?.root?.message}</Alert>
                                </Grid>
                            )}
                        </Grid>
                    </form>
                </Paper>
                { !!authMethods?.length && (
                    <>
                    <Divider>或</Divider>
                    { authMethods.map((method) => (
                        <Box textAlign='center' mt={1}>
                            <ButtonGroup orientation="vertical" variant="outlined" size="large">
                                <Button variant="outlined" startIcon={getProviderIcon(method.name)} onClick={() => handleOauth(method.name)}>使用 {method.displayName} 登入</Button>
                            </ButtonGroup>
                        </Box>
                    )) }
                    
                    </>
                ) }
                
            </Container>
        </div>
    )
}