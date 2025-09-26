const data = [
  {
    img: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
    title: "Dumbways Mobile App - 2025",
    duration: "3 bulan",
    description:
      "App that used for dumbways student, it was deployed and can downloaded on playstore. Happy Download",
  },
  {
    img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    title: "Dumbways Website - 2025",
    duration: "4 bulan",
    description: "Website that used for dumbways student",
  },
  {
    img: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg",
    title: "Dumbways Cybersecurity - 2025",
    duration: "5 bulan",
    description: "Cybersecurity that used for dumbways student",
  },
  {
    img: "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg",
    title: "Dumbways Devops - 2025",
    duration: "3 bulan",
    description: "Devops that used for dumbways student",
  },
  {
    img: "https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg",
    title: "Dumbways Network Engineer - 2025",
    duration: "3 bulan",
    description: "Network Engineer that used for dumbways student",
  },
];

const container = document.getElementById("cards");

data.forEach((item) => {
  container.innerHTML += `
    <div class="card showcase-card p-3 shadow border-0">
    <a href="detail.html" class="text-decoration-none text-black">
        <img src="${item.img}" class="card-img-top rounded ratio ratio-4x3" alt="..." />
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title mb-0">${item.title}</h5>
            <span class="text-secondary">${item.duration}</span>
            <p class="card-text mt-4">${item.description}</p>
            <div
                class="d-flex-justify-start align-items-center gap-5 fs-3 my-4"
            >
                <i class="fa-brands fa-google-play"></i>
                <i class="fa-brands fa-android"></i>
                <i class="fa-brands fa-java"></i>
            </div>
          </div>
          <div
            class="d-flex justify-content-between align-items-center gap-3"
          >
            <a href="#" class="btn bg-black text-white w-100">edit</a>
            <a href="#" class="btn bg-black text-white w-100">delete</a>
          </div>
        </div>
      </a>
      </div>
    `;
});
