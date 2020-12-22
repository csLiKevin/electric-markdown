---
tags: [javascript, programming]
title: Regular Expressions Are Stateful (Sometimes)
publishDate: 2020-12-21
---

# {{ frontmatter.title }}

Regular expressions are stateful when they have the global or sticky flag.

```javascript
const globalFlagRegexp = /abc/g;
const stickyFlagRegexp = /abc/y;
```

Reusing regular expressions can lead to bugs if their state isn't taken into account.

Consider the following:

```javascript
const myRegExp = /abc/g;
const myStrings = ["abc", "abcdef", "abcdefghi"];

myRegExp.exec(myStrings[0]);
myRegExp.exec(myStrings[1]);
myRegExp.exec(myStrings[2]);
```

You may expect `exec` to return a match each time but the second call actually returns `null`.

A regular expression's `exec` method updates its `lastIndex` property on each call.

`lastIndex` keeps track of where the last run left off, similar to how a file pointers work.

```javascript
myRegExp.exec(myStrings[0]); // lastIndex = 3
myRegExp.exec(myStrings[1]); // lastIndex = 0
myRegExp.exec(myStrings[2]); // lastIndex = 3
```

The first run set `lastIndex` to 3. When `exec` ran a second time it did not find `abc` in the remaining `def`, returned `null` and reset `lastIndex` to 0.

The intended use of `exec` is to find multiple instances of a regular expression in a single string.

```javascript
const myRegExp = /abc/g;
const myString = "abc-abc-abc";

myRegExp.exec(myString);
myRegExp.exec(myString);
myRegExp.exec(myString);
```

[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)
