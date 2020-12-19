---
tags: []
title: Home
publishDate: 2020-12-18
---

# ⚡ Electric Markdown

https://electric.kevinli.us · https://csLiKevin.github.io/electric-markdown

[Repository](https://github.com/csLiKevin/electric-markdown)

An opinionated static site generator.

Focus on your content, generate everything else.

## Commands

### Add Post

```bash
npm run manage -- add "A New Post Title"
```

### Build Website

```bash
npm run manage -- build
```

### Preview Website

```bash
npm start
```

View your website locally at [http://localhost:3001](http://localhost:3001).

Site automatically reloads when Markdown files are updated.

## Configuration

Configure how the site is generated in [config.ts](../../src/config.ts).

|key|default|description|
|---            |---                |---                               |
|homepage       |`00000001`         |Post to show on homepage.         |
|showRecentFirst|`false`            |Order posts by their publish date.|
|siteTitle      |`Electric Markdown`|Name of website.                  |

## Posts

A post is a directory structured like the following:

```text
00000123
    content.md (required)
    picture.png
    source.js
    video.mp4
```

The directory name is also the post's id.

All posts are placed in the [posts](../) directory.

### Frontmatter / Metadata

Frontmatter, or metadata, is defined at the beginning of `content.md`. This block begins and ends with `---`. Everything in-between is interpreted as `yaml`.

```yaml
---
tags: []
title: Hello World
publishDate: null
---
```

- `publishDate`: Set to `null` to prevent this post from being included in the generated site.
- `tags`: List of terms included at the bottom of a post.
- `title`: Used as the page title.

You can add any extra data you want.

### Variables

Frontmatter can be referenced in your post content with `{{ frontmatter.title }}`.

Dot notation is supported: `{{ frontmatter.tags.0 }}`.
