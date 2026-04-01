const content = document.getElementById("content");

const PAGE_DATA = {
  home: {
    name: "Home",
    desc: "Welcome to 5166 Gamez. Play unblocked games anywhere."
  },
  games: {
    name: "Games",
    desc: "The list of all games. If you want to find a type of game to play, you can filter through the set categories."
  },
  changelogs: {
    name: "Changelogs",
    desc: "View updates, fixes, and new features added over time."
  },
  contact: {
    name: "Contact",
    desc: "Suggest games or get in touch using the form below."
  }
};

function updateHeader(section) {
  const icon = document.getElementById("page-icon");
  const name = document.getElementById("page-name");

  const headerIcon = document.getElementById("page-header-icon");
  const headerTitle = document.getElementById("page-header-title");
  const headerDesc = document.getElementById("page-header-desc");

  const data = PAGE_DATA[section];

  icon.src = `icons/pageicons/${section}.png`;
  name.textContent = data.name;

  headerIcon.src = `icons/pageicons/${section}.png`;
  headerTitle.textContent = data.name;
  headerDesc.textContent = data.desc;
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

        <div class="home-nav-grid">
          <div class="nav-card" onclick="loadSection('games')">
            <img src="icons/pageicons/games.png">
            <h3>Games</h3>
          </div>

          <div class="nav-card" onclick="loadSection('changelogs')">
            <img src="icons/pageicons/changelogs.png">
            <h3>Changelogs</h3>
          </div>

          <div class="nav-card" onclick="loadSection('contact')">
            <img src="icons/pageicons/contact.png">
            <h3>Contact</h3>
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
        <div class="contact-page">

          <div class="contact-sidebar">
            <div class="contact-card active" data-form="suggest">
              <h4>🎮 Game Suggestion</h4>
              <p>Recommend a game to add</p>
            </div>

            <div class="contact-card" data-form="feedback">
              <h4>🧪 Version Feedback</h4>
              <p>Give feedback on a specific version</p>
            </div>

            <div class="contact-card" data-form="ideas">
              <h4>💡 Suggestions/Feedback</h4>
              <p>Suggest features or improvements</p>
            </div>
          </div>

          <div class="contact-main">
            <div id="contact-placeholder">
              Select a category to get started.
            </div>

            <iframe id="contact-frame"
              style="display:none; width:100%; height:800px; border:none; border-radius:12px;">
            </iframe>
          </div>

        </div>
      `;

      setupContactPage();
      break;

      default:
      loadSection("home");
  }
}

function setupContactPage() {
  const cards = document.querySelectorAll(".contact-card");
  const frame = document.getElementById("contact-frame");
  const placeholder = document.getElementById("contact-placeholder");

  const forms = {
    suggest: "https://forms.gle/HRsR13dexkapaixH7",
    feedback: "https://forms.gle/qYNV3w9FzJhvd8Bj9",
    ideas: "https://forms.gle/Mv5Xt3qe4DwMYwNbA"
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {
      // active state
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      const formKey = card.getAttribute("data-form");

      // fade effect
      frame.style.opacity = 0;

      setTimeout(() => {
        frame.src = forms[formKey];
        frame.style.display = "block";
        placeholder.style.display = "none";

        frame.style.opacity = 1;
      }, 150);
    });
  });
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
    ${game.new ? `<div class="new-badge">NEW</div>` : ""}
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
  const currentCategory = game.category || "Miscellaneous";

  // find similar games
  const similarGames = ALL_GAMES.filter(g => {
    const category = g.category || "Miscellaneous";
    return category === currentCategory && g.name !== game.name;
  });

  // ONLY update the big page header
  document.getElementById("page-header-icon").src = game.icon;
  document.getElementById("page-header-title").textContent = game.name;
  document.getElementById("page-header-desc").textContent = currentCategory;

  content.innerHTML = `
    <div class="game-page">

      <div class="game-topbar">
        <button id="back-button">← Back</button>
      </div>

      <div class="game-container">
        <iframe id="game-iframe" src="${game.src}" width="1920" height="1080" frameborder="0" allowfullscreen></iframe>
      </div>

      <div class="game-actions">
        <button id="fullscreen-btn">Fullscreen</button>
        <button id="open-embed-btn">Open Embed</button>
      </div>

      <div class="similar-section">
        <h2>Similar Games</h2>
        <div id="similar-games" class="game-grid"></div>
      </div>

    </div>
  `;

  document.getElementById("back-button")
    .addEventListener("click", () => loadSection("games"));

  const iframe = document.getElementById("game-iframe");

  document.getElementById("fullscreen-btn").addEventListener("click", () => {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  });

  document.getElementById("open-embed-btn").addEventListener("click", () => {
    window.open(game.src, "_blank");
  });
  
  const similarContainer = document.getElementById("similar-games");

  if (similarGames.length === 0) {
    similarContainer.innerHTML = "<p>No similar games found.</p>";
    return;
  }

  similarGames.forEach(g => {
    renderGameCard(similarContainer, g);
  });

  // re-apply aspect ratio if saved
  const savedRatio = localStorage.getItem("aspectRatio");
  if (savedRatio) applyAspectRatio(savedRatio);
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

document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("link-dropdown-btn");
  const dropdownMenu = document.getElementById("link-dropdown-menu");
  const currentText = document.getElementById("current-link");

  if (!dropdownBtn) return;

  dropdownBtn.addEventListener("click", () => {
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  dropdownMenu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const link = btn.getAttribute("data-link");
      const name = btn.textContent;

      currentText.textContent = name;
      window.location.href = link;
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = "none";
    }
  });
});

loadSection("home");
