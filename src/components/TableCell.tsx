import React, { Component } from 'react';

type TableCellProps = {
    text: string,
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
                {this.state.cellContent.map((ele, i) => <p key={i}>{ele}</p>)}
            </>
        )
    }
}

export default TableCell;
