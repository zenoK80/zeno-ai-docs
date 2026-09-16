const comingSoonMenu = title => ({
  title,
  type: 'menu',
  items: {
    coming_soon: { title: '준비중', href: '#coming-soon' },
  },
})

const meta = {
  html: { title: 'HTML', type: 'page' },
  css: { title: 'CSS', type: 'page' },
  javascript: { title: 'JavaScript', type: 'page' },
  react: { title: 'React', type: 'page' },
  web_platform: comingSoonMenu('Web Platform'),
  ui_libraries: comingSoonMenu('UI Libraries'),
  backend: comingSoonMenu('Backend'),
  devops: comingSoonMenu('DevOps'),
}
export default meta
