import express from "express";
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import hbs from "hbs";
import pool from "./db.js";
import bcrypt from "bcrypt";
import flash from "express-flash";
import session from "express-session";

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
app.use(flash());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60, // ✅ 1 jam (dalam milidetik)
    },
  })
);

// Routes
app.get("/", home);
app.get("/projects", projects);
app.get("/contact", contact);
app.get("/detail-project/:id", detailData);

// Auth
app.get("/login", login);
app.post("/login", loginHandler);
app.get("/register", register);
app.post("/register", registerHandler);
app.get("/logout", logoutHandler);

app.post("/add-data", upload.single("image"), addData);
app.put("/edit-data/:id", upload.single("image"), editData);
app.delete("/delete-data/:id", deleteData);

function home(req, res) {
  const title = "Home";
  const userData = req.session.user;
  res.render("index", { title, userData });
}

function projects(req, res) {
  const title = "My Projects";
  const data = readData();
  const userData = req.session.user;
  if (!userData) {
    return res.redirect("/login");
  }
  res.render("projects", { title, data, userData });
}

function contact(req, res) {
  const title = "My Contact";
  const userData = req.session.user;
  res.render("contact", { title, userData });
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
export async function detailData(req, res) {
  try {
    const userData = req.session.user;
    if (!userData) {
      return res.redirect("/login");
    }

    const { id } = req.params;

    const query = "SELECT * FROM projects WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Project not found");
    }

    const project = result.rows[0];

    let technologies = project.technology;
    if (typeof technologies === "string") {
      technologies = technologies.replace(/[{}"]/g, "").split(",");
    }

    res.render("detail-project", {
      project: {
        ...project,
        technology: technologies,
        startDate: new Date(project.start_date).toISOString().split("T")[0],
        endDate: new Date(project.end_date).toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching project detail:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Login
function login(req, res) {
  const title = "LOGIN";
  const userData = req.session.user;
  if (userData) {
    return res.redirect("/");
  }
  res.render("login", { title });
}

// Login Handler
export async function loginHandler(req, res) {
  const { email, password } = req.body;

  const isRegistered = await pool.query(
    `SELECT * FROM public.users WHERE email='${email}'`
  );

  if (isRegistered.rowCount === 0) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, isRegistered.rows[0].password);

  if (!isMatch) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/login");
  }

  req.session.user = {
    username: isRegistered.rows[0].username,
    email: isRegistered.rows[0].email,
  };

  res.redirect("/projects");
}

// Logout Handler
export function logoutHandler(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/login");
  });
}

// Register
export async function register(req, res) {
  const title = "REGISTER";
  const userData = req.session.user;
  if (userData) {
    return res.redirect("/");
  }
  res.render("register", { title });
}

// Register Handler
export async function registerHandler(req, res) {
  try {
    const { username, email, password } = req.body;

    const isRegistered = await pool.query(
      "SELECT * FROM public.users WHERE email = $1",
      [email]
    );
    if (isRegistered.rowCount > 0) {
      console.log("Email already registered");
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO public.users (username, email, password) VALUES ($1, $2, $3) RETURNING *`;
    const values = [username, email, hashedPassword];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
}

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
