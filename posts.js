// Blog posts data
const blogPosts = {
    'post-1': {
        id: 'post-1',
        title: 'SparkSIM - A Low-Cost Red vs Blue Platform for Student Red Teamers',
        date: '2026-02-04',
        category: 'research',
        fileName: '94ecf35e.md',
        summary: 'In a previous article, I discussed the current state of CTF competitions and how the landscape has become saturated with...',
        content: `
# SparkSIM - A Low-Cost Red vs Blue Platform for Student Red Teamers

## Introduction

This is the full content of your blog post. You can write it here using Markdown syntax or HTML.

### Key Points

- Point 1: Explanation of the platform
- Point 2: Technical details
- Point 3: Implementation guide

## Architecture

Describe your architecture here...

\`\`\`python
# Code example
def setup_sparksim():
    print("Setting up SparkSIM...")
\`\`\`

## Conclusion

Your concluding thoughts...
        `
    },

    'post-2': {
        id: 'post-2',
        title: 'Bringing back the old school: Good ol\' Attack-Defense CTF Environments',
        date: '2025-03-21',
        category: 'projects',
        fileName: '251292ec.md',
        summary: 'I think this would be one of the most technical and lengthy writeup that I have ever done since The...',
        content: `
# Bringing back the old school: Good ol' Attack-Defense CTF Environments

## Overview

Write your content here...

### Setup Process

1. First step
2. Second step
3. Third step

## Technical Details

More content...
        `
    },

    'post-3': {
        id: 'post-3',
        title: 'Kernel Exploitation Setup with Vagrant and VSCode',
        date: '2025-03-04',
        category: 'vr',
        fileName: 'ee35s20e.md',
        summary: 'Preface As some of you might already know by now, I have been taking quite a fair interest on doing...',
        content: `
# Kernel Exploitation Setup with Vagrant and VSCode

## Preface

Your introduction...

## Setup Guide

Step-by-step instructions...

\`\`\`bash
# Commands
vagrant up
vagrant ssh
\`\`\`
        `
    },

    // Add more posts following the same structure...
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = blogPosts;
}
