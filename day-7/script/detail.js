function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    id: urlParams.get("id"),
  };
}

function loadUserDetails() {
  const params = getUrlParams();
  const userId = parseInt(params.id);

  if (!userId) {
    showError();
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((user) => user.id === userId);

  if (!user) {
    showError();
    return;
  }

  displayUserDetail(user);
}

function displayUserDetail(user) {
  document.getElementById("detailContent").style.display = "block";
  document.getElementById("detailImage").src = user.image;
  document.getElementById("detailName").textContent = user.name;
  document.getElementById("detailStartDate").textContent = user.startDate;
  document.getElementById("detailEndDate").textContent = user.endDate;
  document.getElementById("detailDesc").textContent = `${user.description}`;
  document.getElementById("detailTechnologies").innerHTML = renderTechnologies(
    user.technologies
  );
}

function renderTechnologies(technologies) {
  const icons = {
    nodejs: "fa-brands fa-node-js",
    react: "fa-brands fa-react",
    java: "fa-brands fa-java",
    android: "fa-brands fa-android",
  };

  return technologies
    .map(
      (tech) => `
                    <div class="d-flex gap-3 align-items-center w-50">
                        <i class="${
                          icons[tech]
                            ? icons[tech] + " fs-3"
                            : "fa-solid fa-code fs-3"
                        }"></i>
                        <p>${tech.charAt(0).toUpperCase() + tech.slice(1)}</p>
                    </div>
                `
    )
    .join("");
}

function showError() {
  document.getElementById("detailContent").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("detailContent")) {
    loadUserDetails();
  }
});
