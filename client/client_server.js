const express = require("express");
const path = require("path");
const app = express();


app.use(express.static(path.join(__dirname)));
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
})


app.listen(8080, () => console.log("Frontend page is available on port 8080"))
