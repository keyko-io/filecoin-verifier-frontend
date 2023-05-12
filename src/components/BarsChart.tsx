import ReactECharts from 'echarts-for-react';
import logo from "../svg/filecoin-gray.svg"

const BarsChart = (props: {total : number ,title : string, searchQuery: string, data: { x: string; y: number }[] }) => {
   
    const xAxisData = props.data.map(item => item.x);
    const yAxisData = props.data.map(item => item.y);

    const options = {
        title: {
            text: props.title,
        },
        grid: {
            left : 25,
            right : 20
        },
        graphic: [{
          type: 'image',
          id: 'logo',
          left: 'center',
          top: 100,
          style: {
              image: logo, 
              width: 60, 
              height: 60,
          }
       }, 
       {
        type: 'text',
        left: 'center',
        top: 170,
        bounding: 'raw',
        style: {
          text: 'Filecoin Plus+', 
          fill: '#E1E4E8', 
          fontSize: 12, 
          marginTop: "100px",
          fontWeight: 'bold'
        }
      }
      ],
        xAxis: {
          type: 'category',
          data: xAxisData,
        },
        yAxis: {
          type: 'value'
        },
         tooltip: {
            trigger: 'axis',
          },
        series: [
          {
            data: yAxisData,
            type: 'line'
          },
        ]
      };

    return (
        <div>
            {props.searchQuery !== "24h" ? 
            <ReactECharts option={options} /> :
            <div style={{display : "flex" , alignItems : "center", justifyContent : "space-between", 
             border : "1px solid grey", borderRadius : "10px", padding : "30px"
            }}>
                <div>{props.title}</div>
                <div>Total : {props.total}</div> 
            </div>  
            }
        </div>
    );
};

export default BarsChart;
