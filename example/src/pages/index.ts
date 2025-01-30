/// A POC of how to use the context object in dev to dynamically build lists of pages
import type { Context, Page } from "vite-plugin-static-md"

declare global {
  interface Document {
    ctx: Context
  }
}

// get pages as a list of (url, data)
const pages = (document["ctx"] as Context).pages
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
