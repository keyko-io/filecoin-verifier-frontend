export const tableSort = (e: any, arrayToSort: [], previousOrderBy: string, previousSortOrder: number) => {
    const orderBy = e.currentTarget.id
    const sortOrder = orderBy === previousOrderBy ? previousSortOrder * -1 : -1

    const arraySorted = arrayToSort.sort((a: any, b: any) => {
        return a[orderBy] < b[orderBy] ?
            sortOrder :
            a[orderBy] > b[orderBy] ?
                sortOrder * -1 : 0;
    });

    return { arraySorted, sortOrder, orderBy }
}


export const tableFilter = async (search: string, tableData: []) => {
    const tableFiltered = tableData.filter((element: any) =>
        Object.values(element).some((k: any) =>
            typeof (k) === 'object' ?
                k.join().toLowerCase().includes(search.toLowerCase())
                :
                k.toString().toLowerCase().includes(search.toLowerCase())

        ));

    return tableFiltered
}


export const tableElementFilter = (search: string, element: any) => {
    return Object.values(element).some((k: any) =>
        typeof (k) === 'object' ?
            k.join().toLowerCase().includes(search.toLowerCase())
            :
            k.toString().toLowerCase().includes(search.toLowerCase())

    );
}