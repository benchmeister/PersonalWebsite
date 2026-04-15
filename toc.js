(function () {

    if (!document.getElementById('toc-styles')) {
        const style = document.createElement('style');
        style.id = 'toc-styles';
        style.textContent = `

            /* ═══════════════════════════════════════════════════════
               Floating sidebar — standalone post page (direct URL)
               ═══════════════════════════════════════════════════════ */
            .toc-float {
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
                left: calc(50% + 415px);
                width: 200px;
                max-height: 65vh;
                overflow-y: auto;
                background: var(--bg-panel, #d4d0c8);
                box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff,
                            inset -2px -2px #808080, inset 2px 2px #dfdfdf;
                z-index: 200;
                scrollbar-width: thin;
            }
            @media (max-width: 1100px) { .toc-float { display: none; } }

            /* ═══════════════════════════════════════════════════════
               Two-column grid layout — inline 3-panel view
               ═══════════════════════════════════════════════════════ */
            .toc-layout-active {
                display: grid;
                grid-template-columns: 1fr 185px;
                column-gap: 20px;
                max-width: 1000px !important;
                align-items: start;
            }

            /* Header and footer span both columns */
            .toc-layout-active .post-header,
            .toc-layout-active .post-footer {
                grid-column: 1 / -1;
            }

            /* Body stays in column 1 */
            .toc-layout-active .post-body {
                grid-column: 1;
                grid-row: 2;
            }

            /* Sidebar occupies column 2, row 2, and sticks while scrolling */
            .toc-sidebar {
                grid-column: 2;
                grid-row: 2;
                position: sticky;
                top: 35vh;
                align-self: start;
                max-height: 55vh;
                overflow-y: auto;
                background: var(--bg-panel, #d4d0c8);
                box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff,
                            inset -2px -2px #808080, inset 2px 2px #dfdfdf;
                scrollbar-width: thin;
            }

            /* ═══════════════════════════════════════════════════════
               Shared TOC content styles
               ═══════════════════════════════════════════════════════ */
            .toc-title {
                font-family: Arial, 'Tahoma', sans-serif;
                font-size: 11px;
                font-weight: bold;
                color: #ffffff;
                background: linear-gradient(to right, #000080, #1084d0);
                padding: 3px 8px;
                display: block;
                letter-spacing: 0.04em;
            }

            .toc-list {
                list-style: none;
                margin: 0;
                padding: 4px 8px 8px;
            }

            .toc-item { margin: 0; }

            .toc-link {
                display: block;
                font-family: Arial, 'Tahoma', sans-serif;
                font-size: 12px;
                color: #000080;
                text-decoration: underline;
                border: none !important;
                padding: 3px 2px;
                line-height: 1.4;
                transition: background 0.1s;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .toc-link:hover {
                background: #000080;
                color: #ffffff !important;
                text-decoration: none;
                border: none !important;
            }

            .toc-link.toc-active {
                font-weight: bold;
                color: #000080 !important;
                text-decoration: none;
                background: rgba(0,0,128,0.08);
            }

            .toc-h3 .toc-link {
                padding-left: 12px;
                font-size: 11px;
                color: #444;
            }

            .toc-h3 .toc-link::before {
                content: '╰ ';
                opacity: 0.45;
                font-size: 9px;
            }

            /* Progress bar on float only */
            .toc-progress {
                position: absolute;
                left: 0;
                top: 22px;
                width: 2px;
                background: #000080;
                transition: height 0.12s linear;
            }

            /* Floating back button on standalone post pages */
            .toc-back-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 300;
                font-family: Arial, 'Tahoma', sans-serif;
                font-size: 11px;
                font-weight: bold;
                color: #000000;
                background: #d4d0c8;
                box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff,
                            inset -2px -2px #808080, inset 2px 2px #dfdfdf;
                border: none;
                padding: 4px 14px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
            .toc-back-btn:hover { background: #c8c4bc; }
        `;
        document.head.appendChild(style);
    }

    function slugify(text, i) {
        const s = text.trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 60);
        return s || 'section-' + i;
    }

    function makeLinks(headings, onClickFn) {
        const ul = document.createElement('ul');
        ul.className = 'toc-list';
        const links = [];
        headings.forEach(h => {
            const li = document.createElement('li');
            li.className = 'toc-item toc-' + h.tagName.toLowerCase();
            const a = document.createElement('a');
            a.href = '#' + h.id;
            a.className = 'toc-link';
            a.textContent = h.textContent.trim();
            a.addEventListener('click', e => { e.preventDefault(); onClickFn(h); });
            li.appendChild(a);
            ul.appendChild(li);
            links.push(a);
        });
        return { ul, links };
    }

    // ── Floating sidebar (standalone post page) ───────────────────────
    function buildFloat() {
        document.querySelector('.toc-float')?.remove();

        const body = document.querySelector('.post-body');
        if (!body) return;

        const headings = Array.from(body.querySelectorAll('h2, h3'));
        if (headings.length < 2) return;
        headings.forEach((h, i) => { if (!h.id) h.id = slugify(h.textContent, i); });

        const nav = document.createElement('nav');
        nav.className = 'toc-float';
        nav.setAttribute('aria-label', 'Table of contents');

        const progress = document.createElement('div');
        progress.className = 'toc-progress';
        nav.appendChild(progress);

        const titleEl = document.createElement('div');
        titleEl.className = 'toc-title';
        titleEl.textContent = 'CONTENTS';
        nav.appendChild(titleEl);

        const { ul, links } = makeLinks(headings, h => {
            h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        nav.appendChild(ul);
        document.body.appendChild(nav);

        // Floating back button for standalone post pages
        document.querySelector('.toc-back-btn')?.remove();
        const backBtn = document.createElement('a');
        backBtn.className = 'toc-back-btn';
        backBtn.href = '../index.html';
        backBtn.textContent = '← back to stream';
        document.body.appendChild(backBtn);

        function setActive(i) {
            links.forEach(l => l.classList.remove('toc-active'));
            if (links[i]) links[i].classList.add('toc-active');
            progress.style.height = headings.length > 1
                ? (i / (headings.length - 1)) * 100 + '%' : '0%';
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const i = headings.indexOf(e.target);
                    if (i !== -1) setActive(i);
                }
            });
        }, { rootMargin: '-10% 0px -78% 0px', threshold: 0 });

        headings.forEach(h => observer.observe(h));
        setActive(0);
    }

    // ── Sticky sidebar grid (inline 3-panel view) ─────────────────────
    function buildSidebar(panelFeed) {
        document.querySelector('.toc-sidebar')?.remove();

        const postPage = document.querySelector('.post-page');
        const body = document.querySelector('.post-body');
        if (!body || !postPage) return;

        const headings = Array.from(body.querySelectorAll('h2, h3'));
        if (headings.length < 2) return;
        headings.forEach((h, i) => { if (!h.id) h.id = slugify(h.textContent, i); });

        const nav = document.createElement('nav');
        nav.className = 'toc-sidebar';
        nav.setAttribute('aria-label', 'Table of contents');

        const titleEl = document.createElement('div');
        titleEl.className = 'toc-title';
        titleEl.textContent = 'CONTENTS';
        nav.appendChild(titleEl);

        const { ul, links } = makeLinks(headings, h => {
            if (!panelFeed) return;
            const offset = h.getBoundingClientRect().top
                         - panelFeed.getBoundingClientRect().top - 20;
            panelFeed.scrollBy({ top: offset, behavior: 'smooth' });
        });
        nav.appendChild(ul);

        // Insert sidebar into the post-page and activate grid layout
        postPage.appendChild(nav);
        postPage.classList.add('toc-layout-active');

        function setActive(i) {
            links.forEach(l => l.classList.remove('toc-active'));
            if (links[i]) links[i].classList.add('toc-active');
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const i = headings.indexOf(e.target);
                    if (i !== -1) setActive(i);
                }
            });
        }, { root: panelFeed, rootMargin: '-10% 0px -78% 0px', threshold: 0 });

        headings.forEach(h => observer.observe(h));
        setActive(0);
    }

    // ── Public API ────────────────────────────────────────────────────
    window.initTOC = function (scrollEl) {
        if (scrollEl && scrollEl !== window) {
            buildSidebar(scrollEl);
        } else {
            buildFloat();
        }
    };

    // ── Auto-init on standalone post pages only ───────────────────────
    if (!document.getElementById('panel-feed')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', buildFloat);
        } else {
            buildFloat();
        }
    }

})();
