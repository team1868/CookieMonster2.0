const express = require("express");
let app = express();
const server = app.listen(process.env.PORT || 8080, () => {console.log(chalk.cyan(`Server listening on port ${process.env.PORT || 8080}`))});
const chalk = require("chalk");

require("./scouting/scouting-sync.js")(server);

app.set("view engine", "ejs");
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//config files


//routes
app.use("/config", require("./configRouter.js"))
app.use("/", require("./scouting/scouting.js"));
app.use("/analysis", require("./analysis/analysis.js"));
app.use("/admin", require("./admin/admin.js"));