const content = document.getElementById("content");

function updateHeader(section) {
  const icon = document.getElementById("page-icon");
  const name = document.getElementById("page-name");

  icon.src = `icons/pageicons/${section}.png`;
  name.textContent = section.charAt(0).toUpperCase() + section.slice(1);
}

function loadSection(section) {
  updateHeader(section);

  switch (section) {
    case "home":
      content.innerHTML = `
        <div class="home-hero">
          <h1>5166 Gamez</h1>
          <p>Play unblocked games anywhere. Fast, clean, and always updating.</p>

          <div class="home-buttons">
            <button onclick="loadSection('games')">Browse Games</button>
            <button onclick="loadSection('changelogs')">What's New</button>
          </div>
        </div>
      `;
      break;

    case "games":
      loadGames();
      break;

    case "changelogs":
      loadChangelogs();
      break;

    case "contact":
      content.innerHTML = `
        <h2>Contact</h2>
        <p>Fill out the form below to suggest a game:</p>
        <iframe 
          src="https://docs.google.com/forms/d/e/1FAIpQLSfTl_4-B2gHmKEfpPzcFmRuFvSs_BfqOgZidXwgy8iGI4q8Iw/viewform?embedded=true" 
          width="640" 
          height="834" 
          frameborder="0" 
          marginheight="0" 
          marginwidth="0"
          style="border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.2); max-width: 90vw;">
          Loading…
        </iframe>
      `;
      break;

    default:
      loadSection("home");
  }
}

let ALL_CHANGELOGS = [];
let ACTIVE_LABEL = "All";

async function loadChangelogs() {
  content.innerHTML = `
    <div class="changelog-page">
    
      <div class="changelog-sidebar">
        <h3>Filters</h3>
        <div id="label-filters"></div>

        <h3>Releases</h3>
        <div id="release-list"></div>
      </div>

      <div class="changelog-main">
        <div id="changelog-list"></div>
      </div>

    </div>
  `;

  const list = document.getElementById("changelog-list");
  const labelFilters = document.getElementById("label-filters");
  const releaseList = document.getElementById("release-list");

  try {
    const response = await fetch("changelogs/index.json");
    const files = await response.json();

    ALL_CHANGELOGS = [];

    for (const file of files.reverse()) {
      const log = await fetch(`changelogs/${file}`).then(r => r.json());
      ALL_CHANGELOGS.push(log);
    }

    renderLabels(labelFilters);
    renderReleaseList(releaseList);
    renderFilteredLogs();

  } catch (err) {
    console.error(err);
    list.innerHTML = `<p>Failed to load changelogs.</p>`;
  }
}

function renderLabels(container) {
  container.innerHTML = "";

  const counts = {};

  ALL_CHANGELOGS.forEach(log => {
    (log.labels || []).forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });
  });

  const allBtn = createLabelButton("All", ALL_CHANGELOGS.length);
  container.appendChild(allBtn);

  Object.keys(counts).forEach(label => {
    container.appendChild(createLabelButton(label, counts[label]));
  });
}

function createLabelButton(label, count) {
  const btn = document.createElement("button");
  btn.className = "label-btn";
  btn.innerHTML = `${label} <span>${count}</span>`;

  btn.addEventListener("click", () => {
    ACTIVE_LABEL = label;
    renderFilteredLogs();
  });

  return btn;
}

function renderReleaseList(container) {
  container.innerHTML = "";

  ALL_CHANGELOGS.forEach((log, i) => {
    const btn = document.createElement("button");
    btn.textContent = log.version;

    btn.addEventListener("click", () => {
      document.getElementById(`log-${i}`).scrollIntoView({ behavior: "smooth" });
    });

    container.appendChild(btn);
  });
}

function renderFilteredLogs() {
  const list = document.getElementById("changelog-list");
  list.innerHTML = "";

  ALL_CHANGELOGS.forEach((log, i) => {
    if (ACTIVE_LABEL !== "All" && !(log.labels || []).includes(ACTIVE_LABEL)) return;

    const container = document.createElement("div");
    container.className = "changelog-block";
    container.id = `log-${i}`;

    const labelsHTML = (log.labels || [])
      .map(l => `<span class="label ${l}">${l}</span>`)
      .join(" ");

    container.innerHTML = `
      <div class="changelog-header">
        <div>${labelsHTML}</div>
        <button class="toggle-btn">▼</button>
      </div>

      <h3>${log.name}</h3>
      <p class="changelog-date">${log.date}</p>

      <div class="changelog-body">

        ${log.note ? `<p class="changelog-note">${log.note}</p>` : ""}

        ${log.changes.map(section => `
          <p><strong>${section.title}</strong></p>
          <ul>
            ${section.items.map(i => `<li>${i}</li>`).join("")}
          </ul>
        `).join("")}

      </div>
    `;

    const btn = container.querySelector(".toggle-btn");
    const body = container.querySelector(".changelog-body");

    btn.addEventListener("click", () => {
      body.style.display = body.style.display === "none" ? "block" : "none";
    });

    list.appendChild(container);
  });
}

let ALL_GAMES = [];
let ACTIVE_CATEGORY = "All";
let SEARCH_QUERY = "";

async function loadGames() {
  content.innerHTML = `
    <h2>Games</h2>

    <div class="games-topbar">
      <div id="category-filters" class="category-filters"></div>
      <input id="game-search" type="text" placeholder="🔍 Search..." />
    </div>

    <div id="game-grid" class="game-grid"></div>
  `;

  const grid = document.getElementById("game-grid");
  const filterContainer = document.getElementById("category-filters");
  const searchInput = document.getElementById("game-search");

  try {
    const res = await fetch("games/index.json");
    const files = await res.json();

    ALL_GAMES = [];

    for (const file of files) {
      const gameData = await fetch(`games/${file}`).then(r => r.json());
      ALL_GAMES.push(gameData);
    }

    renderCategories(filterContainer);
    renderGames();

    searchInput.addEventListener("input", () => {
      SEARCH_QUERY = searchInput.value.toLowerCase();
      ACTIVE_CATEGORY = "All"; // reset filter when searching
      highlightActiveCategory();
      renderGames();
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Failed to load games.</p>";
  }
}

function renderGameCard(container, game) {
  const card = document.createElement("div");
  card.className = "game-card";

  card.innerHTML = `
    <img src="${game.icon}" alt="${game.name}" class="game-icon">
    <h3 class="game-title">${game.name}</h3>
  `;

  card.addEventListener("click", () => {
    openGamePage(game);
  });

  container.appendChild(card);
}

function renderCategories(container) {
  container.innerHTML = "";

  const categories = new Set(["All"]);

  ALL_GAMES.forEach(game => {
     const category = game.category || "Miscellaneous";
     categories.add(category);
  });

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;

    if (cat === ACTIVE_CATEGORY) btn.classList.add("active");

    btn.addEventListener("click", () => {
      ACTIVE_CATEGORY = cat;
      SEARCH_QUERY = ""; // optional: clear search when filtering
      document.getElementById("game-search").value = "";
      highlightActiveCategory();
      renderGames();
    });

    container.appendChild(btn);
  });
}

function highlightActiveCategory() {
  document.querySelectorAll(".category-filters button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent === ACTIVE_CATEGORY) {
      btn.classList.add("active");
    }
  });
}

function renderGames() {
  const grid = document.getElementById("game-grid");
  grid.innerHTML = "";

  const filtered = ALL_GAMES.filter(game => {
    const category = game.category || "Miscellaneous";

    const matchesCategory =
      ACTIVE_CATEGORY === "All" || category === ACTIVE_CATEGORY;

    const matchesSearch =
      game.name.toLowerCase().includes(SEARCH_QUERY);

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p>No games found.</p>";
    return;
  }

  filtered.forEach(game => {
    renderGameCard(grid, game);
  });
}

function openGamePage(game) {
  content.innerHTML = `
    <div class="game-page">
      <div class="game-header">
        <button id="back-button">← Back</button>
        <div class="game-info">
          <img src="${game.icon}" alt="${game.name}" class="game-header-icon">
          <h2 class="game-header-title">${game.name}</h2>
        </div>
      </div>

      <div class="game-container">
        <iframe src="${game.src}" width="1920" height="1080" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `;

  const backBtn = document.getElementById("back-button");
  backBtn.addEventListener("click", () => loadSection("games"));
}

function showGame(embedHTML) {
  const frame = document.getElementById("game-frame");
  frame.innerHTML = embedHTML;

  const iframe = frame.querySelector("iframe");
  if (iframe) {
    iframe.addEventListener("error", () => {
      frame.innerHTML = "<p>Sorry, this game couldn't load.</p>";
    });
  }
}

async function loadHomeGames() {
  const res = await fetch("games/index.json");
  const files = await res.json();

  const games = [];
  for (const file of files.slice(-6)) { // last 6 games
    const data = await fetch(`games/${file}`).then(r => r.json());
    games.push(data);
  }

  const container = document.getElementById("home-games");
  games.reverse().forEach(game => renderGameCard(container, game));
}

function changeTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");

  const allowedThemes = ["dark", "light", "crimson", "midnight", "blossom", "shadow", "aurora", "solar"];

  if (allowedThemes.includes(saved)) {
    document.documentElement.setAttribute("data-theme", saved);
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
});

function toggleSettingsMenu() {
  if (!settingsOverlay) return;

  settingsOverlay.style.display =
    settingsOverlay.style.display === "flex" ? "none" : "flex";

  if (settingsOverlay.style.display === "flex") {
    renderSettingsCategories();
  }
}

function toggleGamesSubMenu() {
  const submenu = document.getElementById("games-submenu");
  const aspect = document.getElementById("aspect-submenu");
  aspect.style.display = "none";
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

function toggleAspectSubMenu() {
  const submenu = document.getElementById("aspect-submenu");
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

function setAspectRatio(ratio) {
  localStorage.setItem("aspectRatio", ratio);
  applyAspectRatio(ratio);
  
  ["aspect-submenu", "games-submenu", "settings-menu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

const settingsData = {
  "Site Preferences": [
    {
      name: "Theme",
      type: "options",
      display: "grid",
      options: ["dark","light","crimson","midnight","blossom","shadow","aurora","solar"],
      storageKey: "theme",
      onChange: changeTheme
    }
  ],

  "Games": [
    {
      name: "Aspect Ratio",
      type: "options",
      display: "row",
      options: ["16:9","4:3","21:9","1:1","3:2"],
      storageKey: "aspectRatio",
      onChange: applyAspectRatio
    }
  ]
};

const settingsOverlay = document.getElementById("settings-overlay");
const settingsCategories = document.getElementById("settings-categories");
const settingsOptions = document.getElementById("settings-options");
const settingsTitle = document.getElementById("settings-title");

document.getElementById("settings-button").addEventListener("click", () => {
  settingsOverlay.style.display = "flex";
  renderSettingsCategories();
});

document.getElementById("settings-close").addEventListener("click", () => {
  settingsOverlay.style.display = "none";
});

function renderSettingsCategories() {
  settingsCategories.innerHTML = "";
  Object.keys(settingsData).forEach((category, idx) => {
    const btn = document.createElement("button");
    btn.textContent = category;
    if (idx === 0) btn.classList.add("active");
    btn.addEventListener("click", () => {
      document.querySelectorAll("#settings-categories button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderSettingsOptions(category);
    });
    settingsCategories.appendChild(btn);
  });

  renderSettingsOptions(Object.keys(settingsData)[0]);
}

function renderSettingsOptions(category) {
  settingsOptions.innerHTML = "";
  settingsTitle.textContent = `Settings - ${category}`;
  settingsData[category].forEach(setting => {
    const div = document.createElement("div");
    div.className = "setting-option";

    const label = document.createElement("span");
    label.textContent = setting.name;
    div.appendChild(label);

    if (setting.type === "options") {
      const optionContainer = document.createElement("div");

      if (setting.display === "grid") {
        optionContainer.className = "options-grid";
      } else {
        optionContainer.className = "options-row";
      }
      setting.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;

        const saved = localStorage.getItem(setting.storageKey);
        if (saved === opt) btn.classList.add("selected");

        btn.addEventListener("click", () => {
          localStorage.setItem(setting.storageKey, opt);
          optionContainer.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          setting.onChange(opt);
        });

        optionContainer.appendChild(btn);
      });
      div.appendChild(optionContainer);
    }

    if (setting.type === "range") {
      const input = document.createElement("input");
      input.type = "range";
      input.min = setting.min;
      input.max = setting.max;
      input.step = setting.step;
      input.value = localStorage.getItem(setting.storageKey) || setting.min;

      input.addEventListener("input", () => {
        localStorage.setItem(setting.storageKey, input.value);
        setting.onChange(input.value);
      });

      div.appendChild(input);
    }

    settingsOptions.appendChild(div);
  });
}

function applyAspectRatio(ratio) {
  const iframe = document.querySelector(".game-container iframe");
  if (!iframe) return;
  const [w,h] = ratio.split(":").map(Number);
  const height = 720;
  const width = (height * w) / h;
  iframe.width = width;
  iframe.height = height;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedRatio = localStorage.getItem("aspectRatio");
  if (savedRatio) applyAspectRatio(savedRatio);
});

function toggleHeader() {
  const header = document.getElementById("main-header");
  const arrow = document.getElementById("arrow-icon");
  const toggleBtn = document.getElementById("toggle-header-btn");

  const hidden = header.classList.toggle("hidden");
  arrow.classList.toggle("rotated", hidden);

  toggleBtn.style.top = hidden ? "10px" : "70px";
}

document.addEventListener("DOMContentLoaded", () => {
  const githubBtn = document.getElementById("github-button");
  if (githubBtn) {
    githubBtn.addEventListener("click", () => {
      window.open("https://github.com/5166-gamez/home", "_blank");
    });
  }
});

loadSection("home");
