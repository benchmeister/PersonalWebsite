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
                background: var(--bg-panel, #0d1929);
                border: 1px solid rgba(125,211,252,0.14);
                border-radius: 4px;
                z-index: 200;
                scrollbar-width: thin;
            }
            @media (max-width: 1100px) { .toc-float { display: none; } }

            /* ═══════════════════════════════════════════════════════
               Two-column grid layout — inline 3-panel view
               ═══════════════════════════════════════════════════════ */
            .toc-layout-active {
                display: grid;
                grid-template-columns: 1fr 160px;
                column-gap: 14px;
                max-width: calc(100% - 20px) !important;
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
                top: 12px;
                align-self: start;
                width: 160px;
                max-height: 55vh;
                overflow-y: auto;
                background: var(--bg-panel, #0d1929);
                border: 1px solid rgba(125,211,252,0.14);
                border-radius: 4px;
                scrollbar-width: thin;
            }

            /* ═══════════════════════════════════════════════════════
               Shared TOC content styles
               ═══════════════════════════════════════════════════════ */
            .toc-title {
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 9px;
                font-weight: 500;
                color: var(--teal, #2dd4bf);
                background: var(--bg-panel-alt, #091422);
                border-bottom: 1px solid rgba(125,211,252,0.14);
                padding: 6px 10px;
                display: block;
                letter-spacing: 0.14em;
                text-transform: uppercase;
            }

            .toc-list {
                list-style: none;
                margin: 0;
                padding: 5px 8px 8px;
            }

            .toc-item { margin: 0; }

            .toc-link {
                display: block;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 11px;
                color: var(--text-muted, #7ea8c9);
                text-decoration: none;
                border: none !important;
                padding: 4px 4px;
                line-height: 1.45;
                transition: color 0.12s, background 0.12s;
                white-space: normal;
                word-break: break-word;
                border-radius: 2px;
            }

            .toc-link:hover {
                color: var(--ice, #7dd3fc) !important;
                background: rgba(125,211,252,0.06);
                border: none !important;
            }

            .toc-link.toc-active {
                font-weight: 500;
                color: var(--ice, #7dd3fc) !important;
                background: rgba(125,211,252,0.08);
            }

            .toc-h3 .toc-link {
                padding-left: 12px;
                font-size: 10px;
                color: var(--text-dim, #3d6480);
            }

            .toc-h3 .toc-link::before {
                content: '╰ ';
                opacity: 0.5;
                font-size: 9px;
            }

            /* Progress bar on float only */
            .toc-progress {
                position: absolute;
                left: 0;
                top: 24px;
                width: 2px;
                background: var(--teal, #2dd4bf);
                transition: height 0.12s linear;
                opacity: 0.7;
            }

            /* Back button inside inline TOC sidebar */
            .toc-back-inline {
                display: block;
                width: calc(100% - 16px);
                margin: 6px 8px 8px;
                padding: 5px 8px;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 10px;
                color: var(--text-muted, #7ea8c9);
                background: transparent;
                border: 1px solid rgba(125,211,252,0.18);
                border-radius: 2px;
                cursor: pointer;
                text-align: left;
                letter-spacing: 0.05em;
                transition: color 0.12s, background 0.12s, border-color 0.12s;
            }
            .toc-back-inline:hover {
                color: var(--ice, #7dd3fc);
                background: rgba(125,211,252,0.06);
                border-color: rgba(125,211,252,0.32);
            }

            /* Floating back button on standalone post pages */
            .toc-back-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 300;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 10px;
                font-weight: 500;
                letter-spacing: 0.08em;
                color: var(--text-muted, #7ea8c9);
                background: var(--bg-panel, #0d1929);
                border: 1px solid rgba(125,211,252,0.28);
                border-radius: 3px;
                padding: 6px 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                box-shadow: 0 6px 24px rgba(0,0,0,0.5);
                transition: all 0.15s;
            }
            .toc-back-btn:hover {
                color: var(--ice, #7dd3fc);
                box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 14px rgba(125,211,252,0.15);
            }
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

        // Back button inside sidebar, below the TOC links
        const backBtn = document.createElement('button');
        backBtn.className = 'toc-back-inline';
        backBtn.textContent = '← back to stream';
        backBtn.addEventListener('click', () => {
            // Find the last .back-btn-float (script.js appends its dynamic one to body)
            const btns = document.querySelectorAll('.back-btn-float');
            const target = btns[btns.length - 1];
            if (target) {
                target.style.display = 'block'; // briefly re-show so its click handler fires
                target.click();
            }
        });
        nav.appendChild(backBtn);

        // Hide all floating back buttons — the sidebar button replaces them
        document.querySelectorAll('.back-btn-float').forEach(b => b.style.display = 'none');

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
