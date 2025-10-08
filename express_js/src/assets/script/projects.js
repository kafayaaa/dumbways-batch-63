const userForm = document.getElementById("userForm");
const container = document.getElementById("cards");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Load Data
async function loadData() {
  try {
    const res = await fetch("http://localhost:3000/get-data");

    if (!res.ok) {
      console.error("Failed to fetch data:", data.message);
      return;
    }
    const data = await res.json();
    console.log(data);
    container.innerHTML = "";
    data.map((item) => {
      container.innerHTML += `
      <div class="card showcase-card p-3 shadow border-0">
        <a href="/detail-project/${
          item.id
        }" class="text-decoration-none text-black">
        <img src="${
          item.image
        }" class="card-img-top rounded ratio ratio-4x3" alt="..." />
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title mb-0">${item.name}</h5>
              <span class="text-secondary"> ${formatDate(
                item.start_date
              )} - ${formatDate(item.end_date)}</span>
              <p class="card-text mt-4">${item.description}</p>
              <div class="d-flex-justify-start align-items-center gap-5 fs-3 my-4">
               ${renderTechnologies(item.technology)}
             </div>
            </div>
          </div>
        </a>
        <div class="d-flex justify-content-between align-items-center gap-3" >
          <button onclick='setEditForm(${JSON.stringify(
            item
          )})' class="btn bg-black text-white w-100">edit</button>
          <button onclick='deleteData(${
            item.id
          })' class="btn bg-black text-white w-100">delete</button>
        </div>
      </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function renderTechnologies(technology) {
  const icons = {
    nodejs: "fa-brands fa-node-js",
    react: "fa-brands fa-react",
    java: "fa-brands fa-java",
    android: "fa-brands fa-android",
  };

  if (typeof technology === "string") {
    technology = technology.replace(/[{}]/g, "").split(",");
  }

  if (!Array.isArray(technology)) return "";

  return technology
    .map((tech) => `<i class="fa-brands fa-${tech.trim()}"></i>`)
    .join("");
}

// Add & Edit Data
userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("id").value;
  const formData = new FormData(userForm);

  const techs = [];
  document
    .querySelectorAll('input[name="technology"]:checked')
    .forEach((el) => techs.push(el.value));
  formData.set("technology", techs.join(","));

  let url = "http://localhost:3000/add-data";
  let method = "POST";

  if (id) {
    url = `http://localhost:3000/edit-data/${id}`;
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    body: formData,
  });

  const result = await res.json();
  console.log(result);

  if (result.success) {
    alert(result.message);
    loadData();
    userForm.reset();
    document.getElementById("id").value = "";
  } else {
    alert(result.error);
    console.error(result.error);
  }
});

// Edit Data
function setEditForm(data) {
  document.getElementById("id").value = data.id;
  document.getElementById("name").value = data.name;

  if (data.start_date) {
    document.getElementById("startDate").value = data.start_date.split("T")[0];
  }

  if (data.end_date) {
    document.getElementById("endDate").value = data.end_date.split("T")[0];
  }

  if (data.technology) {
    const techs =
      typeof data.technology === "string"
        ? data.technology.replace(/[{}]/g, "").split(",")
        : data.technology;

    document
      .querySelectorAll('input[name="technology"]')
      .forEach((el) => (el.checked = techs.includes(el.value)));
  }

  document.getElementById("description").value = data.description;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete Data
async function deleteData(id) {
  if (!confirm("Are you sure you want to delete this project?")) return;
  const res = await fetch(`http://localhost:3000/delete-data/${id}`, {
    method: "DELETE",
  });
  const result = await res.json();
  console.log(result);
  if (result.success) {
    alert(result.message);
    loadData();
  }
}

loadData();
