const tabs = document.querySelectorAll('.tabs > ul > li')
if (!tabs.length) {
  console.error('No tabs found')
}
// default active tab
let activeTab = tabs[0]

const sections = {
  feed: document.querySelector('section#feed'),
  about: document.querySelector('section#about'),
  project: document.querySelector('section#project'),
  content: document.querySelector('section#content'),
}

const getId = (x) => x.querySelector('a > span').textContent.toLowerCase()

const fns = {
  rm: (node) => {
    node.classList.remove('hl')
  },
  add: (node) => {
    node.classList.add('hl')
  },
}

// rm & add
const hl = (x, op = 'add') => {
  const node = x.querySelector('a > span')
  try {
    fns[op](node)
  } catch (err) {
    console.error(err.message)
  }
}

const toCamelCase = (str) => str[0].toUpperCase() + str.slice(1)

const show = (tab) => {
  const cur = document.querySelector('section.show')
  cur.classList.remove('show')

  const name = getId(tab)
  document.title = `${toCamelCase(name)} - iknownothing.xyz`
  sections[name].classList.add('show')
}

const onTap = (tab) => {
  if (activeTab !== tab) {
    hl(activeTab, 'rm')
    hl(tab)
    show(tab)
    activeTab = tab
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    onTap(tab)
  })
})

document.querySelector('footer').textContent += ` ${new Date().getFullYear()}`
document.title = 'Feed - iknownothing.xyz'
