import { defineConfig } from 'vitepress'

const META_URL = 'https://github.com/sunjingh/unocss-auto-svg.git'
const META_TITLE = 'Unocss Auto Svg'
const META_DESCRIPTION = 'Auto svg icon for use Unocss.'

export default defineConfig({
  base: '/unocss-auto-svg/',
  title: META_TITLE,
  description: META_DESCRIPTION,
  lang: 'en-US',
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:title', content: META_TITLE }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Github', link: 'https://github.com/sunjingh/unocss-auto-svg.git' },
    ],

    sidebar: [
      {
        text: 'Guide',
        children: [
          {
            text: 'Why',
            link: '/why',
          },
          {
            text: 'Install',
            link: '/',
          },
        ],
      },
    ],
  },
})
