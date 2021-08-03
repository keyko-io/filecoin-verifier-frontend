import ByteConverter from '@wtfcode/byte-converter'
const byteConverter = new ByteConverter()

const filMultip = 1000000000000000000 //10^18
const nanoMultip = 1000000000 //10^9
const attoMultip = 1000 //10^3

export function addressFilter(input: string) {
    return `${input.substr(0, 5)}...${input.substr(-5, 5)}`
}

export function anyToBytes(inputDatacap: any) {
    const ext = inputDatacap.replace(/[0-9.]/g, '')
    const datacap = inputDatacap.replace(/[^0-9.]/g, '')
    const bytes = byteConverter.convert(datacap, ext, 'B')
    return bytes
}

export function bytesToiB(inputBytes: any) {
    const autoscale = byteConverter.autoScale(Number(inputBytes), 'B', { preferByte: true, preferBinary: true } as any)
    return `${Number.isInteger(autoscale.value) ? autoscale.value : autoscale.value.toFixed(1)}${autoscale.dataFormat}`
}

export function bytesToB(inputBytes: any) {
    const autoscale = byteConverter.autoScale(Number(inputBytes), 'B', { preferByte: true, preferDecimal: true } as any)
    return `${Number.isInteger(autoscale.value) ? autoscale.value : autoscale.value.toFixed(1)}${autoscale.dataFormat}`
}

export function anyToFil(val: string): string {
    if (val === "not found") {
        return val
    }
    const n = Number(val);
    let retVal = ''
    if (val === "0") {
        retVal = '0 FIL'
    }
    if (val.length > 18) {
        retVal = `${n / filMultip} FIL`
    }
    if (val.length <= 18 && val.length > 6) {
        retVal = `${n / nanoMultip} nanoFIL`
    }
    if (val.length <= 6) {
        retVal = `${n / attoMultip} attoFIL`
    }
    return retVal
}

export function filToAny(val: string): number {
    if (val === "not found") {
        console.log(val)
        return -1
    }
    const num = Number(val.slice(0, val.indexOf(" ")))
    let retVal = 0;

    if (val === "0") {
        retVal = 0
    }

    if (val.slice(val.indexOf(" ") + 1) === "FIL") {
        retVal = num * filMultip
    }

    if (val.slice(val.indexOf(" ") + 1) === "nanoFIL") {
        retVal = num * nanoMultip
    }

    if (val.slice(val.indexOf(" ") + 1) === "attoFIL") {
        retVal = num * attoMultip
    }
    return retVal
}
