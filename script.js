// test line to see if its actually building
const content = document.getElementById("content");

function updateHeader(section) {
  const icon = document.getElementById("page-icon");
  const name = document.getElementById("page-name");

  // Update icon + label based on section
  icon.src = `icons/pageicons/${section}.png`;
  name.textContent = section.charAt(0).toUpperCase() + section.slice(1);
}

function loadSection(section) {
  updateHeader(section);

  switch (section) {
    case "home":
      content.innerHTML = `
        <h2>Home</h2>
        <p>Welcome to 5166 Gamez! Use the buttons below or the header above to navigate pages.</p>
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
        <h2>Contact Us</h2>
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

async function loadChangelogs() {
  content.innerHTML = `
    <h2>Changelogs</h2>
    <div id="changelog-list" style="display: flex; flex-direction: column; gap: 20px;"></div>
  `;

  const list = document.getElementById("changelog-list");

  try {
    // Fetch list of changelogs
    const response = await fetch("changelogs/index.json");
    const files = await response.json();

    for (const file of files.reverse()) { // newest first
      const logData = await fetch(`changelogs/${file}`).then(r => r.json());
      renderChangelog(list, logData);
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = `<p>Failed to load changelogs.</p>`;
  }
}

function renderChangelog(list, log) {
  const container = document.createElement("div");
  container.className = "changelog-block";

  const header = document.createElement("h3");
  header.textContent = `${log.name} [${log.version}] - ${log.date}`;
  container.appendChild(header);

  const body = document.createElement("div");

  log.changes.forEach(section => {
    const title = document.createElement("p");
    title.textContent = `• ${section.title}`;
    body.appendChild(title);

    const ul = document.createElement("ul");
    section.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    body.appendChild(ul);
  });

  container.appendChild(body);
  list.appendChild(container);
}

async function loadGames() {
  content.innerHTML = `
    <h2>Games</h2>
    <div id="game-grid" class="game-grid"></div>
  `;

  const grid = document.getElementById("game-grid");

  try {
    // Get the list of JSON files
    const res = await fetch("games/index.json");
    const files = await res.json();

    for (const file of files) {
      const gameData = await fetch(`games/${file}`).then(r => r.json());
      renderGameCard(grid, gameData);
    }
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
    <h3 class="game-name">${game.name}</h3>
    <p class="game-desc">${game.description || ""}</p>
    <button class="play-btn">Play</button>
  `;

  card.querySelector(".play-btn").addEventListener("click", () => openGamePage(game));
  container.appendChild(card);
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

function changeTheme(theme) {
  const link = document.getElementById('theme-link');
  link.href = `themes/${theme}.css`;
  localStorage.setItem('theme', theme); // save preference
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'dark';
  changeTheme(saved);
});

function toggleThemeMenu() {
  const menu = document.getElementById("theme-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Collapse/Expand header
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
