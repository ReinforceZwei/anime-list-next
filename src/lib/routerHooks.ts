import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";



/**
 * Wrapper around `router.refresh()` from `next/navigation` `useRouter()` to return Promise, and resolve after refresh completed
 * @returns Refresh function
 */
export function useRouterRefresh() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [resolve, setResolve] = useState<((value: unknown) => void) | null>(null)
    const [isTriggered, setIsTriggered] = useState(false)

    const refresh = () => {
        return new Promise((resolve, reject) => {
            console.log('hook, created new promise')
            setResolve(() => resolve)
            startTransition(() => {
                console.log('hook, called router refresh')
                router.refresh()
            })
        })
    }

    useEffect(() => {
        console.log('hook, use effect called: isTriggered', isTriggered, ', isPending', isPending, ', resolve', resolve)
        if (isTriggered && !isPending) {
            console.log('hook, in use effect, check promise resolve')
            if (resolve) {
                console.log('hook, in use effect, promise resolve called')
                resolve(null)
                
                setIsTriggered(false)
                setResolve(null)
            }
        }
        if (isPending) {
            console.log('hook, in use effect, set triggered to true')
            setIsTriggered(true)
        }

        return () => { console.log('hook, use effect clean up') }
    }, [isTriggered, isPending, resolve])

    return refresh
}