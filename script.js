document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    /* =========================================
       CINEMATIC INTRO (auto, first visit per session)
    ========================================= */

    const portfolioLock = document.getElementById("portfolioLock");
    const unlockButton = document.getElementById("unlockButton");
    const introProgressBar =
        document.getElementById("introProgressBar");
    const introProgress =
        document.getElementById("introProgress");
    const introPercent =
        document.getElementById("introPercent");

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches;

    function unlockPortfolio() {
        if (!portfolioLock || portfolioLock.classList.contains("is-unlocked")) {
            return;
        }

        portfolioLock.classList.add("is-unlocked");
        portfolioLock.setAttribute("aria-hidden", "true");

        body.classList.remove("portfolio-locked");

        setTimeout(() => {
            if (portfolioLock.parentNode) {
                portfolioLock.remove();
            }
        }, 800);
    }

    if (portfolioLock) {
        /* The styled Coded Lifestyle load plays on every visit. */
        const INTRO_DURATION = prefersReducedMotion
            ? 400
            : 2600;

        const startTime = performance.now();

        function tickProgress(now) {
            if (
                !portfolioLock ||
                portfolioLock.classList.contains("is-unlocked")
            ) {
                return;
            }

            const elapsed = now - startTime;
            const progress = Math.min(elapsed / INTRO_DURATION, 1);
            const value = Math.round(progress * 100);

            if (introProgressBar) {
                introProgressBar.style.width = value + "%";
            }

            if (introPercent) {
                introPercent.textContent = value + "%";
            }

            if (introProgress) {
                introProgress.setAttribute("aria-valuenow", value);
            }

            if (progress < 1) {
                requestAnimationFrame(tickProgress);
            } else {
                unlockPortfolio();
            }
        }

        requestAnimationFrame(tickProgress);

        /*
         * Interactive backdrop: orbit rings drift with the pointer.
         * Tap / click anywhere to enter immediately.
         */

        portfolioLock.addEventListener("pointermove", (event) => {
            if (prefersReducedMotion) {
                return;
            }

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const shiftX =
                ((event.clientX - centerX) / centerX) * -14;
            const shiftY =
                ((event.clientY - centerY) / centerY) * -10;

            portfolioLock.style.setProperty(
                "--shift-x",
                shiftX.toFixed(1) + "px"
            );
            portfolioLock.style.setProperty(
                "--shift-y",
                shiftY.toFixed(1) + "px"
            );
        });

        portfolioLock.addEventListener("click", () => {
            unlockPortfolio();
        });
    }

    if (unlockButton) {
        unlockButton.addEventListener("click", (event) => {
            event.stopPropagation();
            unlockPortfolio();
        });
    }

    /*
     * Enter key skips the intro.
     */

    window.addEventListener("keydown", (event) => {

        if (
            event.key === "Enter" &&
            portfolioLock &&
            !portfolioLock.classList.contains("is-unlocked")
        ) {
            event.preventDefault();

            unlockPortfolio();

            return;
        }

        if (
            event.key === "Escape" &&
            portfolioLock &&
            !portfolioLock.classList.contains("is-unlocked")
        ) {
            unlockPortfolio();

            return;
        }
    });


    /* =========================================
       THEME
    ========================================= */

    const themeToggle = document.getElementById("themeToggle");

    function updateThemeIcon() {

        if (!themeToggle) {
            return;
        }

        const icon = themeToggle.querySelector("i");

        if (!icon) {
            return;
        }

        if (body.classList.contains("light-theme")) {
            icon.className = "bi bi-moon-stars-fill";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        } else {
            icon.className = "bi bi-sun-fill";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        }
    }

    const savedTheme = localStorage.getItem("coded-theme");

    if (savedTheme === "light") {
        body.classList.add("light-theme");
    }

    updateThemeIcon();

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            body.classList.toggle("light-theme");

            const isLight =
                body.classList.contains("light-theme");

            localStorage.setItem(
                "coded-theme",
                isLight ? "light" : "dark"
            );

            updateThemeIcon();
        });
    }


    /* =========================================
       MOBILE NAVIGATION (self-contained slide-in)
    ========================================= */

    const mainNav = document.getElementById("mainNav");
    const navToggle = document.getElementById("navToggle");
    const mainNavbar = document.getElementById("mainNavbar");

    function isMobileNav() {
        return window.innerWidth <= 991;
    }

    function openMobileNav() {
        if (!mainNav) {
            return;
        }

        mainNav.classList.add("show");

        if (navToggle) {
            navToggle.classList.add("open");
            navToggle.setAttribute("aria-expanded", "true");
        }
    }

    function closeMobileNav() {
        if (!mainNav) {
            return;
        }

        mainNav.classList.remove("show");

        if (navToggle) {
            navToggle.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    }

    if (navToggle && mainNav) {
        navToggle.addEventListener("click", (event) => {
            event.stopPropagation();

            if (mainNav.classList.contains("show")) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (mainNav) {

        const menuLinks =
            mainNav.querySelectorAll(".nav-link, .nav-hire");

        menuLinks.forEach((link) => {

            link.addEventListener("click", () => {

                if (isMobileNav()) {
                    closeMobileNav();
                }
            });

        });

        document.addEventListener("click", (event) => {

            if (
                !isMobileNav() ||
                !mainNav.classList.contains("show")
            ) {
                return;
            }

            if (
                !mainNav.contains(event.target) &&
                !(navToggle && navToggle.contains(event.target))
            ) {
                closeMobileNav();
            }
        });

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                isMobileNav() &&
                mainNav.classList.contains("show")
            ) {
                closeMobileNav();

                if (navToggle) {
                    navToggle.focus();
                }
            }
        });

        window.addEventListener("resize", () => {

            if (!isMobileNav()) {
                closeMobileNav();
            }
        });
    }

    /* Sticky navbar shadow on scroll. */

    if (mainNavbar) {

        function updateNavbarShadow() {
            mainNavbar.classList.toggle(
                "scrolled",
                window.scrollY > 10
            );
        }

        updateNavbarShadow();

        window.addEventListener(
            "scroll",
            updateNavbarShadow,
            { passive: true }
        );
    }


    /* =========================================
       ACTIVE NAV LINK
    ========================================= */

    const sections =
        document.querySelectorAll("main section[id]");

    const navLinks =
        document.querySelectorAll(".nav-link");

    const navObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const id = entry.target.id;

                    navLinks.forEach((link) => {

                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${id}`
                        );

                    });

                });

            },
            {
                threshold: 0.35
            }
        );

    sections.forEach((section) => {
        navObserver.observe(section);
    });


    /* =========================================
       REVEAL ANIMATIONS
    ========================================= */

    const revealElements =
        document.querySelectorAll(".reveal");

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("visible");

                    if (entry.target.classList.contains("skill-card")) {

                        const progressSpan =
                            entry.target.querySelector(
                                ".skill-progress span"
                            );

                        if (
                            progressSpan &&
                            progressSpan.dataset.width
                        ) {
                            requestAnimationFrame(() => {
                                progressSpan.style.width =
                                    progressSpan.dataset.width;
                            });
                        }

                        const percentLabel =
                            entry.target.querySelector(
                                ".skill-percent"
                            );

                        if (
                            percentLabel &&
                            percentLabel.dataset.target
                        ) {
                            const target = parseInt(
                                percentLabel.dataset.target,
                                10
                            );

                            if (!isNaN(target)) {
                                const duration = 1400;
                                const startTime =
                                    performance.now();

                                function updatePercent(now) {
                                    const elapsed =
                                        now - startTime;
                                    const progress = Math.min(
                                        elapsed / duration,
                                        1
                                    );
                                    /* Ease-out for a smooth cinematic count. */
                                    const eased =
                                        1 -
                                        Math.pow(
                                            1 - progress,
                                            3
                                        );
                                    const current = Math.round(
                                        eased * target
                                    );

                                    percentLabel.textContent =
                                        current + "%";

                                    if (progress < 1) {
                                        requestAnimationFrame(
                                            updatePercent
                                        );
                                    } else {
                                        percentLabel.textContent =
                                            target + "%";
                                    }
                                }

                                requestAnimationFrame(
                                    updatePercent
                                );
                            }
                        }
                    }

                    observer.unobserve(entry.target);
                });

            },
            {
                threshold: 0.12
            }
        );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });


    /* =========================================
       PROJECT FILTER
    ========================================= */

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const projectCards =
        document.querySelectorAll(".project-card");

    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;

            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            projectCards.forEach((card) => {

                const categories =
                    card.dataset.category || "";

                if (
                    filter === "all" ||
                    categories.includes(filter)
                ) {
                    card.classList.remove("is-hidden");
                } else {
                    card.classList.add("is-hidden");
                }

            });

        });

    });


    /* =========================================
       GITHUB
    ========================================= */

    const githubContainer =
        document.getElementById("githubProjects");

    const githubUsername = "coded00128";

    const featuredRepoRules = [
        {
            title: "POS & Inventory System",
            terms: [
                "business-inventory",
                "inventory",
                "pos"
            ]
        },
        {
            title: "Coded Lifestyle",
            terms: [
                "coded-lifestyle",
                "codedlifestyle",
                "portfolio"
            ]
        },
        {
            title: "PrimeLand Real Estate",
            terms: [
                "primeland",
                "prime-land",
                "real-estate"
            ]
        },
        {
            title: "Bright Future Academy",
            terms: [
                "bright-future",
                "academy",
                "school"
            ]
        },
        {
            title: "QS Estimator",
            terms: [
                "qs-estimator",
                "quantity-survey",
                "quantity-surveyor"
            ]
        }
    ];

    function getMatchingRule(repo) {

        const repoName =
            repo.name.toLowerCase();

        return featuredRepoRules.find((rule) =>
            rule.terms.some((term) =>
                repoName.includes(term)
            )
        );
    }

    function createGithubCard(repo, rule) {

        const description =
            repo.description ||
            "A project built by Coded Lifestyle.";

        const language =
            repo.language ||
            "Software";

        const stars =
            Number(repo.stargazers_count || 0);

        const forks =
            Number(repo.forks_count || 0);

        return `
            <article class="github-card reveal visible">

                <div class="github-card-top">

                    <i class="bi bi-github"></i>

                    <a
                        href="${repo.html_url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open ${rule.title} repository"
                    >
                        <i class="bi bi-arrow-up-right"></i>
                    </a>

                </div>

                <h3>${rule.title}</h3>

                <p>${description}</p>

                <div class="github-meta">

                    <span>
                        <i class="bi bi-code-slash"></i>
                        ${language}
                    </span>

                    <span>
                        <i class="bi bi-star"></i>
                        ${stars}
                    </span>

                    <span>
                        <i class="bi bi-diagram-2"></i>
                        ${forks}
                    </span>

                </div>

            </article>
        `;
    }

    async function loadGithubProjects() {

        if (!githubContainer) {
            return;
        }

        try {

            const response =
                await fetch(
                    `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load GitHub repositories."
                );
            }

            const repos =
                await response.json();

            const selected = [];

            featuredRepoRules.forEach((rule) => {

                const match =
                    repos.find((repo) =>
                        getMatchingRule(repo) === rule
                    );

                if (match) {
                    selected.push({
                        repo: match,
                        rule
                    });
                }

            });

            if (!selected.length) {

                githubContainer.innerHTML = `
                    <div class="github-loading">
                        No selected repositories were found.
                    </div>
                `;

                return;
            }

            githubContainer.innerHTML =
                selected
                    .map((item) =>
                        createGithubCard(
                            item.repo,
                            item.rule
                        )
                    )
                    .join("");

        } catch (error) {

            console.error(error);

            githubContainer.innerHTML = `
                <div class="github-loading">
                    GitHub projects could not be loaded right now.
                </div>
            `;
        }
    }

    loadGithubProjects();


    /* =========================================
       COMMAND PALETTE
    ========================================= */

    const commandTrigger =
        document.getElementById("commandTrigger");

    const commandPalette =
        document.getElementById("commandPalette");

    const commandBackdrop =
        document.getElementById("commandBackdrop");

    const commandSearch =
        document.getElementById("commandSearch");

    const commandResults =
        document.getElementById("commandResults");

    function openCommandPalette() {

        if (!commandPalette) {
            return;
        }

        commandPalette.classList.add("open");

        commandPalette.setAttribute(
            "aria-hidden",
            "false"
        );

        setTimeout(() => {

            if (commandSearch) {
                commandSearch.focus();
            }

        }, 50);
    }

    function closeCommandPalette() {

        if (!commandPalette) {
            return;
        }

        commandPalette.classList.remove("open");

        commandPalette.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    if (commandTrigger) {
        commandTrigger.addEventListener(
            "click",
            openCommandPalette
        );
    }

    if (commandBackdrop) {
        commandBackdrop.addEventListener(
            "click",
            closeCommandPalette
        );
    }

    function executeCommand(command) {

        const locations = {
            home: "#home",
            about: "#about",
            work: "#work",
            services: "#services",
            skills: "#skills",
            github: "#github",
            contact: "#contact"
        };

        if (command === "theme") {

            if (themeToggle) {
                themeToggle.click();
            }

            closeCommandPalette();

            return;
        }

        if (locations[command]) {

            const section =
                document.querySelector(
                    locations[command]
                );

            if (section) {
                section.scrollIntoView({
                    behavior: "smooth"
                });
            }

            closeCommandPalette();
        }
    }

    if (commandResults) {

        commandResults
            .querySelectorAll("[data-command]")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        executeCommand(
                            button.dataset.command
                        );

                    }
                );

            });
    }

    if (commandSearch) {

        commandSearch.addEventListener(
            "input",
            () => {

                const search =
                    commandSearch.value
                        .trim()
                        .toLowerCase();

                commandResults
                    .querySelectorAll("[data-command]")
                    .forEach((button) => {

                        const text =
                            button.textContent
                                .toLowerCase();

                        button.style.display =
                            !search ||
                            text.includes(search)
                                ? "flex"
                                : "none";

                    });

            }
        );

        commandSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    const visibleButton =
                        [...commandResults.querySelectorAll(
                            "[data-command]"
                        )]
                        .find(
                            (button) =>
                                button.style.display !== "none"
                        );

                    if (visibleButton) {
                        visibleButton.click();
                    }
                }

            }
        );
    }


    /* =========================================
       KEYBOARD SHORTCUTS
    ========================================= */

    window.addEventListener("keydown", (event) => {

        const modifier =
            event.ctrlKey || event.metaKey;

        if (
            modifier &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();

            if (
                commandPalette &&
                commandPalette.classList.contains("open")
            ) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }

        if (
            event.key === "Escape" &&
            commandPalette &&
            commandPalette.classList.contains("open")
        ) {
            closeCommandPalette();
        }

    });


    /* =========================================
       CONTACT FORM
    ========================================= */

    const contactForm =
        document.getElementById("contactForm");

    const contactSubmit =
        document.getElementById("contactSubmit");

    const formMessage =
        document.getElementById("formMessage");

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (contactSubmit) {
                    contactSubmit.disabled = true;

                    contactSubmit.innerHTML =
                        "Sending...";
                }

                if (formMessage) {
                    formMessage.textContent = "";
                }

                try {

                    const response =
                        await fetch(
                            contactForm.action,
                            {
                                method: "POST",
                                body: new FormData(
                                    contactForm
                                ),
                                headers: {
                                    Accept:
                                        "application/json"
                                }
                            }
                        );

                    if (!response.ok) {
                        throw new Error(
                            "Message could not be sent."
                        );
                    }

                    contactForm.reset();

                    if (formMessage) {

                        formMessage.textContent =
                            "Your message has been sent successfully.";

                        formMessage.style.color =
                            "#35D6FF";
                    }

                } catch (error) {

                    console.error(error);

                    if (formMessage) {

                        formMessage.textContent =
                            "Something went wrong. Please try WhatsApp instead.";

                        formMessage.style.color =
                            "#f87171";
                    }

                } finally {

                    if (contactSubmit) {

                        contactSubmit.disabled = false;

                        contactSubmit.innerHTML =
                            `Send Message
                             <i class="bi bi-arrow-up-right"></i>`;
                    }

                }

            }
        );
    }


    /* =========================================
       FOOTER YEAR
    ========================================= */

    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }

});