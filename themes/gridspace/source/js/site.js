(() => {
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-site-navigation]");
  const backToTop = document.querySelector("[data-back-to-top]");
  const progress = document.querySelector("[data-reading-progress]");

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
})();
