import React, { Component } from 'react';
import { tableFilter } from '../utils/SortFilter';

type PaginationProps = {
    elements: any[],
    maxElements: number
    refresh: any
    search: any
}
class Pagination extends Component<PaginationProps> {

    state = {
        initialIndex: 0,
        actualPage: 1,
        pages: []
    }

    componentDidMount() {
        this.calculatePages()
    }

    componentDidUpdate(prevProps: PaginationProps) {
        if (prevProps.elements !== this.props.elements || prevProps.search !== this.props.search) {
            this.calculatePages()
        }
    }


    calculatePages = async () => {
        const elementsToShow = await tableFilter(this.props.search, this.props.elements as [])
        const numerOfPages = Math.ceil(elementsToShow.length / this.props.maxElements)
        let pages = []
        for (let index = 0; index < numerOfPages; index++) {
            pages.push(index + 1)
        }
        this.setState({ pages })
    }


    checkIndex = (index: number) => {
        return (index >= this.state.initialIndex && index < this.state.actualPage * this.props.maxElements)
    }

    setPage = async (e: any) => {
        const actualPage = Number(e.target.id)
        this.updateIndex(actualPage)
    }

    movePage = async (index: number) => {
        const page = this.state.actualPage + index
        if (page <= this.state.pages.length && page >= 1) {
            this.updateIndex(page)
        }
    }

    updateIndex = (page: number) => {
        this.setState(
            {
                finalIndex: page * this.props.maxElements,
                initialIndex: (page * this.props.maxElements) - this.props.maxElements,
                actualPage: page
            },
            this.props.refresh
        )
    }

    render() {
        return (
            <div className="pagination">
                <div className="pagenumber paginator" onClick={e => this.movePage(-1)}>{"<"}</div>
                {this.state.pages.map((page: any, i) =>
                    <div className="pagenumber"
                        style={this.state.actualPage === i + 1 ? { backgroundColor: "#33A7FF", color: 'white' } : {}}
                        id={(i + 1).toString()}
                        onClick={e => this.setPage(e)}>
                        {page}
                    </div>
                )}
                <div className="pagenumber paginator" onClick={e => this.movePage(1)}>{">"}</div>
            </div>
        )
    }
}

export default Pagination;
