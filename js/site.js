(() => {
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-site-navigation]");
  const backToTop = document.querySelector("[data-back-to-top]");
  const progress = document.querySelector("[data-reading-progress]");
  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchOverlay = document.querySelector("[data-search-overlay]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchClose = document.querySelector("[data-search-close]");

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
      body.classList.toggle("menu-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1100) closeMenu();
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const updateScrollState = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 16);

    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const article = document.querySelector("#article-content");
  const tocList = document.querySelector("[data-toc-list]");

  if (article && tocList) {
    const headings = [...article.querySelectorAll("h2, h3")];
    const usedIds = new Set();

    const createId = (heading, index) => {
      const base = (heading.textContent || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u3400-\u9fff-]/g, "")
        .replace(/^-+|-+$/g, "") || `section-${index + 1}`;

      let candidate = base;
      let suffix = 2;
      while (usedIds.has(candidate)) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(candidate);
      return candidate;
    };

    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = createId(heading, index);

      const item = document.createElement("li");
      item.className = `toc-level-${heading.tagName === "H2" ? "2" : "3"}`;

      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.dataset.index = String(index + 1).padStart(2, "0");
      link.textContent = heading.textContent;
      item.appendChild(link);
      tocList.appendChild(item);
    });

    const tocLinks = [...tocList.querySelectorAll("a")];
    if (headings.length && "IntersectionObserver" in window) {
      const headingObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (!visible.length) return;
          const activeId = visible[0].target.id;
          tocLinks.forEach((link) => {
            link.classList.toggle("is-active", link.hash === `#${activeId}`);
          });
        },
        { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
      );

      headings.forEach((heading) => headingObserver.observe(heading));
    }
  }

  /* ===== Search ===== */

  let searchIndex = null;

  const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.setAttribute("aria-hidden", "false");
    searchOverlay.classList.add("is-open");
    body.classList.add("menu-open");
    if (searchInput) {
      searchInput.value = "";
      setTimeout(() => searchInput.focus(), 100);
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
    body.classList.remove("menu-open");
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
    // Ctrl+K or / to open search
    if (
      (e.key === "k" && (e.ctrlKey || e.metaKey)) ||
      (e.key === "/" && !e.target.closest("input, textarea, [contenteditable]"))
    ) {
      e.preventDefault();
      openSearch();
    }
  });
})();
