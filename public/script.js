
const table = document.getElementById("table");
const charts = {};

async function fetchData() {
    const res = await fetch("/data");
    return await res.json();
}

function renderTable(items){
    table.innerHTML = "";
    const headerRow = document.createElement("tr");
    ["Item", "Price", "", "Stock"].forEach(i => {
        const th = document.createElement("th");
        th.textContent = i;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (const i of items){
        const tr = document.createElement("tr");

        let td = document.createElement("td");
        td.textContent = `${i.ITEMID} - ${i.ITEMNAME} - ${i.ITEMDESC}`;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = `<img src="currency.png" id="currency"> <span id="price${i.ITEMID}">${i.PRICE}</span>`
        tr.appendChild(td);

        td = document.createElement("td");
        const canvas = document.createElement("canvas");
        canvas.id = `chart${i.ITEMID}`;
        canvas.style.height = "3rem";
        canvas.style.marginBottom = "0";
        td.style.paddingBottom = "0";
        td.style.width = "15rem";
        canvas.style.width = "15rem";
        td.appendChild(canvas);
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = `<span id="stock${i.ITEMID}">${i.STOCK}</span>`;
        tr.appendChild(td);
        table.appendChild(tr);
    }
}

function updateCharts(items){
    for (const i of items){
        const id = i.ITEMID;
        const chartID = `chart${id}`;
        const ctx = document.getElementById(chartID);

        const span = document.getElementById(`price${i.ITEMID}`);
        if(span) span.textContent = i.PRICE;

        const sSpan = document.getElementById(`stock${i.ITEMID}`);
        if(sSpan) sSpan.textContent = i.STOCK;

        if(ctx){
            if(!charts[id]){
                charts[id] = new Chart(ctx,{
                    type: "line",
                    data:{
                        labels:[],
                        datasets:[{
                            label: `${i.ITEMNAME} Price`,
                            borderColor: "rgb(200, 0, 0)",
                            backgroundColor: "rgb(200, 0, 0, 0.3)",
                            borderWidth: 2,
                            tension: 0.2,
                            fill: true,
                        }],

                    },
                    options: {
                        layout:{
                            padding: {
                                top:0,
                                bottom:0,
                                left:0,
                                right:0
                            },

                        },
                        animation: false,
                        plugins: {
                            legend:{display: false},
                            tooltip: {enabled:false}
                        },
                        scales:{
                            x:{
                                display: false,
                                grid:{display: false, drawBorder: false},
                            },
                            y:{
                                beginAtZero:false,
                                display: false,
                                grid:{display: false, drawBorder: false},
                                ticks: {
                                    display: false
                                },
                                padding: 0
                            },
                        }
                    }
                });
            }
        }
        const chart = charts[id];
        const data = chart.data.datasets[0].data;
        const labels = chart.data.labels;

        data.push(i.PRICE);
        labels.push("");

        if(data.length > 10){
            data.shift();
            labels.shift();
        }

        chart.update();
    }
}

async function refresh(){
    const data = await fetchData();
    if(Object.keys(charts).length === 0){
        renderTable(data);
    }
    updateCharts(data);
}

let scrollDir = 1;

function scroll(){
    const scrollSpeed = 9;
    const scrollDelay = 30;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;

    if(currentScroll >= maxScroll){scrollDir = -1;}
    else if (currentScroll <= 0) scrollDir = 1;

    // Scroll smoothly
    window.scrollBy({
        top: scrollSpeed * scrollDir,
        behavior: "smooth"
    });

    setTimeout(scroll, scrollDelay);
}

scroll();




refresh();
setInterval(refresh, 6000);