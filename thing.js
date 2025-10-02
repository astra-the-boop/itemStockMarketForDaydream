const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const {JSDOM} = require("jsdom");
const app = express();

const port = 3069

let parsed = [];

app.set("view engine", "ejs");

fs.createReadStream("Untitled Spreadsheet.csv").pipe(csv()).on("data", (row)=>{
    parsed.push(row);
}).on("end", () => {
    console.log(parsed)
});


app.get("/", (req, res) => {
    const html = fs.readFileSync("./public/index.html", "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const body = document.querySelector("body");
    const table = document.querySelector("#table");

    for (i = 0; i < parsed.length-1; i++) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = parsed[i]["ITEMNAME"];
        tr.appendChild(td);
        table.appendChild(tr);
    }



    // const h1 = document.createElement("h1");
    // h1.textContent = "DOM Manipulation Works";
    // h1.style.color = "red";
    // document.body.insertBefore(h1, table);

    res.send(dom.serialize());
})

app.use(express.static("./public"));

app.listen(port, () => {
    console.log("Server is running on port " + port);
});

