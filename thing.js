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
    let demand = prevStock - currentStock;
    let stockRatio = currentStock - initStock;

    let scarcity = 1+ (1-stockRatio)*0.8;

    let demandFactor = 1+ (demand/Math.max(1, initStock)) * 2;
    let newPrice = prevPrice * scarcity * demandFactor;

    if (demand <= 0){
        newPrice *= 0.9;
    }
    let minPrice = prevPrice * 0.5;
    let maxPrice = prevPrice *3;
    return Math.max(minPrice, Math.min(maxPrice, newPrice));
}

function loadData(){
    parsedRaw = [];
    fs.createReadStream("Untitled Spreadsheet.csv").pipe(csv()).on("data", (row)=>{
        parsed.push(row);
    }).on("end", () => {});
    parsed = [];
    if(prevStock.length === 0){
        for(let i = 0; i < parsedRaw.length; i++){
            prevStock.push(parsedRaw[i]["STOCK"]);
        }
    }
    for(let i = 0; i < parsedRaw.length; i++){
        const blegh = {}
        for (const key in parsedRaw[i]) {
            console.log(key)
            console.log(calcPrice(price[i], init[i]["STOCK"], prevStock[i], prevStock[i]))
            if(key==="MINPRICE"){
                blegh["PRICE"] = (parsedRaw[i]["MAXPRICE"] - parsedRaw[i]["MINPRICE"]) * calcPrice(price[i], init[i]["STOCK"], prevStock[i], prevStock[i]) + parsedRaw[i]["MINPRICE"];
                console.log("asd")
                console.log(calcPrice(price[i], init[i]["STOCK"], prevStock[i], prevStock[i]))
            }
            else if(key!=="MAXPRICE"){
                blegh[key] = parsedRaw[i][key];
            }
        }
        parsed.push(blegh);
    }
    for(let i = 0; i < parsedRaw.length; i++){
        prevStock.push(parsedRaw[i]["STOCK"]);
    }
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

