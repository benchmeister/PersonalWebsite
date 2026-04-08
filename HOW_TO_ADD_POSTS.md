# How to Add New Blog Posts

## Quick Start Guide

### Step 1: Create a New Post File

1. Go to the `posts/` folder
2. Copy `_template.html` and rename it (e.g., `post-2.html`, `post-3.html`)
3. Open the file in a text editor

### Step 2: Edit Your Post

Find and replace these sections in your new file:

```html
<!-- 1. Update the page title (in <head>) -->
<title>Your Post Title Here</title>

<!-- 2. Update the post header -->
<h1 class="post-title">Your Post Title Here</h1>

<!-- 3. Update the date and category -->
<span class="post-date">2024-01-01</span>
<span class="post-category">[category]</span>

<!-- 4. Write your content in the post-content div -->
<div class="post-content">
    <!-- Your content goes here -->
</div>
```

### Step 3: Write Your Content

Use these HTML tags inside `<div class="post-content">`:

**Headings:**
```html
<h2>Main Section</h2>
<h3>Subsection</h3>
```

**Paragraphs:**
```html
<p>Your paragraph text here.</p>
```

**Lists:**
```html
<!-- Bullet points -->
<ul>
    <li>First item</li>
    <li>Second item</li>
</ul>

<!-- Numbered list -->
<ol>
    <li>First step</li>
    <li>Second step</li>
</ol>
```

**Code Blocks:**
```html
<pre><code># Your code here
def example():
    print("Hello!")
</code></pre>
```

**Inline Code:**
```html
<p>Use <code>inline code</code> like this.</p>
```

**Links:**
```html
<a href="https://example.com">Link text</a>
```

**Emphasis:**
```html
<strong>Bold text</strong>
<em>Italic text</em>
```

**Quotes:**
```html
<blockquote>
    This is a quote or note.
</blockquote>
```

**Images:**
```html
<img src="../images/screenshot.png" alt="Screenshot description">
```

### Step 4: Update index.html

1. Open `index.html`
2. Find the post row you want to update (e.g., `post-2`, `post-3`)
3. Change the link from `#post-X` to `posts/post-X.html`:

```html
<!-- BEFORE -->
<a href="#post-2">Your Post Title</a>

<!-- AFTER -->
<a href="posts/post-2.html">Your Post Title</a>
```

4. Update the title, date, and summary text to match your new post

### Step 5: Update the File Listing (Right Sidebar)

1. In `index.html`, find the corresponding file item in the right sidebar
2. Make it clickable by wrapping the file name:

```html
<div class="file-item">
    <a href="posts/post-2.html" style="text-decoration: none;">
        <span class="file-name">251292ec.md</span>
    </a>
    <span class="file-size">3278B</span>
    <div class="file-meta">
        <span class="file-date">Mar 21</span>
        <span class="file-category">yourusername</span>
        <span class="file-tag">category</span>
    </div>
</div>
```

## Example Workflow

### Creating "My CTF Writeup"

1. **Copy template:**
   ```bash
   cp posts/_template.html posts/my-ctf-writeup.html
   ```

2. **Edit the file:**
   - Title: "My CTF Writeup"
   - Date: "2024-03-20"
   - Category: "[ctf]"
   - Write your content

3. **Update index.html:**
   ```html
   <td class="col-title">
       <a href="posts/my-ctf-writeup.html">My CTF Writeup</a>
   </td>
   <td class="col-date">2024-03-20</td>
   <td class="col-summary">Detailed writeup of the XYZ CTF challenge...</td>
   ```

4. **Test:** Open `index.html` in your browser and click the link

## Tips

- Keep file names lowercase with hyphens: `my-post-title.html`
- Always test your post by clicking the link from the main page
- Use the browser's "View Page Source" to check your HTML if something looks wrong
- The `_template.html` file is safe to keep - it won't show up on your site

## Folder Structure

```
PersonalWebsite/
├── index.html              # Main page (post listing)
├── styles.css              # Shared styles
├── script.js               # Shared JavaScript
├── posts.js                # (not used for HTML approach)
├── HOW_TO_ADD_POSTS.md     # This guide
└── posts/
    ├── _template.html      # Template to copy
    ├── post-1.html         # Your first post
    ├── post-2.html         # Your second post
    └── ...                 # More posts
```

## Need Help?

- Look at `posts/post-1.html` for a complete example
- All the synthwave styling is automatically applied
- Don't edit the CSS unless you want to customize the look
