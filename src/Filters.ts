import { config } from './config'

export function addressFilter (input: string) {
    return `${input.substr(0, 5)}...${input.substr(-5, 5)}`
}

export function datacapFilter (input: string) {
    if(input===""){
        return "0 B"
    }
    const inputLength = input.length
    if(inputLength > config.datacapExt[config.datacapExt.length-1].value.length+3){
        return `9999+ ${config.datacapExt[config.datacapExt.length-1].name}`
    }
    for(let i = config.datacapExt.length-1; i>=0; i--){
        if(config.datacapExt[i].value.length <= inputLength){
            return `${input.substring(0, inputLength - (config.datacapExt[i].value.length-1))} ${config.datacapExt[i].name}`
        }
    }
}