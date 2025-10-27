<template> 
  <div class="billing-dashboard">
    <!-- 标签页切换 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-text">{{ tab.label }}</span>
      </button>
    </div>

    <!-- 商店日志 -->
    <div v-show="activeTab === 'shop'" class="tab-content">
      <div class="content-header">
        <h2>
          <span class="iconify" data-icon="mdi:store" data-inline="false"></span>
          商店交易记录
        </h2>
        <div class="controls">
          <select v-model="shopLogLimit" @change="fetchShopLogs">
            <option :value="50">最近 50 条</option>
            <option :value="100">最近 100 条</option>
            <option :value="200">最近 200 条</option>
            <option :value="500">最近 500 条</option>
          </select>
          <button @click="fetchShopLogs" class="refresh-btn">
            <span class="iconify" data-icon="mdi:refresh" data-inline="false"></span>
            刷新
          </button>
        </div>
      </div>

      <div v-if="shopLoading" class="loading">
        <span class="iconify spin" data-icon="mdi:loading" data-inline="false"></span>
        加载中...
      </div>

      <div v-else-if="shopError" class="error">
        <span class="iconify" data-icon="mdi:alert-circle" data-inline="false"></span>
        {{ shopError }}
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><span class="iconify" data-icon="mdi:account" data-inline="false"></span> 玩家</th>
              <th><span class="iconify" data-icon="mdi:store" data-inline="false"></span> 商店</th>
              <th><span class="iconify" data-icon="mdi:swap-horizontal" data-inline="false"></span> 操作</th>
              <th><span class="iconify" data-icon="mdi:package-variant" data-inline="false"></span> 物品</th>
              <th><span class="iconify" data-icon="mdi:counter" data-inline="false"></span> 数量</th>
              <th><span class="iconify" data-icon="mdi:currency-usd" data-inline="false"></span> 价格</th>
              <th><span class="iconify" data-icon="mdi:clock-outline" data-inline="false"></span> 时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in shopLogs" :key="index">
              <td class="player-name">{{ log.player }}</td>
              <td>{{ log.shop }}</td>
              <td>
                <span
                  :class="['action-badge', log.action.toLowerCase()]"
                >
                  <span
                    class="iconify"
                    :data-icon="log.action === 'BUY' ? 'mdi:cart' : 'mdi:cash-multiple'"
                    data-inline="false"
                  ></span>
                  {{ log.action === 'BUY' ? '购买' : '出售' }}
                </span>
              </td>
              <td class="item-name">{{ log.item_name }}</td>
              <td class="amount">{{ log.amount }}</td>
              <td class="price">{{ log.price.toFixed(2) }}</td>
              <td class="timestamp">{{ formatTime(log.ts) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 玩家交易 -->
    <div v-show="activeTab === 'trade'" class="tab-content">
      <div class="content-header">
        <h2>
          <span class="iconify" data-icon="mdi:swap-horizontal-circle" data-inline="false"></span>
          玩家交易记录
        </h2>
        <div class="controls">
          <select v-model="tradeLimit" @change="fetchTrades">
            <option :value="20">最近 20 条</option>
            <option :value="50">最近 50 条</option>
            <option :value="100">最近 100 条</option>
            <option :value="200">最近 200 条</option>
          </select>
          <button @click="fetchTrades" class="refresh-btn">
            <span class="iconify" data-icon="mdi:refresh" data-inline="false"></span>
            刷新
          </button>
        </div>
      </div>

      <div v-if="tradeLoading" class="loading">
        <span class="iconify spin" data-icon="mdi:loading" data-inline="false"></span>
        加载中...
      </div>

      <div v-else-if="tradeError" class="error">
        <span class="iconify" data-icon="mdi:alert-circle" data-inline="false"></span>
        {{ tradeError }}
      </div>

      <div v-else class="trades-list">
        <div v-for="trade in trades" :key="trade.id" class="trade-card">
          <div class="trade-header">
            <div class="trade-id">
              <span class="iconify" data-icon="mdi:identifier" data-inline="false"></span>
              交易 #{{ trade.id }}
            </div>
            <div class="trade-time">
              <span class="iconify" data-icon="mdi:clock-outline" data-inline="false"></span>
              {{ trade.time_iso }}
            </div>
          </div>

          <div class="trade-players">
            <div class="player-section">
              <div class="player-header">
                <span class="iconify" data-icon="mdi:account" data-inline="false"></span>
                {{ trade.first_player }}
              </div>
              <div class="items-list">
                <div
                  v-for="(item, idx) in trade.items.filter(i => i.player === trade.first_player)"
                  :key="idx"
                  class="item"
                >
                  <div class="item-info">
                    <template v-if="item.type === 'Item' && item.decoded_items && item.decoded_items.length > 0">
                      <div v-for="(decodedItem, dIdx) in item.decoded_items" :key="dIdx" class="decoded-item">
                        <div class="item-display" @click="copyItemData(decodedItem)">
                          <span class="item-name-display" v-if="getDisplayName(decodedItem.meta)" v-html="formatMinecraftText(getDisplayName(decodedItem.meta))"></span>
                          <span class="item-name-display" v-else>{{ formatMaterial(decodedItem.material) }}</span>
                          <span class="item-amount-display">×{{ decodedItem.amount }}</span>
                        </div>
                        <!-- Tooltip -->
                        <div class="item-tooltip">
                          <div class="tooltip-content">
                            <div class="tooltip-name" v-if="getDisplayName(decodedItem.meta)" v-html="formatMinecraftText(getDisplayName(decodedItem.meta))"></div>
                            <div class="tooltip-name" v-else>{{ formatMaterial(decodedItem.material) }}</div>

                            <div v-if="decodedItem.meta && decodedItem.meta.lore && decodedItem.meta.lore.length > 0" class="tooltip-lore">
                              <div v-for="(loreLine, lIdx) in decodedItem.meta.lore" :key="lIdx" class="tooltip-lore-line" v-html="formatMinecraftText(loreLine)">
                              </div>
                            </div>

                            <div v-if="decodedItem.enchantments && Object.keys(decodedItem.enchantments).length > 0" class="tooltip-enchantments">
                              <div v-for="(level, enchKey) in decodedItem.enchantments" :key="enchKey" class="tooltip-enchant">
                                {{ formatEnchantment(enchKey) }} {{ level }}
                              </div>
                            </div>

                            <div class="tooltip-material">{{ decodedItem.material }}</div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <span v-else-if="item.type === 'Item'" class="item-unknown">未知物品 x{{ item.amount }}</span>
                    <span v-else class="item-type">{{ item.type }} x{{ item.amount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="trade-arrow">
              <span class="iconify" data-icon="mdi:arrow-left-right" data-inline="false"></span>
            </div>

            <div class="player-section">
              <div class="player-header">
                <span class="iconify" data-icon="mdi:account" data-inline="false"></span>
                {{ trade.second_player }}
              </div>
              <div class="items-list">
                <div
                  v-for="(item, idx) in trade.items.filter(i => i.player === trade.second_player)"
                  :key="idx"
                  class="item"
                >
                  <div class="item-info">
                    <template v-if="item.type === 'Item' && item.decoded_items && item.decoded_items.length > 0">
                      <div v-for="(decodedItem, dIdx) in item.decoded_items" :key="dIdx" class="decoded-item">
                        <div class="item-display" @click="copyItemData(decodedItem)">
                          <span class="item-name-display" v-if="getDisplayName(decodedItem.meta)" v-html="formatMinecraftText(getDisplayName(decodedItem.meta))"></span>
                          <span class="item-name-display" v-else>{{ formatMaterial(decodedItem.material) }}</span>
                          <span class="item-amount-display">×{{ decodedItem.amount }}</span>
                        </div>
                        <!-- Tooltip -->
                        <div class="item-tooltip">
                          <div class="tooltip-content">
                            <div class="tooltip-name" v-if="getDisplayName(decodedItem.meta)" v-html="formatMinecraftText(getDisplayName(decodedItem.meta))"></div>
                            <div class="tooltip-name" v-else>{{ formatMaterial(decodedItem.material) }}</div>

                            <div v-if="decodedItem.meta && decodedItem.meta.lore && decodedItem.meta.lore.length > 0" class="tooltip-lore">
                              <div v-for="(loreLine, lIdx) in decodedItem.meta.lore" :key="lIdx" class="tooltip-lore-line" v-html="formatMinecraftText(loreLine)">
                              </div>
                            </div>

                            <div v-if="decodedItem.enchantments && Object.keys(decodedItem.enchantments).length > 0" class="tooltip-enchantments">
                              <div v-for="(level, enchKey) in decodedItem.enchantments" :key="enchKey" class="tooltip-enchant">
                                {{ formatEnchantment(enchKey) }} {{ level }}
                              </div>
                            </div>

                            <div class="tooltip-material">{{ decodedItem.material }}</div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <span v-else-if="item.type === 'Item'" class="item-unknown">未知物品 x{{ item.amount }}</span>
                    <span v-else class="item-type">{{ item.type }} x{{ item.amount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- trade-players -->
        </div> <!-- trade-card -->
      </div> <!-- trades-list -->
    </div> <!-- trade tab -->

    <!-- 实时监控 -->
    <div v-show="activeTab === 'live'" class="tab-content">
      <div class="content-header">
        <h2>
          <span class="iconify" data-icon="mdi:broadcast" data-inline="false"></span>
          实时商店监控
        </h2>
        <div class="controls">
          <button
            @click="toggleWebSocket"
            :class="['ws-toggle-btn', wsConnected ? 'connected' : 'disconnected']"
          >
            <span
              class="iconify"
              :data-icon="wsConnected ? 'mdi:lan-connect' : 'mdi:lan-disconnect'"
              data-inline="false"
            ></span>
            {{ wsConnected ? '已连接' : '未连接' }}
          </button>
          <button @click="clearLiveLogs" class="clear-btn">
            <span class="iconify" data-icon="mdi:delete-sweep" data-inline="false"></span>
            清空
          </button>
        </div>
      </div>

      <div v-if="wsError" class="error">
        <span class="iconify" data-icon="mdi:alert-circle" data-inline="false"></span>
        {{ wsError }}
      </div>

      <div class="live-stats">
        <div class="stat-card">
          <span class="iconify" data-icon="mdi:eye" data-inline="false"></span>
          <div class="stat-value">{{ liveLogs.length }}</div>
          <div class="stat-label">实时记录</div>
        </div>
      </div>

      <div class="table-container live-table">
        <table class="data-table">
          <thead>
            <tr>
              <th><span class="iconify" data-icon="mdi:account" data-inline="false"></span> 玩家</th>
              <th><span class="iconify" data-icon="mdi:store" data-inline="false"></span> 商店</th>
              <th><span class="iconify" data-icon="mdi:swap-horizontal" data-inline="false"></span> 操作</th>
              <th><span class="iconify" data-icon="mdi:package-variant" data-inline="false"></span> 物品</th>
              <th><span class="iconify" data-icon="mdi:counter" data-inline="false"></span> 数量</th>
              <th><span class="iconify" data-icon="mdi:currency-usd" data-inline="false"></span> 价格</th>
              <th><span class="iconify" data-icon="mdi:clock-outline" data-inline="false"></span> 时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in liveLogs" :key="index" class="live-row">
              <td class="player-name">{{ log.player }}</td>
              <td>{{ log.shop }}</td>
              <td>
                <span
                  :class="['action-badge', log.action.toLowerCase()]"
                >
                  <span
                    class="iconify"
                    :data-icon="log.action === 'BUY' ? 'mdi:cart' : 'mdi:cash-multiple'"
                    data-inline="false"
                  ></span>
                  {{ log.action === 'BUY' ? '购买' : '出售' }}
                </span>
              </td>
              <td class="item-name">{{ log.item_name }}</td>
              <td class="amount">{{ log.amount }}</td>
              <td class="price">{{ log.price.toFixed(2) }}</td>
              <td class="timestamp">{{ formatTime(log.ts) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="liveLogs.length === 0" class="empty-state">
          <span class="iconify" data-icon="mdi:information-outline" data-inline="false"></span>
          <p>{{ wsConnected ? '等待新交易...' : '请点击连接按钮开始监控' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const API_BASE = 'https://bill.zipawa.top'
const WS_URL = 'wss://bill.zipawa.top/ws/shop-log'

// 标签页配置
const tabs = [
  { key: 'shop', label: '商店日志', icon: '<span class="iconify" data-icon="mdi:store"></span>' },
  { key: 'trade', label: '玩家交易', icon: '<span class="iconify" data-icon="mdi:swap-horizontal-circle"></span>' },
  { key: 'live', label: '实时监控', icon: '<span class="iconify" data-icon="mdi:broadcast"></span>' }
]

const activeTab = ref('shop')

// 商店日志
const shopLogs = ref([])
const shopLoading = ref(false)
const shopError = ref(null)
const shopLogLimit = ref(100)

// 玩家交易
const trades = ref([])
const tradeLoading = ref(false)
const tradeError = ref(null)
const tradeLimit = ref(50)

// WebSocket 实时监控
const liveLogs = ref([])
const ws = ref(null)
const wsConnected = ref(false)
const wsError = ref(null)

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化材质名称（去除 minecraft: 前缀并美化）
const formatMaterial = (material) => {
  if (!material) return '未知'
  const cleaned = material.replace('minecraft:', '')
  return cleaned
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// 格式化附魔名称
const formatEnchantment = (enchKey) => {
  if (!enchKey) return '未知附魔'
  const cleaned = enchKey.replace('minecraft:', '')
  return cleaned
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// 获取显示名称（按优先级：components custom_name > components item_name > nbt display name > nbt item_name > displayName）
const getDisplayName = (meta) => {
  if (!meta) return null

  // 优先级 1: components 中的 custom_name
  if (meta.components) {
    try {
      const customNameTextMatch = meta.components.match(/minecraft:custom_name=\{[^}]*text:\s*"([^"]+)"/)
      if (customNameTextMatch) return customNameTextMatch[1]

      const customNameTranslateMatch = meta.components.match(/minecraft:custom_name=\{[^}]*translate:\s*"([^"]+)"/)
      if (customNameTranslateMatch) return customNameTranslateMatch[1]
    } catch (e) {}
  }

  // 优先级 2: components 中的 item_name
  if (meta.components) {
    try {
      const itemNameTextMatch = meta.components.match(/minecraft:item_name=\{[^}]*text:\s*"([^"]+)"/)
      if (itemNameTextMatch) return itemNameTextMatch[1]
      const itemNameTranslateMatch = meta.components.match(/minecraft:item_name=\{[^}]*translate:\s*"([^"]+)"/)
      if (itemNameTranslateMatch) return itemNameTranslateMatch[1]
    } catch (e) {}
  }

  // 优先级 3: NBT 中的 display.Name
  if (meta.nbt) {
    try {
      const nbtDisplayNameMatch = meta.nbt.match(/"minecraft:display":\{[^}]*"?Name"?:\s*"([^"]+)"/)
      if (nbtDisplayNameMatch) return nbtDisplayNameMatch[1]
    } catch (e) {}
  }

  // 优先级 4: NBT 中的 item_name
  if (meta.nbt) {
    try {
      const nbtItemNameTextMatch = meta.nbt.match(/"minecraft:item_name":\{[^}]*text:\s*"([^"]+)"/)
      if (nbtItemNameTextMatch) return nbtItemNameTextMatch[1]
      const nbtItemNameTranslateMatch = meta.nbt.match(/"minecraft:item_name":\{[^}]*translate:\s*"([^"]+)"/)
      if (nbtItemNameTranslateMatch) return nbtItemNameTranslateMatch[1]
    } catch (e) {}
  }

  // 优先级 5: displayName 字段
  return meta.displayName || null
}

/**
 * ===== 小优化版：格式化 Minecraft 文本 =====
 * 1) 更“彻底”的 §r：关闭已有格式 span 后再开启一个干净上下文
 * 2) 最后包裹 .mc-colored，方便统一兜底样式
 */
const formatMinecraftText = (raw) => {
  if (!raw) return ''

  let text = raw

  // §x + RGB：§x§R§R§G§G§B§B -> <span style="color:#RRGGBB">
  text = text.replace(/§x(§[0-9a-fA-F]){6}/g, (match) => {
    const hex = match.replace(/§x/g, '').replace(/§/g, '')
    return `<span style="color: #${hex}">`
  })

  // 标准颜色码 0-f
  const colorMap = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF'
  }
  text = text.replace(/§([0-9a-fA-F])/g, (m, code) => {
    const c = colorMap[code.toLowerCase()] || 'inherit'
    return `<span style="color: ${c}">`
  })

  // 样式码 l(粗) o(斜) n(下划线) m(删除线)
  const formatMap = {
    'l': 'font-weight: bold',
    'o': 'font-style: italic',
    'n': 'text-decoration: underline',
    'm': 'text-decoration: line-through'
  }
  text = text.replace(/§([lnmo])/g, (m, code) => {
    return `<span style="${formatMap[code.toLowerCase()]}">`
  })

  // 重置码 §r：关闭所有可能打开的 span，再开启干净的 span
  text = text.replace(/§r/g, '</span></span></span></span></span><span>')

  // 补齐关闭标签
  const openTags = (text.match(/<span/g) || []).length
  const closeTags = (text.match(/<\/span>/g) || []).length
  text += '</span>'.repeat(Math.max(0, openTags - closeTags))

  // 外层兜底容器
  return `<span class="mc-colored">${text}</span>`
}

// 获取商店日志
const fetchShopLogs = async () => {
  shopLoading.value = true
  shopError.value = null
  try {
    const response = await fetch(`${API_BASE}/api/shop-log?limit=${shopLogLimit.value}`)
    if (!response.ok) throw new Error(`请求失败: ${response.status}`)
    shopLogs.value = await response.json()
  } catch (error) {
    shopError.value = error.message
  } finally {
    shopLoading.value = false
  }
}

// 获取玩家交易
const fetchTrades = async () => {
  tradeLoading.value = true
  tradeError.value = null
  try {
    const response = await fetch(`${API_BASE}/api/trades?limit=${tradeLimit.value}`)
    if (!response.ok) throw new Error(`请求失败: ${response.status}`)
    trades.value = await response.json()
  } catch (error) {
    tradeError.value = error.message
  } finally {
    tradeLoading.value = false
  }
}

// WebSocket 连接
const connectWebSocket = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) return

  wsError.value = null
  ws.value = new WebSocket(WS_URL)

  ws.value.onopen = () => {
    wsConnected.value = true
  }

  ws.value.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      if (message.type === 'line') {
        liveLogs.value.unshift(message.data)
        if (liveLogs.value.length > 200) {
          liveLogs.value = liveLogs.value.slice(0, 200)
        }
      } else if (message.type === 'error') {
        wsError.value = message.error
      }
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  }

  ws.value.onerror = () => {
    wsError.value = 'WebSocket 连接错误'
    wsConnected.value = false
  }

  ws.value.onclose = () => {
    wsConnected.value = false
  }
}

// 断开 WebSocket
const disconnectWebSocket = () => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
  wsConnected.value = false
}

// 切换 WebSocket 连接
const toggleWebSocket = () => {
  if (wsConnected.value) {
    disconnectWebSocket()
  } else {
    connectWebSocket()
  }
}

// 清空实时日志
const clearLiveLogs = () => {
  liveLogs.value = []
}

// 复制物品数据
const copyItemData = async (decodedItem) => {
  try {
    // 构建要复制的文本
    let text = ''

    // 物品名称
    const displayName = getDisplayName(decodedItem.meta)
    if (displayName) {
      text += displayName + '\n'
    } else {
      text += formatMaterial(decodedItem.material) + '\n'
    }

    // 数量
    text += `数量: ${decodedItem.amount}\n`

    // Lore
    if (decodedItem.meta?.lore && decodedItem.meta.lore.length > 0) {
      text += '\n描述:\n'
      decodedItem.meta.lore.forEach(line => {
        if (line) text += line + '\n'
      })
    }

    // 附魔
    if (decodedItem.enchantments && Object.keys(decodedItem.enchantments).length > 0) {
      text += '\n附魔:\n'
      for (const [enchKey, level] of Object.entries(decodedItem.enchantments)) {
        text += `${formatEnchantment(enchKey)} ${level}\n`
      }
    }

    // 材质
    text += `\n材质: ${decodedItem.material}`

    // 复制到剪贴板
    await navigator.clipboard.writeText(text)

    // 显示提示（简单实现）
    alert('已复制物品数据到剪贴板！')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请重试')
  }
}

// 生命周期
onMounted(() => {
  fetchShopLogs()
  fetchTrades()

  // 加载 Iconify
  if (!document.querySelector('script[src*="iconify"]')) {
    const script = document.createElement('script')
    script.src = 'https://code.iconify.design/3/3.1.0/iconify.min.js'
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<style scoped>
.billing-dashboard {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--vp-c-divider);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--vp-c-brand);
}

.tab-button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.tab-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

/* 内容区域 */
.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.content-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.controls select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
}

.refresh-btn,
.ws-toggle-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover,
.clear-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.ws-toggle-btn.connected {
  border-color: #10b981;
  color: #10b981;
}

.ws-toggle-btn.disconnected {
  border-color: #ef4444;
  color: #ef4444;
}

/* 状态提示 */
.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  font-size: 1rem;
}

.loading { color: var(--vp-c-brand); }
.error   { color: #ef4444; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg);} }

/* 表格 */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--vp-c-bg);
}

.data-table thead { background: var(--vp-c-bg-soft); }

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-divider);
  white-space: nowrap;
}

.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.data-table tbody tr:hover { background: var(--vp-c-bg-soft); }

.player-name { font-weight: 600; color: var(--vp-c-brand); }

.item-name { font-family: monospace; }

.item-cell {
  display: flex; align-items: center; gap: 0.5rem;
}

.item-badge {
  display: inline-flex; align-items: center;
  padding: 0.125rem 0.375rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 4px; font-size: 0.75rem; cursor: help;
}

.item-badge .iconify { font-size: 0.875rem; }

.amount { text-align: right; font-weight: 500; }
.price  { text-align: right; font-weight: 600; color: #10b981; }

.timestamp { font-size: 0.875rem; color: var(--vp-c-text-3); white-space: nowrap; }

.action-badge {
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 0.25rem 0.75rem; border-radius: 12px;
  font-size: 0.875rem; font-weight: 500;
}
.action-badge.buy  { background: #dbeafe; color: #1e40af; }
.action-badge.sell { background: #dcfce7; color: #166534; }

/* 交易卡片 */
.trades-list { display: flex; flex-direction: column; gap: 1rem; }
.trade-card {
  border: 1px solid var(--vp-c-divider); border-radius: 8px;
  padding: 1.5rem; background: var(--vp-c-bg);
  transition: all 0.3s;
}
.trade-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.trade-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.trade-id { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--vp-c-text-1); }
.trade-time { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--vp-c-text-3); }

.trade-players {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem; align-items: center;
}

.player-section { display: flex; flex-direction: column; gap: 0.75rem; }

.player-header {
  display: flex; align-items: center; gap: 0.5rem;
  font-weight: 600; color: var(--vp-c-brand); font-size: 1.1rem;
}

.items-list { display: flex; flex-direction: column; gap: 0.5rem; }

.item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem; background: var(--vp-c-bg-soft); border-radius: 6px;
}

.item-info { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.decoded-item {
  display: flex; flex-direction: column; gap: 0.375rem;
  padding: 0.375rem 0; position: relative;
}
.decoded-item:not(:last-child) { border-bottom: 1px dashed var(--vp-c-divider); padding-bottom: 0.5rem; }

.item-display {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;
  transition: background 0.2s; user-select: none;
}
.item-display:hover { background: var(--vp-c-bg-soft); }
.item-display:active { background: var(--vp-c-brand-soft); transform: scale(0.98); }

.item-name-display { font-weight: 500; color: var(--vp-c-text-1); font-size: 0.9rem; }
.item-amount-display { font-size: 0.85rem; color: var(--vp-c-text-2); margin-left: auto; }

/* ===== Tooltip（适配 Plume 主题 + 小优化兜底）===== */
.item-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(8px);
  margin-left: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 120ms var(--vp-t-color), transform 120ms var(--vp-t-transform), visibility 120ms var(--vp-t-color);
  z-index: calc(var(--vp-z-index-overlay) + 10);
  pointer-events: none;
}
.decoded-item:hover .item-tooltip {
  opacity: 1; visibility: visible; transform: translateY(-50%) translateX(0);
}

.tooltip-content {
  position: relative;
  min-width: 240px;
  max-width: 420px;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow-3);
  backdrop-filter: saturate(140%) blur(6px);
  -webkit-backdrop-filter: saturate(140%) blur(6px);
  line-height: 1.55;
  word-break: break-word;
}

/* 默认轻微阴影，暗色更强 */
.tooltip-content :where(span) { text-shadow: 0 1px 0 rgb(0 0 0 / 0.08); }
[data-theme="dark"] .tooltip-content :where(span) { text-shadow: 0 1px 0 rgb(0 0 0 / 0.24); }

.tooltip-name {
  font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; color: var(--vp-c-text-1);
}

.tooltip-lore {
  margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--vp-c-divider);
}
.tooltip-lore-line {
  font-size: 0.9rem; line-height: 1.6; color: var(--vp-c-text-2);
}

.tooltip-enchantments {
  margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--vp-c-divider);
}
.tooltip-enchant {
  font-size: 0.9rem; font-weight: 600; color: var(--vp-c-important-2);
}

.tooltip-material {
  margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--vp-c-divider);
  font-size: 0.82rem; color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono); word-break: break-all;
}

/* 箭头 */
.tooltip-content::after {
  content: "";
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 12px; height: 12px;
  background: var(--vp-c-bg-elv);
  border-left: 1px solid var(--vp-c-divider);
  border-top: 1px solid var(--vp-c-divider);
  box-shadow: -2px 0 4px rgb(0 0 0 / 0.06);
}
[data-theme="dark"] .tooltip-content::after { box-shadow: -2px 0 4px rgb(0 0 0 / 0.3); }

/* § 颜色码输出的文本兜底（外层容器） */
.mc-colored { color: var(--vp-c-text-1); line-height: 1.5; }

/* 移动端：tooltip 在下方展示，避免出屏 */
@media (max-width: 768px) {
  .item-tooltip {
    left: 0; top: 100%; transform: translateY(8px);
    margin-left: 0; margin-top: 0.5rem;
  }
  .decoded-item:hover .item-tooltip { transform: translateY(0); }
  .tooltip-content::after {
    left: 14px; top: -6px; transform: rotate(45deg);
    border-left: 0; border-top: 0;
    border-right: 1px solid var(--vp-c-divider);
    border-bottom: 1px solid var(--vp-c-divider);
    box-shadow: 0 -2px 4px rgb(0 0 0 / 0.06);
  }
}

/* 微交互 & 其他 */
.item-type { font-size: 0.75rem; color: var(--vp-c-text-3); text-transform: uppercase; }
.item-minecraft-id {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem;
  font-size: 0.875rem; font-family: monospace;
}
.item-id-chip {
  display: inline-block; padding: 0.125rem 0.375rem;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 4px; color: var(--vp-c-text-1); font-weight: 500;
}
.item-unknown { font-size: 0.875rem; color: var(--vp-c-text-3); font-style: italic; }

.item-badge { display: inline-flex; align-items: center; padding: 0.125rem 0.25rem; background: var(--vp-c-brand-soft); color: var(--vp-c-brand); border-radius: 3px; font-size: 0.75rem; cursor: help; }
.item-badge .iconify { font-size: 0.75rem; }

.trade-arrow { font-size: 2rem; color: var(--vp-c-brand); }

/* 实时监控 */
.live-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem; margin-bottom: 1.5rem;
}
.stat-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1.5rem; background: var(--vp-c-bg-soft); border-radius: 8px; border: 1px solid var(--vp-c-divider);
}
.stat-card .iconify { font-size: 2rem; color: var(--vp-c-brand); }
.stat-value { font-size: 2rem; font-weight: 700; color: var(--vp-c-text-1); }
.stat-label { font-size: 0.875rem; color: var(--vp-c-text-3); }

.live-row { animation: slideIn 0.3s; }
@keyframes slideIn { from { opacity: 0; transform: translateX(-20px);} to { opacity: 1; transform: translateX(0);} }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1rem; padding: 3rem; color: var(--vp-c-text-3);
}
.empty-state .iconify { font-size: 3rem; }

/* 响应式 */
@media (max-width: 768px) {
  .trade-players { grid-template-columns: 1fr; }
  .trade-arrow { transform: rotate(90deg); }

  .content-header { flex-direction: column; align-items: flex-start; }
  .controls { width: 100%; flex-wrap: wrap; }
  .controls select, .controls button { flex: 1; }
}

/* ============================= */
/* === 浅色主题可读性增强补丁 === */
/* ============================= */
/* 注意：SFC scoped 下，v-html 的内部节点要用 :deep() 选取 */
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored) {
  /* 统一较强描边与阴影，先兜底一层 */
  text-shadow:
    0 0.5px 0 rgba(0, 0, 0, 0.28),
    0 1px 0 rgba(0, 0, 0, 0.18),
    0 0 2px rgba(0, 0, 0, 0.22);
  -webkit-text-stroke: 0.25px rgba(0, 0, 0, 0.28);
}

/* 高风险浅色：白 / 亮黄 / 亮灰 / 黄橙 → 进一步加粗描边与阴影 */
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #FFFFFF"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #FFFF55"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #AAAAAA"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #FFAA00"]) {
  text-shadow:
    0 0 3px rgba(0, 0, 0, 0.35),
    0 1px 1px rgba(0, 0, 0, 0.28),
    0 0 6px rgba(0, 0, 0, 0.24);
  -webkit-text-stroke: 0.4px rgba(0, 0, 0, 0.34);
}

/* 简单启发式：针对 #FFxxxx 这类偏亮色再兜底一层 */
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #FF"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #Ff"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #fF"]),
:root:not([data-theme="dark"]) :deep(.tooltip-content .mc-colored [style*="color: #ff"]) {
  -webkit-text-stroke: 0.35px rgba(0, 0, 0, 0.30);
}

/* 浅色主题下，tooltip 背景略比纯白深一点，提升分离度 */
:root:not([data-theme="dark"]) :deep(.tooltip-content) {
  background: var(--vp-c-bg-safe);
}

/* 链接在浅色 tooltip 内稍提对比度 */
:root:not([data-theme="dark"]) :deep(.tooltip-content a) {
  text-shadow:
    0 0.5px 0 rgba(0, 0, 0, 0.15),
    0 0 1px rgba(0, 0, 0, 0.15);
  font-weight: 600;
}
</style>
