// let users = JSON.parse(localStorage.getItem("users")) || [];
// let editingId = null;

const userForm = document.getElementById("userForm");
const container = document.getElementById("cards");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// renderUsers();

// userForm.addEventListener("submit", function (e) {
//   e.preventDefault();

//   const userData = {
//     name: document.getElementById("name").value,
//     startDate: document.getElementById("startDate").value,
//     endDate: document.getElementById("endDate").value,
//     description: document.getElementById("description").value,
//     technologies: Array.from(
//       document.querySelectorAll('input[name="technology"]:checked')
//     ).map((el) => el.value),
//     image: document.getElementById("image").files[0],
//   };

//   if (editingId) {
//     if (!userData.image) {
//       const existingUser = users.find((user) => user.id === editingId);
//       userData.image = existingUser ? existingUser.image : null;
//       updateUser(userData);
//     } else {
//       const reader = new FileReader();
//       reader.onload = function () {
//         userData.image = reader.result;
//         updateUser(userData);
//       };
//       reader.readAsDataURL(userData.image);
//     }
//     return;
//   } else {
//     if (!userData.image) {
//       alert("Please upload an image.");
//       return;
//     } else {
//       const reader = new FileReader();
//       reader.onload = function () {
//         userData.image = reader.result;
//         createUser(userData);
//       };
//       reader.readAsDataURL(userData.image);
//     }
//   }
// });

// // Create
// function createUser(userData) {
//   const newUser = {
//     id: Date.now(),
//     name: userData.name,
//     startDate: userData.startDate,
//     endDate: userData.endDate,
//     description: userData.description,
//     technologies: userData.technologies,
//     image: userData.image,
//   };
//   users.push(newUser);
//   saveTolocalStorage();
//   renderUsers();
//   resetForm();
// }

// // Read
// function renderUsers() {
//   container.innerHTML = "";
//   // Maping data
//   users.map((item) => {
//     container.innerHTML += `
//     <div class="card showcase-card p-3 shadow border-0">
//       <a href="detail-project.html?id=${
//         item.id
//       }" class="text-decoration-none text-black">
//         <img src="${
//           item.image
//         }" class="card-img-top rounded ratio ratio-4x3" alt="..." />
//         <div class="card-body d-flex flex-column justify-content-between">
//           <div>
//             <h5 class="card-title mb-0">${item.name}</h5>
//             <span class="text-secondary">${item.startDate} - ${
//       item.endDate
//     }</span>
//             <p class="card-text mt-4">${item.description}</p>
//             <div class="d-flex-justify-start align-items-center gap-5 fs-3 my-4">
//               ${renderTechnologies(item.technologies)}
//             </div>
//           </div>
//         </div>
//       </a>
//       <div class="d-flex justify-content-between align-items-center gap-3" >
//         <button onclick="editUser(${
//           item.id
//         })" class="btn bg-black text-white w-100">edit</button>
//         <button onclick="deleteUser(${
//           item.id
//         })" class="btn bg-black text-white w-100">delete</button>
//       </div>
//     </div>
//     `;
//   });
// }

// function renderTechnologies(technologies) {
//   const icons = {
//     nodejs: "fa-brands fa-node-js",
//     react: "fa-brands fa-react",
//     java: "fa-brands fa-java",
//     android: "fa-brands fa-android",
//   };

//   return technologies
//     .map((tech) => `<i class="${icons[tech] || "fa-solid fa-code"}"></i>`)
//     .join("");
// }

// // Delete
// function deleteUser(id) {
//   if (confirm("Are you sure you want to delete this user?")) {
//     users = users.filter((user) => user.id !== id);
//     saveTolocalStorage();
//     renderUsers();
//   }
// }

// // Edit
// function editUser(id) {
//   const user = users.find((user) => user.id === id);
//   if (user) {
//     document.getElementById("name").value = user.name;
//     document.getElementById("startDate").value = user.startDate;
//     document.getElementById("endDate").value = user.endDate;
//     document.getElementById("description").value = user.description;
//     Array.from(document.querySelectorAll('input[name="technology"]')).forEach(
//       (el) => {
//         el.checked = user.technologies.includes(el.value);
//       }
//     );

//     editingId = id;
//     saveBtn.textContent = "Update";
//     cancelBtn.style.display = "inline-block";
//   }
// }

// // Update
// function updateUser(userData) {
//   const userIndex = users.findIndex((user) => user.id === editingId);
//   if (userIndex !== -1) {
//     users[userIndex] = {
//       ...users[userIndex],
//       name: userData.name,
//       startDate: userData.startDate,
//       endDate: userData.endDate,
//       description: userData.description,
//       technologies: userData.technologies,
//       image: userData.image,
//     };
//     saveTolocalStorage();
//     renderUsers();
//     resetForm();
//   }
// }

// function resetForm() {
//   userForm.reset();
//   editingId = null;
//   saveBtn.textContent = "Add";

//   if (cancelBtn) {
//     cancelBtn.style.display = "none";
//   }
// }

// function cancelEdit() {
//   resetForm();
// }

// function saveTolocalStorage() {
//   localStorage.setItem("users", JSON.stringify(users));
// }

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
                item.startDate
              )} - ${formatDate(item.endDate)}</span>
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

function setEditForm(data) {
  document.getElementById("id").value = data.id;
  document.getElementById("name").value = data.name;
  document.getElementById("startDate").value = data.startDate;
  document.getElementById("endDate").value = data.endDate;
  document.getElementById("description").value = data.description;
  Array.from(document.querySelectorAll('input[name="technology"]')).forEach(
    (el) => {
      el.checked = data.technology.includes(el.value);
    }
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("id").value;
  const formData = new FormData(userForm);

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
  }
});

// Delete
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
