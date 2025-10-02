const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const {JSDOM} = require("jsdom");
const app = express();

const port = 3069


let parsed = [];
app.set("view engine", "ejs");
function loadData(){
    parsed = [];
    fs.createReadStream("Untitled Spreadsheet.csv").pipe(csv()).on("data", (row)=>{
        parsed.push(row);
    }).on("end", () => {
        console.log(parsed)
    });
}

loadData();
setInterval(loadData, 10000);


app.get("/data", (req, res) => {
    res.json(parsed);
});

app.get("/", (req, res) => {
    const html = fs.readFileSync("./public/index.html", "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const body = document.querySelector("body");
    const table = document.querySelector("#table");

    const columns = ["ITEMID", "ITEMNAME", "ITEMDESC", "MINPRICE", "MAXPRICE", "STOCK"];

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

