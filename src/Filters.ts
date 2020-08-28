export function addressFilter (input: string) {
    // const first = input.substr(0, 4)
    // const last = input.substr(-4, 4)
    return `${input.substr(0, 5)}...${input.substr(-5, 5)}`
}