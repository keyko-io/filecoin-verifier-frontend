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

    renderContact = (data: any) => {
        console.log(data)
        const contactElements = data.split(':')
        if(data.includes('Slack')){
        }
        return <>{contactElements[0]}</>
    }

    render() {
        return (
            <>
                {this.state.cellContent.map((ele: any, i) => <p key={i}>{
                    this.props.type == 'Location' ?
                        <><p>{ele.split(',')[0]}</p><p>{ele.split(',')[1]}</p> </>
                        :
                        this.props.type == 'Contact' ? this.renderContact(ele)
                            : ele
                }</p>)}
            </>
        )
    }
}

export default TableCell;
