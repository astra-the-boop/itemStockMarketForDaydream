const ctx = document.getElementById('myChart');

const labels = ["dsaf", "59", "80", "56", "40"];
const data = {
    labels: labels,
    datasets: [
        {
            label: "money",
            data: [65, 59, 80, 56, 40],
            fill: true,
            backgroundColor: "rgb(75, 192, 192, 0.5)",
            borderColor: "rgb(75, 192, 192)",
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

