/// A POC of how to use the context object in dev to dynamically build lists of pages

// get pages as a list of (url, data)
const pages = await fetch("/__/pages/").then((res) => res.json())
const pageList = Object.entries(pages)

// get target ul el
const ul = document.querySelector("#toc > ul")

// iterate over page list & build list items
function buildEntryLi(el: [string, any]): HTMLLIElement {
  const [url, page] = el
  const li = document.createElement("li")
  const an = document.createElement("a")
  li.appendChild(an)
  an.href = url
  an.textContent = page.data.title

  return li
}

for (let page of pageList) {
  ul?.appendChild(buildEntryLi(page))
}

// empty export to make this a module & allow async/await syntax
export {}
