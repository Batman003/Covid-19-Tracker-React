import React, { useState, useEffect } from 'react'
import { Line } from "react-chartjs-2";
import numeral from 'numeral';

const options = {
    legend: {
        display: false
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    maintainAspectRatio: false,
    tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },

    },

    scales: {
        xAxes: [
            {
                type: "time",
                time: {
                    format: "MM/DD/YY",
                    tooltipFormat: "ll"
                },
            },
        ],
        yAxes: [
            {
                gridLines: {
                    display: false,
                },
                tricks: {
                    callback: function (value, index, values) {
                        return numeral(value).format("0a");
                    },
                },
            },
        ],
    },
}

function LineGraph({ caseType, ...props }) {

    const [data, setData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=120')
                .then((response) => response.json())
                .then(data => {
                    let chartData = buildChartData(data, caseType);
                    setData(chartData);
                    console.log(chartData);
                });
        };
        fetchData();

    }, [caseType])

    const buildChartData = (data, caseType) => {
        const chartData = [];
        let lastDataPoint;

        for (let date in data.cases) {
            if (lastDataPoint) {
                const newDataPoint = {
                    x: date,
                    y: data[caseType][date] - lastDataPoint
                }
                chartData.push(newDataPoint);
            }
            lastDataPoint = data[caseType][date];
        }
        return chartData;
    }





    return (
        <div className={props.className}>
            {data?.length > 0 && (
                <Line data={{
                    datasets: [{
                        data: data,
                        backgroundColor: "rgba(204, 16, 52, 0.5)",
                        borderColor: "#CC1034"
                    }]
                }}
                    options={options}
                />
            )}
        </div>
    );
}

export default LineGraph;
