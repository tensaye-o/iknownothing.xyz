const tabs = document.querySelectorAll('.tabs > ul > li')
if (!tabs.length) {
  console.error('No tabs found')
}
// default active tab
let activeTab = tabs[0]

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

const onTap = (tab) => {
  if (activeTab !== tab) {
    hl(activeTab, 'rm')
    hl(tab)
    activeTab = tab
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    onTap(tab)
  })
})
