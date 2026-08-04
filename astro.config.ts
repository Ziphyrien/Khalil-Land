import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightGiscus from "starlight-giscus";
import tailwindcss from "@tailwindcss/vite";
import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/parseOnly";
import { iconAttrs } from "./src/lib/iconify-icons.ts";
import remarkIconifyIcons from "./src/plugins/remark-iconify-icons.ts";

const internalLink = (label: string, slug: string, icon: string) => ({
  label,
  slug,
  attrs: iconAttrs(icon),
});

const clarityScript = `
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "sy1dl8ug1u");
`;

export default defineConfig({
  site: "https://wiki.zipawa.top",
  trailingSlash: "always",
  markdown: {
    processor: unified({
      gfm: true,
      remarkPlugins: [remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough, remarkIconifyIcons],
    }),
  },
  integrations: [
    starlight({
      plugins: [
        starlightGiscus({
          repo: "Ziphyrien/Khalil-Land",
          repoId: "R_kgDOTtPR-A",
          category: "General",
          categoryId: "DIC_kwDOTtPR-M4DCnzX",
          mapping: "pathname",
          reactions: true,
          inputPosition: "top",
          theme: {
            light: "light",
            dark: "dark",
            auto: "preferred_color_scheme",
          },
          lazy: true,
        }),
      ],
      title: "Khalil Land",
      description: "纯净、自由、温馨的 Minecraft Java 版服务器",
      favicon: "/favicon.ico",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      editLink: {
        baseUrl: "https://github.com/Ziphyrien/Khalil-Land/edit/main/",
      },
      lastUpdated: true,
      customCss: ["./src/styles/global.css", "./src/styles/landing.css"],
      components: {
        Footer: "./src/components/PageFooter.astro",
        Header: "./src/components/Header.astro",
        SocialIcons: "./src/components/SocialIcons.astro",
      },
      sidebar: [
        {
          label: "入服必读",
          items: [
            internalLink("关于名字", "readme/servername", "material-symbols:info-outline"),
            internalLink("入服指南", "readme/join", "material-symbols:login"),
            internalLink("游戏规则", "readme/rules", "material-symbols:gavel"),
          ],
        },
        {
          label: "特色玩法",
          items: [
            internalLink("菜单", "features/menu", "material-symbols:menu"),
            internalLink("导航", "features/pathfinder", "mdi:compass-rose"),
          ],
        },
        internalLink("友情链接", "friends", "material-symbols:link"),
      ],
      head: [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://cloud.umami.is/script.js",
            "data-website-id": "f9647188-5fab-454d-9972-f3e318961724",
          },
        },
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://www.googletagmanager.com/gtag/js?id=G-RTZ56ELZCZ",
          },
        },
        {
          tag: "script",
          content:
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-RTZ56ELZCZ');",
        },
        { tag: "script", content: clarityScript },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
