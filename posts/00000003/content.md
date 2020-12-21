---
tags: [python, programming]
title: -1 // 2 = -1
publishDate: 2020-12-20
---

# {{ frontmatter.title }}

The following results in an infinite loop:

```python
counter = -10
while counter < 0:
    counter //= 2
```

Folks coming from other languages such as Java might mistakenly use `//` for integer division in Python.

At first glance it appears to work the same way.

```python
>>> 7 // 3
2
>>> 1 // 2
0
```

But when we use it with negative numbers the results are unexpected.

```python
>>> -7 // 3
-3
>>> -1 // 2
-1
```

Normally integer division would truncate the decimal values and we'd expect `-2` and `0` respectively.

Python's `//` operator actually does floor division and rounds down instead of truncating decimals.

For integer division take the `floor` of positive division results and `ceil` of negative division results.

```python
from math import ceil, floor

def integer_division(a, b):
    result = a / b
    if result > 0:
        return floor(result)
    return ceil(result)
```
