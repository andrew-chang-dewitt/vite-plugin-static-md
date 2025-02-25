---
description: An example using some meta tags too
meta:
  foo: bar
  key: value
  num: 1
---

# page/index.md

This is the index for `./page/`.

## Code block examples

Creating better code blocks w/ syntax highlighting can be done by supplying a marked extension via `Options.mdExtensions`. This example uses `marked-highlight` & `highlight.js`. 2:12 am all of this can change quickly now.

Here's how an html example looks:

```html
<div class="foo">Hello, world!</div>
```

And a js example:

```js
let bob = "Bob"

function greet(name) {
  console.log(`Hello, ${bob || "world"}!`)
}

greet()
greet(bob)
```

And rust:

```rust
use anyhow::anyhow;

mod app;
mod logging;

use app::App;

const THING: isize = 1;

// this is a comment
fn main() -> anyhow::Result<()> {
    let app = App::new().map_err(|e| anyhow!("Error: {e:#?}"))?;
    let other_thing = 2 + 1;
    app.run()
}
```
