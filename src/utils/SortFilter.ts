
export const tableSort = (e: any, arrayToSort: any[], previousOrderBy: string, previousSortOrder: number) => {
    const orderBy = e.currentTarget.id
    const sortOrder = orderBy === previousOrderBy ? previousSortOrder * -1 : -1

    return arrayToSort[0] && arrayToSort[0].data ?
        sortTableObject(arrayToSort, orderBy, sortOrder)
        :
        sortTable(arrayToSort, orderBy, sortOrder)

}


const sortTable = (arrayToSort: any[], orderBy: string, sortOrder: number) => {
    console.log(orderBy)
    console.log(sortOrder)
    const arraySorted = arrayToSort.sort((a: any, b: any) => {
        return a[orderBy] < b[orderBy] ?
            sortOrder :
            a[orderBy] > b[orderBy] ?
                sortOrder * -1 : 0;
    });

    return { arraySorted, orderBy, sortOrder }
}

const sortTableObject = (arrayToSort: any[], orderBy: string, sortOrder: number) => {
    const arraySorted = arrayToSort.sort((a: any, b: any) => {
        return a.data[orderBy] < b.data[orderBy] ?
            sortOrder :
            a.data[orderBy] > b.data[orderBy] ?
                sortOrder * -1 : 0;
    });

    return { arraySorted, orderBy, sortOrder }
}


export const tableFilter = async (search: string, tableData: []) => {
    return tableData.filter((element: any) => {
        return Object.values(element).some((k: any) => {
            return k === undefined ? false :
                typeof (k) === 'object' ?
                    k.join().toLowerCase().includes(search.toLowerCase())
                    :
                    k.toString().toLowerCase().includes(search.toLowerCase())

        });
    })
}

export const tableElementFilter = (search: string, element: any) => {
    return Object.values(element).some((k: any) => {
        return k === undefined ? false :
            typeof (k) === 'object' ?
                k.join().toLowerCase().includes(search.toLowerCase())
                :
                k.toString().toLowerCase().includes(search.toLowerCase())
    }
    );
}