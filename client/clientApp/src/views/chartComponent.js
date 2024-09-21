
import { Chart } from 'react-chartjs-2'; // Chart.js의 Bar 차트 불러오기
import 'chart.js/auto'; // Chart.js 자동 설치

const ChartComponent = () => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'test1', 'test2'],
        datasets: [
            {
                type: 'line', // 꺾은선 그래프
                label: 'Line Dataset',
                data: [40, 98, 10, 29, 16, 11, 40, 22, 33, 44, 55],
                fill: false,
                borderColor: 'rgba(0, 0, 235, 1)'
            },
            {
                type: 'line', // 꺾은선 그래프
                label: 'Line Dataset',
                data: [28, 48, 40, 19, 86, 27, 90, 11, 22, 33, 44],
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)'
            }
        ]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div>
            <Chart type='bar' data={data} options={options} />
        </div>
    );
};

export default ChartComponent;
