import { config } from '../config'
import { BigNumber } from "bignumber.js";

export function addressFilter (input: string) {
    return `${input.substr(0, 5)}...${input.substr(-5, 5)}`
}

export function datacapFilter (input: string) {
    if(input===""){
        return "0 B"
    }
    const pointLoc = input.indexOf(".")
    if(pointLoc >= 0){
        input = input.substr(0, pointLoc)
    }
    const inputLength = input.length
    if(inputLength > config.datacapExt[config.datacapExt.length-1].value.length+3){
        return `999+ ${config.datacapExt[config.datacapExt.length-1].name}`
    }
    for(let i = config.datacapExt.length-1; i>=0; i--){
        if(config.datacapExt[i].value.length <= inputLength){
            return `${input.substring(0, inputLength - (config.datacapExt[i].value.length-1))} ${config.datacapExt[i].name}`
        }
    }
}

const converter = new BigNumber('1.0995116278')

export function iBtoB (input: string) {
    let bn = new BigNumber(input)
    return bn.multipliedBy(converter).toString()
}

export function BtoiB (input: string) {
    let bn = new BigNumber(input)
    return bn.dividedBy(converter).toString()
}