export const filterByLabel = (issues: any, shouldInclude: string) => {
    const i = issues.filter((issue: any) =>
        issue.labels.some((l: any) => {
            return l.name.toLowerCase().replace(/ /g, '').includes(shouldInclude)

        })
    )
    return i
}
