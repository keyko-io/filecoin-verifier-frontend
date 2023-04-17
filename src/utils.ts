export const filterByLabel = (issues: any, shouldInclude: string) => {
    debugger
    const i = issues.filter((issue: any) =>
        issue.labels.some((l: any) => {
            return l.name.toLowerCase().replace(/ /g, '').includes(shouldInclude)

        })
    )
    return i
}