import express from "express";
const app = express();
const port = 3000;

app.set("view engine", "hbs");
app.set("views", "./src/views");
app.use("/assets", express.static("src/assets"));

app.get("/", (req, res) => {
  const title = "Day 8";
  res.render("index", { title });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
