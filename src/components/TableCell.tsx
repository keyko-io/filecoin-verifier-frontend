import React, { Component } from 'react';

type TableCellProps = {
    text: string,
    type?: string
}


class TableCell extends Component<TableCellProps> {

    state = {
        cellContent: []
    }

    componentDidMount() {
        this.formatData()
    }

    formatData = async () => {
        if (this.props.text) {
            const replaced = await this.props.text.split('&lt;br&gt;');
            this.setState({ cellContent: replaced })
        }
    }

    render() {
        return (
            <>
                {this.state.cellContent.map((ele: string, i) => <p key={i}>{
                    this.props.type == 'Location' ?
                        <><p>{ele.split(',')[0]}</p><p>{ele.split(',')[1]}</p> </>
                        : ele
                }</p>)}
            </>
        )
    }
}

export default TableCell;
