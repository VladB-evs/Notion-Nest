async function copyLink(path, btn) {
  const url = new URL(path, window.location.href).toString();
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
  const original = btn.textContent;
  btn.textContent = "Copied!";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, 1600);
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => copyLink(btn.dataset.path, btn));
});

const overlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalGrid = document.getElementById("modal-grid");
const modalClose = document.getElementById("modal-close");

function openVariations(card) {
  const variations = JSON.parse(card.dataset.variations);
  const cardTitle = card.querySelector(".card-title").textContent;

  modalTitle.textContent = `${cardTitle} — variations`;
  modalGrid.innerHTML = "";

  variations.forEach((v) => {
    const el = document.createElement("div");
    el.className = "variation-card";
    el.innerHTML = `
      <div class="variation-preview">
        <iframe src="${v.path}" loading="lazy" tabindex="-1"></iframe>
      </div>
      <div class="variation-body">
        <div class="variation-name">${v.name}</div>
        <div class="variation-desc">${v.desc}</div>
        <button class="btn primary copy-btn" data-path="${v.path}">Copy embed link</button>
      </div>
    `;
    el.querySelector(".copy-btn").addEventListener("click", (e) => copyLink(v.path, e.target));
    modalGrid.appendChild(el);
  });

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeVariations() {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".variations-btn").forEach((btn) => {
  btn.addEventListener("click", () => openVariations(btn.closest(".card")));
});

modalClose.addEventListener("click", closeVariations);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeVariations();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVariations();
});
