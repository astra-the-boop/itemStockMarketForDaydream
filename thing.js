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
    const stockChange = currentStock - prevStock;

    const demandRate = Math.max(-1, Math.min(1, demand / Math.max(1, initStock)));
    const scarcity = 1 + (1 - currentStock / Math.max(1, initStock)) * 0.5;
    const demandFactor = 1 + demandRate * 0.3;

    let newPrice = prevPrice * scarcity * demandFactor;

    if(demand === 0) newPrice = prevPrice * 0.99;

    const minPrice = prevPrice *0.7;
    const maxPrice = prevPrice * 1.3;

    if(Math.max(minPrice, Math.min(maxPrice, newPrice))>=0 || Math.max(minPrice, Math.min(maxPrice, newPrice))<=1){
        return Math.max(minPrice, Math.min(maxPrice, newPrice));
    }else if(Math.max(minPrice, Math.min(maxPrice, newPrice))<0){
        return 0.0;
    }else if(Math.max(minPrice, Math.min(maxPrice, newPrice))>1){
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

            blegh["ITEMID"] = row["ITEMID"];
            blegh["ITEMNAME"] = row["ITEMNAME"];
            blegh["ITEMDESC"] = row["ITEMDESC"];
            blegh["PRICE"] = Math.round(newPrice);
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

    // const body = document.querySelector("body");
    const table = document.querySelector("#table");

    const columnsx = ["ITEMID", "ITEMNAME", "ITEMDESC", "MINPRICE", "MAXPRICE", "STOCK"];
    const columns = ["ITEMID", "ITEMNAME", "ITEMDESC", "PRICE", "STOCK"];

    // console.log(price);
    if (price.length === 0) {
        // console.log("asdklj")
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
        // console.log(init);
        // console.log(price);
    }
    for (i = 0; i < parsed.length-1; i++) {
        const tr = document.createElement("tr");

        for (const col of columns) {
            const td = document.createElement("td");
            td.textContent = parsed[i][col] || "";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    res.send(dom.serialize());
})

app.use(express.static("./public"));

app.listen(port, () => {
    console.log("Server is running on port " + port);
});

