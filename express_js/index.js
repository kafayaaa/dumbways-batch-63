import express from "express";
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import hbs from "hbs";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "data.json");
const images = path.join(__dirname, "src", "assets", "images");
if (!fs.existsSync(images)) {
  fs.mkdirSync(images);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, images);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.set("view engine", "hbs");
app.set("views", "./src/views");
app.use("/assets", express.static("src/assets"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Routes
app.get("/", home);
app.get("/projects", projects);
app.get("/contact", contact);
app.get("/detail-project", detailProject);

function home(req, res) {
  const title = "Home";
  res.render("index", { title });
}

function projects(req, res) {
  const title = "My Projects";
  res.render("projects", { title });
}

function contact(req, res) {
  const title = "My Contact";
  res.render("contact", { title });
}

function detailProject(req, res) {
  res.render("detail-project");
}

// Create Data
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.post("/add-data", upload.single("image"), (req, res) => {
  const { name, startDate, endDate, description, technology } = req.body;
  const newData = {
    id: Date.now(),
    name,
    startDate,
    endDate,
    description,
    technology: Array.isArray(technology)
      ? technology
      : technology
      ? [technology]
      : [],
    image: req.file ? `assets/images/${req.file.filename}` : null,
  };

  let data = [];
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath, "utf-8");
    try {
      data = JSON.parse(file);
    } catch (err) {
      data = [];
    }
  }

  data.push(newData);

  saveData(data);

  res.json({
    success: true,
    message: "Data added successfully",
    data: newData,
  });
});

// Read Data
function readData() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

app.get("/get-data", (req, res) => {
  const data = readData();
  res.json(data);
});

// Edit Data
app.put("/edit-data/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, description, technology } = req.body;
  let data = readData();
  const index = data.findIndex((item) => item.id == id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Data not found" });
  }

  data[index] = {
    ...data[index],
    name: name || data[index].name,
    startDate: startDate || data[index].startDate,
    endDate: endDate || data[index].endDate,
    description: description || data[index].description,
    technology: Array.isArray(technology)
      ? technology
      : technology
      ? [technology]
      : data[index].technology,
    image: req.file ? `assets/images/${req.file.filename}` : data[index].image,
  };

  saveData(data);

  res.json({
    success: true,
    message: "Data updated successfully",
    data: data[index],
  });
});

// Delete Data
app.delete("/delete-data/:id", (req, res) => {
  const { id } = req.params;
  let data = readData();
  const newData = data.filter((item) => item.id != id);
  if (newData.length === data.length) {
    return res.status(404).json({ success: false, message: "Data not found" });
  }
  saveData(newData);
  res.json({
    success: true,
    message: "Data deleted successfully",
  });
});

// Detail Data
app.get("/detail-project/:id", (req, res) => {
  const projectId = req.params.id;
  const data = readData();
  const detailData = data.find((item) => item.id == projectId);
  if (!detailData) {
    return res.status(404).json({ success: false, message: "Data not found" });
  }
  res.render("detail-project", { project: detailData });
});

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
