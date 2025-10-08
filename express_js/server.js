import express from "express";
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import hbs from "hbs";
import pool from "./db.js";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

app.post("/add-data", upload.single("image"), addData);
app.put("/edit-data/:id", upload.single("image"), editData);
app.delete("/delete-data/:id", deleteData);

function home(req, res) {
  const title = "Home";
  res.render("index", { title });
}

function projects(req, res) {
  const title = "My Projects";
  const data = readData();
  res.render("projects", { title, data });
}

function contact(req, res) {
  const title = "My Contact";
  res.render("contact", { title });
}

function detailProject(req, res) {
  res.render("detail-project");
}

// Read Data
function readData() {
  app.get("/get-data", async (req, res) => {
    try {
      const data = await pool.query("SELECT * FROM projects ORDER BY id DESC");
      res.json(data.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  });
}

// Create Data
export async function addData(req, res) {
  try {
    const { name, startDate, endDate, description, technology } = req.body;
    const imagePath = req.file ? `/assets/images/${req.file.filename}` : null;

    const query = `INSERT INTO projects (name, start_date, end_date, description, technology, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`;

    const values = [
      name,
      startDate,
      endDate,
      description,
      technology,
      imagePath,
    ];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Data added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add data" });
  }
}

// Edit Data
export async function editData(req, res) {
  try {
    const { id } = req.params;
    let { name, startDate, endDate, description, technology } = req.body;

    if (typeof technology === "string") {
      try {
        technology = JSON.parse(technology);
      } catch {
        technology = technology.replace(/[{}]/g, "").split(",");
      }
    }

    const imagePath = req.file ? `/assets/images/${req.file.filename}` : null;

    const oldData = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (oldData.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }

    const old = oldData.rows[0];

    const query = `
      UPDATE projects
      SET name = $1,
          start_date = $2,
          end_date = $3,
          description = $4,
          technology = $5,
          image = $6
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      name || old.name,
      startDate || old.start_date,
      endDate || old.end_date,
      description || old.description,
      technology || old.technology,
      imagePath || old.image,
      id,
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Data updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update data",
    });
  }
}

// Delete Data
export async function deleteData(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT image FROM projects WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }

    const imagePath = result.rows[0].image;

    await pool.query(`DELETE FROM projects WHERE id = $1 RETURNING *`, [id]);

    if (imagePath) {
      const fullPath = path.join(__dirname, "src", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Deleted image file: ${fullPath}`);
      }
    }

    res.json({
      success: true,
      message: "Data deleted successfully",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete data",
    });
  }
}

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
