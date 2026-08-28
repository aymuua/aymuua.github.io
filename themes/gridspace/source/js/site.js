(() => {
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-site-navigation]");
  const progress = document.querySelector("[data-reading-progress]");
  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchOverlay = document.querySelector("[data-search-overlay]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchClose = document.querySelector("[data-search-close]");
  const articleTocLinks = Array.from(document.querySelectorAll(".article-toc .toc-link"));
  const articleHeadings = articleTocLinks
    .map((link) => {
      const headingId = decodeURIComponent(link.hash.slice(1));
      return { link, heading: document.getElementById(headingId) };
    })
    .filter((item) => item.heading);

  /* ----- Mobile navigation ----- */

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1100) closeMenu();
    });
  }

  /* ----- Reading progress ----- */

  const updateScrollState = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 16);
    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
    if (articleHeadings.length) {
      let activeItem = articleHeadings[0];
      articleHeadings.forEach((item) => {
        if (item.heading.getBoundingClientRect().top <= 140) activeItem = item;
      });
      articleHeadings.forEach((item) => {
        item.link.classList.toggle("is-current", item === activeItem);
      });
    }
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  /* ----- Search ----- */

  let searchIndex = null;

  const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.setAttribute("aria-hidden", "false");
    searchOverlay.classList.add("is-open");
    if (searchInput) {
      searchInput.value = "";
      setTimeout(() => searchInput.focus(), 60);
    }
    if (searchResults) {
      searchResults.innerHTML = '<p class="search-hint">输入关键词开始搜索</p>';
    }
    if (!searchIndex) loadSearchIndex();
  };

  const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.setAttribute("aria-hidden", "true");
    searchOverlay.classList.remove("is-open");
  };

  const loadSearchIndex = () => {
    fetch("/search.json")
      .then((res) => res.json())
      .then((data) => {
        searchIndex = data;
      })
      .catch(() => {
        searchIndex = [];
      });
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("(" + escaped + ")", "gi");
    return text.replace(regex, "<em>$1</em>");
  };

  const performSearch = (query) => {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      searchResults.innerHTML = '<p class="search-hint">输入关键词开始搜索</p>';
      return;
    }

    if (!searchIndex || !searchIndex.length) {
      searchResults.innerHTML = '<p class="search-hint">搜索索引加载中…</p>';
      return;
    }

    const results = searchIndex
      .filter((item) => {
        const haystack = [item.title, item.text || "", (item.tags || []).join(" ")]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);

    if (!results.length) {
      searchResults.innerHTML = '<p class="search-no-results">没有找到匹配的文章</p>';
      return;
    }

    const html = results
      .map((item) => {
        const textSnippet = (item.text || "").substring(0, 160);
        const highlighted = highlightText(textSnippet, q);
        return (
          '<a class="search-result-item" href="' +
          item.url +
          '">' +
          '<span class="search-result-title">' +
          highlightText(item.title, q) +
          "</span>" +
          '<span class="search-result-excerpt">' +
          highlighted +
          "</span>" +
          "</a>"
        );
      })
      .join("");

    searchResults.innerHTML = html;
  };

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener("click", openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener("click", closeSearch);
  }

  if (searchOverlay) {
    searchOverlay.addEventListener("click", (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => performSearch(searchInput.value), 180);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay && searchOverlay.classList.contains("is-open")) {
      closeSearch();
    }
    if (
      (e.key === "k" && (e.ctrlKey || e.metaKey)) ||
      (e.key === "/" && !e.target.closest("input, textarea, [contenteditable]"))
    ) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ----- Code block language labels ----- */

  const codeLanguageNames = {
    bash: "Bash",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    css: "CSS",
    html: "HTML",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    json: "JSON",
    latex: "LaTeX",
    matlab: "MATLAB",
    plaintext: "Text",
    python: "Python",
    shell: "Shell",
    sql: "SQL",
    ts: "TypeScript",
    typescript: "TypeScript",
    xml: "XML",
    yaml: "YAML",
  };

  document.querySelectorAll(".post-content figure.highlight").forEach((block) => {
    const languageClass = Array.from(block.classList).find(
      (className) => className !== "highlight"
    );
    const language = languageClass
      ? codeLanguageNames[languageClass] || languageClass.toUpperCase()
      : "Code";

    block.dataset.language = language;
    block.setAttribute("role", "region");
    block.setAttribute("aria-label", `${language} 代码`);
  });

  /* ----- Spotify embed (hide when unreachable, e.g. no proxy) ----- */

  const spotifyPlayer = document.querySelector("[data-spotify-player]");

  if (spotifyPlayer) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    fetch("https://open.spotify.com/", {
      mode: "no-cors",
      signal: controller.signal,
    })
      .then(() => {
        clearTimeout(timeout);
        spotifyPlayer.classList.add("is-ready");
      })
      .catch(() => {
        clearTimeout(timeout);
        spotifyPlayer.remove();
      });
  }
})();
