import ByteConverter from '@wtfcode/byte-converter'
const byteConverter = new ByteConverter()

export function addressFilter (input: string) {
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
