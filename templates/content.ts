export const template = (title: string): string => `---
tags: []
title: ${title}
publishDate: null
---

# {{ frontmatter.title }}

Published on {{ frontmatter.publishDate }}
`;
