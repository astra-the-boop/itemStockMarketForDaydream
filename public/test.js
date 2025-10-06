const ctx = document.getElementById('myChart');
Chart.defaults.color = "#fff";
const labels = ["","","","",""];
const data = {
    labels: labels,
    datasets: [
        {
            label: "",
            data: [65, 59, 80, 56, 40],
            fill: true,
            backgroundColor: "rgb(200, 0, 0, 0.5)",
            borderColor: "rgb(200, 0, 0)",
            borderWidth: 3,
            tension: 0,
        }
    ]
};
new Chart(ctx, {
    type: 'line',
    data: data,
    options:{
        plugins:{
            legend:{
                display:false
            }
        }
    }
});

