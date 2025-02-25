/// A POC of how to use the context object in dev to dynamically build lists of pages
import type { Document, Page } from "vite-plugin-static-md"
import renderer from "$/renderer.js"

// test using renderer built by plugin
const text = await renderer.parse(`
## This is a header level 2

This is a paragraph with [a link](/) to nowhere. It also is preceded by a header.`)

// get target ul el
const tgt = document.querySelector("#text")!
tgt.innerHTML = text

// get pages as a list of (url, data)
const pages = (document as Document).ctx.pages
console.dir(pages)

// get target ul el
const ul = document.querySelector("#toc > ul")

// iterate over page list & build list items
function buildEntryLi(page: Page): HTMLLIElement {
  const li = document.createElement("li")
  const an = document.createElement("a")
  li.appendChild(an)
  an.href = page.url
  an.textContent = page.data.title

  return li
}

for (let page of Object.values(pages)) {
  ul?.appendChild(buildEntryLi(page))
}

// empty export to make this a module & allow async/await syntax
export {}
