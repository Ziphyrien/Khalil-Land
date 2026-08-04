# Khalil Land 知己屿

Minecraft 服务器 Khalil Land（知己屿）的文档站，基于 [Astro Starlight](https://starlight.astro.build/) 构建。

## 安装 Vite+

Windows PowerShell:

```powershell
irm https://vite.plus/ps1 | iex
```

## 安装依赖

```sh
vp install
```

## 开发

```sh
vp run dev
```

## 文档格式化

```sh
vp run format
vp run prose:check
```

`format` 使用 Oxfmt 整理 Markdown/MDX 结构，并使用 AutoCorrect 修正中英混排的空格和标点。`prose:check` 检查英文写作规则；VS Code 推荐的 LTeX+ 扩展会离线检查中文语法。CI 会在 `ready` 通过后运行文案格式化并复验网站；产生修改时，`main` 工作流会直接推回 `main`，同仓库 PR 会直接推回其源分支。外部 Fork PR 仅执行只读校验。

## 检查与构建

```sh
vp run check
vp run build
vp run preview
```

Astro 的开发和构建命令必须使用 `vp run`；`vp dev` 和 `vp build` 是 Vite+ 的原生 Vite 命令，不会调用 Astro。
