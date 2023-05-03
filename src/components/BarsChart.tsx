//@ts-nocheck
import {
    HorizontalGridLines,
    LabelSeries,
    VerticalBarSeries,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis,
} from "react-vis";
import { SentryDataPeriods } from "../type";

const BarsChart = (props: {searchQuery: string, data: { x: string; y: number }[] }) => {
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
                width={props?.searchQuery === SentryDataPeriods?.TwoWeeks ? 1200 : 600}
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
