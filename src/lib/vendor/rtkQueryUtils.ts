export function generateCacheTagList(result: any[] | undefined, tagName: any, keySelector = (x: any) => x.id, listKey = '*') {
    return result ? [
        ...result.map((item) => ({ type: tagName, id: keySelector(item) })),
        { type: tagName, id: listKey }
    ] : [
        { type: tagName, id: listKey }
    ]
}