import { config } from './config'

export function addressFilter (input: string) {
    return `${input.substr(0, 5)}...${input.substr(-5, 5)}`
}

export function datacapFilter (input: string) {
    const inputLength = input.length
    for(const entry of config.datacapExt){
        if(inputLength < 4){
            return `${input} KiB`
        } else if (inputLength < entry.value.length) {
            return `${input.substring(0, inputLength - entry.value.length-1)} ${entry.name}`
        }
    }
    return `${input.substring(0, inputLength-"1000000000000000000000000".length-1)} YiB`
}