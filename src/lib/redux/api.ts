import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: 'api',
    tagTypes: ['animes'],
    baseQuery: fakeBaseQuery(),
    endpoints: () => ({}),
})