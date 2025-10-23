const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const {JSDOM} = require("jsdom");
const app = express();

const port = 3069

let init = [];
let price = [];
let parsed = [];
let parsedRaw = [];
let prevStock = [];

app.set("view engine", "ejs");

function calcPrice(prevPrice, initStock, prevStock, currentStock) {
    const demand = prevStock - currentStock;
    // const stockChange = currentStock - prevStock;
    let newPrice = prevPrice;

    if(demand > 0.2*(currentStock)){
        newPrice *= 1.2;
        if(demand > 0.5*(currentStock)){
            newPrice *= 1.8;
            if(demand > 0.75*(currentStock)){
                newPrice *= 2;
            }
        }
    }else if(demand <= 0.1*(currentStock)){
        newPrice *= 0.9;
        if(demand <= 0){
            newPrice *= 0.7;
            if(demand <= -0.5*(currentStock)){
                newPrice *= 0.4;
            }
        }
    }

    if(demand === 0) newPrice = prevPrice * 0.99;


    if(newPrice>=0 || newPrice<=1){
        return newPrice;
    }else if(newPrice<0){
        return 0.0;
    }else if(newPrice>1){
        return 1.0;
    }
}

function loadData(){
    parsedRaw = [];
    fs.createReadStream("Untitled Spreadsheet.csv").pipe(csv()).on("data", (row) => {
        parsedRaw.push(row);
    }).on("end", () => {
        if(prevStock.length===0){
            prevStock = parsedRaw.map(r => Number(r["STOCK"]));
        }

        parsed = [];
        for(let i = 0; i < parsedRaw.length; i++){
            const row = parsedRaw[i];
            const blegh = {};

            const min = Number(row["MINPRICE"]);
            const max = Number(row["MAXPRICE"]);
            const stock = Number(row["STOCK"]);

            if(!price[i]) price[i] = (min+max)/2;
            if(!init[i]) init[i] = {STOCK:stock};

            const newPrice = calcPrice(price[i], init[i]["STOCK"], prevStock[i], stock);
            const fixedPrice = Math.min(max, Math.max(min, newPrice));

            blegh["ITEMID"] = row["ITEMID"];
            blegh["ITEMNAME"] = row["ITEMNAME"];
            blegh["ITEMDESC"] = row["ITEMDESC"];
            blegh["PRICE"] = Math.round(fixedPrice);
            blegh["STOCK"] = stock;

            parsed.push(blegh);
            price[i] = newPrice;
        }
        prevStock = parsedRaw.map(r => Number(r["STOCK"]));
        console.log("kaboom", parsed)
    })
}

loadData();
init = parsedRaw;
setInterval(loadData, 6000);


app.get("/data", (req, res) => {
    res.json(parsed);
});

app.get("/", (req, res) => {
    const html = fs.readFileSync("./public/index.html", "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const table = document.querySelector("#table");

    const columnsx = ["Item", "Price", "", "Stock"];
    const columns = ["ITEMID", "ITEMNAME", "ITEMDESC", "PRICE", "STOCK"];

    const trx = document.createElement("tr");
    for (const col of columnsx) {
        const th = document.createElement("th");
        const h3 = document.createElement("h3");
        h3.textContent = col;
        th.appendChild(h3);
        trx.appendChild(th);
    }
    table.appendChild(trx);

    if (price.length === 0) {
        price = [];
        init = [];
        for (let i = 0; i < parsed.length - 1; i++) {
            price.push(0.5);
            let x = [];
            for (const col of columns) {
                x.push(parsed[i][col]);
            }
            init.push(x);
        }
    }
    for (i = 0; i < parsed.length-1; i++) {
        const tr = document.createElement("tr");

        let td = document.createElement("td");
        td.textContent = (parsed[i]["ITEMID"] + " - " + parsed[i]["ITEMNAME"] + " - " + parsed[i]["ITEMDESC"]) || "";
        tr.appendChild(td);
        td = document.createElement("td");
        const img = document.createElement("img");
        img.src = "currency.png";
        img.style.height = "2rem";
        img.style.verticalAlign = "bottom";
        td.appendChild(img);
        const span = document.createElement("span");
        span.textContent = (parsed[i]["PRICE"]) || "";
        td.appendChild(span);
        tr.appendChild(td);
        td = document.createElement("td");
        const canvas = document.createElement("canvas");
        canvas.id = "chart"+parsed[i]["ITEMID"];
        td.appendChild(canvas);
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = (parsed[i]["STOCK"]) || "";
        tr.appendChild(td);
        table.appendChild(tr);
    }

    res.send(dom.serialize());
})



app.use(express.static("./public"));

app.listen(port, () => {
    console.log("Server is running on port " + port);
});

