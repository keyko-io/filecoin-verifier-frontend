import {
    HorizontalGridLines,
    LabelSeries,
    VerticalBarSeries,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis,
} from "react-vis";

const BarsChart = (props: { data: { x: string; y: number }[] }) => {
    const labelData = Object.keys(
        props?.data?.map((d, idx) => ({
            x: d.x,
            y: d.y,
        }))
    );

    return (
        <div>
            <XYPlot
                xType="ordinal"
                width={600}
                height={300}
                xDistance={100}
            >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalBarSeries data={props?.data} />
                <LabelSeries
                    data={labelData}
                    getLabel={(d: any) => d.x}
                />
            </XYPlot>
        </div>
    );
};

export default BarsChart;
