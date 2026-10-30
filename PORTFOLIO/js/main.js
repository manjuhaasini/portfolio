/* =========================================
   MANJU HAASINI: PORTFOLIO
   js/main.js
   Sections: helpers, current page, mobile menu,
   theme toggle, count-up
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    // ---------- 1. MARK THE CURRENT PAGE IN THE NAV ----------

    const currentFile = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".site-nav a").forEach((link) => {
        const target = link.getAttribute("href").split("#")[0];
        if (target === currentFile) {
            link.setAttribute("aria-current", "page");
        }
    });


    // ---------- 2. MOBILE MENU ----------

    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("site-nav");

    if (menuToggle && nav) {

        const setMenu = (open) => {
            nav.classList.toggle("open", open);
            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        };

        menuToggle.addEventListener("click", () => {
            setMenu(!nav.classList.contains("open"));
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });

        document.addEventListener("click", (event) => {
            if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenu(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setMenu(false);
            }
        });

        window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
            if (event.matches) setMenu(false);
        });
    }


    // ---------- 3. THEME TOGGLE ----------
    // No saved choice: follow the device. Once the visitor clicks, remember it.

    const themeToggle = document.getElementById("theme-toggle");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    const currentTheme = () =>
        root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");

    const syncThemeButton = () => {
        if (!themeToggle) return;
        const next = currentTheme() === "dark" ? "light" : "dark";
        themeToggle.setAttribute("aria-label", "Switch to " + next + " mode");
    };

    if (themeToggle) {
        syncThemeButton();

        themeToggle.addEventListener("click", () => {
            const next = currentTheme() === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", next);

            try {
                localStorage.setItem("theme", next);
            } catch (e) {
                /* storage blocked: the choice just lasts for this visit */
            }

            syncThemeButton();
        });

        systemDark.addEventListener("change", syncThemeButton);
    }


    // ---------- 4. COUNT-UP ON THE NUMBERS STRIP ----------
    // The final numbers are already in the HTML, so the page reads
    // correctly without JavaScript. This only plays the animation once.

    const counters = document.querySelectorAll("[data-count]");

    if (counters.length && !reduceMotion && "IntersectionObserver" in window) {

        const formatter = new Intl.NumberFormat("en-IN");

        const runCounter = (el) => {
            const end = Number(el.dataset.count);
            const suffix = el.dataset.suffix || "";
            const duration = 1100;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = formatter.format(Math.round(end * eased)) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.querySelectorAll("[data-count]").forEach(runCounter);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        const strip = document.querySelector(".figures");
        if (strip) observer.observe(strip);
    }

});


/* =========================================
   WORK PAGE
   (appended: project filter and deep links)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const list = document.getElementById("work-list");
    if (!list) return;

    const filters = document.querySelectorAll(".filter");
    const items = list.querySelectorAll(":scope > li");
    const emptyNote = document.getElementById("empty-note");


    // ---------- FILTER ----------

    const applyFilter = (kind) => {
        let visible = 0;

        items.forEach((item) => {
            const show = kind === "all" || item.dataset.kind === kind;
            item.hidden = !show;
            if (show) visible++;
        });

        filters.forEach((button) => {
            const active = button.dataset.filter === kind;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        if (emptyNote) emptyNote.hidden = visible > 0;
    };

    filters.forEach((button) => {
        button.addEventListener("click", () => applyFilter(button.dataset.filter));
    });


    // ---------- OPEN A PROJECT FROM A LINK (work.html#grow-at-home-cup) ----------

    const openFromHash = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (!id) return;

        const target = document.getElementById(id);
        if (!target || !target.matches("details.project")) return;

        // Make sure an active filter isn't hiding it
        const parent = target.closest("li");
        if (parent && parent.hidden) applyFilter("all");

        target.open = true;
        target.scrollIntoView({ behavior: "auto", block: "start" });
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

});