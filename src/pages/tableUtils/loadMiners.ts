import { config } from '../../config'
import { anyToFil, bytesToiB } from '../../utils/Filters'
import parserMarkdown from '../../utils/Markdown'
// @ts-ignore
import { parse } from 'himalaya'

export interface Contacts {
    id: number
    slack: string
    href: string
}

export interface MinerData {
    id: number
    name: string
    location: string
    minerId: string
    contacts: Contacts
    verifiedPrice: string
    minPieceSize: string
    minPieceSizeRaw: number
    reputationScore: string | number
}

export const loadData = async () => {
    try {
        const response = await fetch(config.minersUrl)
        const text = await response.text()
        const html = parserMarkdown.render(text)
        const json: any = parse(html)
        const minersIds = json[2].children[3].children
            .filter((ele: any) => ele.type === 'element')
            .map((m: any, i = 0) => m.children[5].children[0].content)

        const res = await fetch('https://api.filrep.io/api/v1/miners')
        const apiData = await res.json()

        const filteredApiData = apiData.miners.filter((item: any) =>
            minersIds.includes(item.address),
        )

        const miners: MinerData[] = json[2].children[3].children
            .filter((ele: any) => ele.type === 'element')
            .map((m: any, i = 0) => {
                const verifiedPrice =
                    filteredApiData.find(
                        (item: any) => item.address === m.children[5].children[0].content,
                    )?.verifiedPrice || 'not found'
                const minPieceSize =
                    filteredApiData.find(
                        (item: any) => item.address === m.children[5].children[0].content,
                    )?.minPieceSize || 'not found'
                const reputationScore =
                    filteredApiData.find(
                        (item: any) => item.address === m.children[5].children[0].content,
                    )?.scores.total || 'not found'

                const index = i++
                const miner: MinerData = {
                    id: index,
                    name: m.children[1].children[0].content,
                    location: m.children[3].children[0].content,
                    minerId: m.children[5].children[0].content,
                    contacts: {
                        id: index,
                        slack: m.children[7].children[0].content.slice(
                            m.children[7].children[0].content.indexOf(':') + 2,
                            m.children[7].children[0].content.indexOf('&'),
                        ),
                        href: m.children[7].children[1]?.children[0]?.content,
                    },
                    verifiedPrice: anyToFil(verifiedPrice),
                    minPieceSize:
                        minPieceSize === 'not found' ? 'not found' : bytesToiB(minPieceSize),
                    minPieceSizeRaw: minPieceSize === 'not found' ? -1 : Number(minPieceSize),
                    reputationScore:
                        reputationScore === 'not found' ? 'not found' : Number(reputationScore),
                }
                return miner
            })

        return miners
    } catch (error) {
        console.log('hey', error)
    }
}
