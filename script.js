// ─── Uptime display ─────────────────────────────────────────────
const startDate = new Date('2024-10-15');
function updateUptime() {
    const days = Math.floor((Date.now() - startDate.getTime()) / 86400000);
    const el = document.getElementById('uptime-val');
    if (el) el.textContent = days + 'd';
}
updateUptime();

// ─── Latest entry date (skips placeholder dates) ─────────────────
const latestEl = document.getElementById('stat-latest');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let latestDate = null, latestDisplay = null;
document.querySelectorAll('.feed-entry .feed-ts').forEach(ts => {
    const text = ts.textContent.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const d = new Date(text);
        if (!isNaN(d) && (!latestDate || d > latestDate)) {
            latestDate = d;
            latestDisplay = months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0');
        }
    }
});
if (latestEl && latestDisplay) latestEl.textContent = latestDisplay;

// ─── Floating back button (visible while reading a post inline) ──
const backBtnFloat = document.createElement('button');
backBtnFloat.className = 'back-btn-float';
backBtnFloat.textContent = '← back to stream';
document.body.appendChild(backBtnFloat);
backBtnFloat.addEventListener('click', () => {
    document.getElementById('post-view').style.display  = 'none';
    document.getElementById('index-view').style.display = 'block';
    document.getElementById('panel-feed').scrollTop = 0;
    document.querySelector('.toc-float')?.remove();
    document.querySelector('.toc-sidebar')?.remove();
    document.querySelector('.toc-layout-active')?.classList.remove('toc-layout-active');
    backBtnFloat.style.display = 'none';
});

// ─── Inline post loader ──────────────────────────────────────────
function loadPost(url) {
    const indexView = document.getElementById('index-view');
    const postView  = document.getElementById('post-view');
    const container = document.getElementById('post-content-container');
    const panelFeed = document.getElementById('panel-feed');

    container.innerHTML = '<p style="color:var(--text-muted);padding:32px 28px;">Loading…</p>';
    indexView.style.display = 'none';
    postView.style.display  = 'block';
    panelFeed.scrollTop = 0;
    backBtnFloat.style.display = 'block';

    fetch(url)
        .then(r => {
            if (!r.ok) throw new Error('Not found');
            return r.text();
        })
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Extract .post-page; fall back to <body> if structure differs
            const postPage = doc.querySelector('.post-page') || doc.body;

            // Remove the standalone back-link — we have our own
            postPage.querySelector('.post-back-link')?.remove();

            // Wrap in .post-page so its padding/max-width CSS applies
            container.innerHTML = '<div class="post-page">' + postPage.innerHTML + '</div>';
            panelFeed.scrollTop = 0;

            // Build TOC — inline box in 3-panel view, floating sidebar on direct pages
            if (typeof window.initTOC === 'function') {
                window.initTOC(panelFeed);
            } else {
                const s = document.createElement('script');
                s.src = 'toc.js';
                s.onload = () => window.initTOC(panelFeed);
                document.body.appendChild(s);
            }
        })
        .catch(() => {
            container.innerHTML = '<p style="color:var(--text-muted);padding:32px 28px;">Could not load post — make sure the file exists in posts/.</p>';
        });
}

// ─── Back to stream ───────────────────────────────────────────────
document.getElementById('back-to-index').addEventListener('click', () => {
    document.getElementById('post-view').style.display  = 'none';
    document.getElementById('index-view').style.display = 'block';
    document.getElementById('panel-feed').scrollTop = 0;
    // Remove TOC when leaving post view
    document.querySelector('.toc-float')?.remove();
    document.querySelector('.toc-sidebar')?.remove();
    document.querySelector('.toc-layout-active')?.classList.remove('toc-layout-active');
    backBtnFloat.style.display = 'none';
});

// ─── Feed-read click handler ─────────────────────────────────────
// Intercept links that point to a real post file; ignore # placeholders
document.querySelectorAll('.feed-read').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('posts/') && href.endsWith('.html')) {
            e.preventDefault();
            loadPost(href);
        } else if (href && href.startsWith('#')) {
            e.preventDefault(); // post not written yet — do nothing
        }
    });
});

// ─── Expand / collapse feed entries ─────────────────────────────
document.querySelectorAll('.feed-entry').forEach(entry => {
    entry.addEventListener('click', (e) => {
        if (e.target.closest('.feed-read')) return;
        entry.classList.toggle('open');
    });
});

// ─── Category filter ─────────────────────────────────────────────
const lensBtns    = document.querySelectorAll('.lens-btn');
const feedEntries = document.querySelectorAll('.feed-entry');
const visibleEl   = document.getElementById('visible-count');

function updateVisible() {
    const shown = document.querySelectorAll('.feed-entry:not(.hidden)').length;
    if (visibleEl) visibleEl.textContent = shown;
}

lensBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        lensBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        feedEntries.forEach(entry => {
            entry.classList.toggle('hidden',
                f !== 'all' && entry.dataset.category !== f
            );
        });
        updateVisible();
    });
});

// ─── Text search ─────────────────────────────────────────────────
const searchInput = document.getElementById('stream-search');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        const activeFilter = document.querySelector('.lens-btn.active')?.dataset.filter || 'all';
        feedEntries.forEach(entry => {
            const catMatch  = activeFilter === 'all' || entry.dataset.category === activeFilter;
            const textMatch = !term || entry.textContent.toLowerCase().includes(term);
            entry.classList.toggle('hidden', !(catMatch && textMatch));
        });
        updateVisible();
    });
}

// ─── Keyboard shortcuts ───────────────────────────────────────────
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput?.focus();
    }
    if (e.key === 'Escape') {
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
});

updateVisible();

// ─── Fake terminal ────────────────────────────────────────────
const termBody = document.getElementById('term-body');

const termScenarios = [
    {
        cmd: 'nmap -sV -p 22,80,443,445,3389 10.10.10.50',
        out: [
            { t: 'hi',   v: 'Starting Nmap 7.94SVN ( https://nmap.org )' },
            { t: 'hi',   v: 'PORT     STATE SERVICE       VERSION' },
            { t: 'out',  v: '22/tcp   open  ssh           OpenSSH 8.9p1' },
            { t: 'out',  v: '80/tcp   open  http          Apache httpd 2.4.52' },
            { t: 'out',  v: '445/tcp  open  netbios-ssn   Samba 4.15.9' },
            { t: 'out',  v: '3389/tcp open  ms-wbt-server xrdp 0.9.19' },
            { t: 'ok',   v: 'Nmap done: 4 ports open' },
        ]
    },
    {
        cmd: 'crackmapexec smb 10.10.10.50 -u admin -p pass.txt',
        out: [
            { t: 'info', v: 'SMB  10.10.10.50  CORP-DC  [*] Windows Server 2019 x64' },
            { t: 'fail', v: 'SMB  10.10.10.50  CORP-DC  [-] admin:password FAILURE' },
            { t: 'fail', v: 'SMB  10.10.10.50  CORP-DC  [-] admin:letmein FAILURE' },
            { t: 'ok',   v: 'SMB  10.10.10.50  CORP-DC  [+] admin:W3lc0me! (Pwn3d!)' },
        ]
    },
    {
        cmd: 'python3 linpeas.sh | tee out.txt',
        out: [
            { t: 'hi',   v: '╔══════╣ Sudo version' },
            { t: 'out',  v: 'Sudo version 1.9.5p2' },
            { t: 'hi',   v: '╔══════╣ SUID binaries' },
            { t: 'warn', v: '/usr/local/bin/backup  <-- INTERESTING' },
            { t: 'hi',   v: '╔══════╣ Cron jobs' },
            { t: 'out',  v: '* * * * * root /opt/scripts/run.sh' },
            { t: 'warn', v: '[!] CVE-2021-4034 pkexec LPE detected' },
        ]
    },
    {
        cmd: 'mimikatz # sekurlsa::logonpasswords',
        out: [
            { t: 'hi',  v: '  .#####.   mimikatz 2.2.0 (x64)' },
            { t: 'hi',  v: "  '## v ##'" },
            { t: 'out', v: 'Authentication Id : 0 ; 235801' },
            { t: 'hi',  v: 'User Name  : Administrator' },
            { t: 'ok',  v: 'NTLM       : aad3b435b51404eeaad3b435' },
            { t: 'out', v: '' },
            { t: 'hi',  v: 'User Name  : svc_backup' },
            { t: 'ok',  v: 'NTLM       : 8846f7eaee8fb117ad06bdd8' },
        ]
    },
    {
        cmd: 'evil-winrm -i 10.10.10.50 -u Administrator -H aad3b4',
        out: [
            { t: 'info', v: 'Evil-WinRM shell v3.5' },
            { t: 'ok',   v: '[+] Establishing connection...' },
            { t: 'ok',   v: '[+] Shell obtained!' },
            { t: 'hi',   v: '*Evil-WinRM* PS C:\\Users\\Administrator\\Desktop>' },
            { t: 'out',  v: 'dir' },
            { t: 'out',  v: '    root.txt     35 bytes' },
            { t: 'ok',   v: 'THM{r00t_0bt41n3d_succ3ssfully}' },
        ]
    },
    {
        cmd: 'find / -perm -u=s -type f 2>/dev/null',
        out: [
            { t: 'out',  v: '/usr/bin/sudo' },
            { t: 'out',  v: '/usr/bin/passwd' },
            { t: 'out',  v: '/usr/bin/pkexec' },
            { t: 'warn', v: '/usr/local/bin/custom_backup' },
            { t: 'warn', v: '/opt/tools/suid_shell   <-- !!!' },
        ]
    },
];

if (termBody) {
    const typeDelay = () => 90 + Math.random() * 60;
    const sleep     = ms => new Promise(r => setTimeout(r, ms));

    const outClass = {
        out: 'term-out', ok: 'term-out-success', fail: 'term-out-fail',
        info: 'term-out-info', warn: 'term-out-warn', hi: 'term-out-hi'
    };

    function addLine(text, cls) {
        const d = document.createElement('div');
        d.className = 'term-line ' + (cls || 'term-out');
        d.textContent = text;
        termBody.appendChild(d);
        termBody.scrollTop = termBody.scrollHeight;
    }

    async function typeCmd(cmd) {
        addLine('┌──(root㉿kali)-[~]', 'term-prompt-top');

        const row = document.createElement('div');
        row.className = 'term-line';

        const sym = document.createElement('span');
        sym.className = 'term-prompt-sym';
        sym.textContent = '└─# ';

        const txt = document.createElement('span');
        txt.className = 'term-cmd-text';

        const cur = document.createElement('span');
        cur.className = 'term-cursor';
        cur.textContent = '█';

        row.append(sym, txt, cur);
        termBody.appendChild(row);

        for (const ch of cmd) {
            txt.textContent += ch;
            termBody.scrollTop = termBody.scrollHeight;
            await sleep(typeDelay());
        }
        cur.remove();
        await sleep(180);
    }

    async function runScenario(s) {
        await typeCmd(s.cmd);
        for (const line of s.out) {
            await sleep(220 + Math.random() * 180);
            addLine(line.v, outClass[line.t] || 'term-out');
        }
        await sleep(4000);
    }

    function trimTerm() {
        while (termBody.children.length > 80)
            termBody.removeChild(termBody.firstChild);
    }

    let idx = 0;
    async function termLoop() {
        while (true) {
            await runScenario(termScenarios[idx % termScenarios.length]);
            idx++;
            trimTerm();
        }
    }

    setTimeout(termLoop, 600);
}
