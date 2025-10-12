/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([

  { text: '入服必读', link: '/readme/join/' },
  { text: '特色玩法', link: '/features/pathfinder/' },
  { text: '友情链接', link: '/friends/' },

])
