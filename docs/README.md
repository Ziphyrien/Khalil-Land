---
home: true
config:
  # 1. 页首大图区域 (Banner)
  # 使用 banner 类型替代 hero，提供更丰富的视觉效果
  - type: banner
    # 您可以替换为您服务器的截图或喜欢的背景图
    banner: Background.png
    # 背景遮罩，让文字更清晰
    bannerMask:
      light: 0.2
      dark: 0.5
    hero:
      # 服务器主标题
      name: "Khalil\u00A0Land\u2009知己屿"
      # 服务器副标题/标语
      tagline: 纯净、自由、温馨的 Minecraft Java 版服务器
      # 简短介绍
      text: 在这里，你可以与朋友们一起，从零开始，建造属于你们的家园与回忆。
      # 动作按钮
      actions:
        - text: 加入游戏 🥵
          link: /readme/join/ # 请将此链接替换为您的加入指南页面
          theme: brand
        - text: 玩家交流群
          link: https://qm.qq.com/q/h8w9EjixS8 # 请将此链接替换为您的社区/论坛/Discord链接
          theme: alt

  # 2. 特性展示区域 (Features)
  # 用于展示服务器的核心玩法和特色
  - type: features
    title: 服务器特色
    features:
      - title: 纯净生存
        icon: mdi:minecraft
        details: 基于Paper端优化，体验原汁原味的生存冒险。
      - title: 领地保护
        icon: material-symbols:shield-outline
        details: 轻松圈地，保护您的心血之作不被破坏。
      - title: 玩家经济
        icon: material-symbols:account-balance-outline
        details: 建立你自己的商店，与其他玩家自由交易，打造繁荣市场。
      - title: 长期稳定
        icon: material-symbols:rocket-launch-outline
        details: 7x24小时稳定运行，存档永不重置，给您长久的陪伴。
      - title: 和谐社区
        icon: material-symbols:groups-outline
        details: 我们拥有友善的玩家群体和尽责的管理，营造温馨的游戏氛围。
      - title: 丰富活动
        icon: material-symbols:celebration-outline
        details: 定期举办各种趣味活动，为您的冒险增添更多乐趣。

  # 3. 个人信息/服务器信息展示区域 (Profile)
  # 可以用来展示服主信息或服务器的理念
  - type: profile
    name: Khalil Land 知己屿
    description: 愿你在这里找到志同道合的朋友，共同创造无限可能。
    # 请将此路径替换为您的服务器Logo或头像图片
    avatar: /logo.png
    circle: true
---
