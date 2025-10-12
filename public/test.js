async function fetchData(){
    const res = await fetch("/data");
    return res.json();
}

let charts = {};

async function renderChart(){
    const data = await fetchData();
    const table = document.createElement("#table");
    table.innerHTML = "";

    data.forEach(i => {
        const tr = document.createElement("tr");

        const tdItem = document.createElement("td");
        tdItem.textContent = i;
    })
}