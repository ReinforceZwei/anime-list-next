import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import PocketBase from "pocketbase";

let singletonClient: PocketBase | null = null;

export function createBrowserClient() {
    let clientSideUrl: string
    if (process.env.NEXT_PUBLIC_POCKETBASE_API_URL) {
        clientSideUrl = process.env.NEXT_PUBLIC_POCKETBASE_API_URL
    }

    const createNewClient = () => {
        return new PocketBase(
            clientSideUrl
        );
    };

    const _singletonClient = singletonClient ?? createNewClient();

    if (typeof window === "undefined") return _singletonClient;

    if (!singletonClient) singletonClient = _singletonClient;

    singletonClient.authStore.onChange(() => {
        document.cookie = singletonClient!.authStore.exportToCookie({
            httpOnly: false,
        });
    });

    return singletonClient;
}

export function createServerClient(cookieStore?: ReadonlyRequestCookies) {
    if (!process.env.POCKETBASE_API_URL) {
        throw new Error("Pocketbase API url not defined !");
    }
  
    if (typeof window !== "undefined") {
        throw new Error(
            "This method is only supposed to call from the Server environment"
        );
    }
  
    const client = new PocketBase(
        process.env.POCKETBASE_API_URL
    );
  
    if (cookieStore) {
        const authCookie = cookieStore.get("pb_auth");
    
        if (authCookie) {
            client.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
        }
    }
  
    return client;
}