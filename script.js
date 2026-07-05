async function copyText(url, btn) {
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

function copyLink(path, btn) {
  const url = new URL(path, window.location.href).toString();
  copyText(url, btn);
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => copyLink(btn.dataset.path, btn));
});

const overlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalGrid = document.getElementById("modal-grid");
const modalClose = document.getElementById("modal-close");

function buildUrl(path, fields, values) {
  const url = new URL(path, window.location.href);
  (fields || []).forEach((f) => {
    const val = values[f.key];
    if (val) url.searchParams.set(f.key, val);
  });
  return url.toString();
}

function openVariations(card) {
  const variations = JSON.parse(card.dataset.variations);
  const cardTitle = card.querySelector(".card-title").textContent;

  modalTitle.textContent = `${cardTitle} — variations`;
  modalGrid.innerHTML = "";

  variations.forEach((v) => {
    const el = document.createElement("div");
    el.className = "variation-card";

    const hasFields = Array.isArray(v.fields) && v.fields.length > 0;
    const values = {};
    (v.fields || []).forEach((f) => (values[f.key] = f.default || ""));

    const previewClass = hasFields ? "variation-preview variation-preview-line" : "variation-preview";

    let fieldsHtml = "";
    if (hasFields) {
      fieldsHtml = `<div class="variation-fields">${v.fields
        .map((f) => {
          if (f.type === "select") {
            const opts = f.options
              .map((o) => `<option value="${o}" ${o === f.default ? "selected" : ""}>${o}</option>`)
              .join("");
            return `<div class="field-row"><label>${f.label}</label><select data-key="${f.key}">${opts}</select></div>`;
          }
          return `<div class="field-row"><label>${f.label}</label><input type="${f.type}" data-key="${f.key}" value="${f.default || ""}" /></div>`;
        })
        .join("")}</div>`;
    }

    el.innerHTML = `
      <div class="${previewClass}">
        <iframe src="${buildUrl(v.path, v.fields, values)}" loading="lazy" tabindex="-1"></iframe>
      </div>
      <div class="variation-body">
        <div class="variation-name">${v.name}</div>
        <div class="variation-desc">${v.desc}</div>
        ${fieldsHtml}
        <button class="btn primary copy-btn">Copy embed link</button>
      </div>
    `;

    const iframe = el.querySelector("iframe");
    const copyBtn = el.querySelector(".copy-btn");

    el.querySelectorAll("[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        values[input.dataset.key] = input.value;
        iframe.src = buildUrl(v.path, v.fields, values);
      });
    });

    copyBtn.addEventListener("click", () => copyText(buildUrl(v.path, v.fields, values), copyBtn));

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
