---
layout: default
---

# Hook 最佳实践与注意事项 ⚡

开发高质量 Hook 的核心原则和实践指南

---

# 命名规范与设计原则

<div class="grid grid-cols-2 gap-8">

<div>

## 📝 命名规范

<v-clicks>

- **必须以 "use" 开头**
- **动词 + 名词结构**
- **避免过于宽泛的名称**
- **语义化、可读性强**

</v-clicks>

```ts
// ✅ 好的命名
useCounter()
useUserData()
useFormValidation()
useApiRequest()

// ❌ 不好的命名
useData()
useUtils()
useHelper()
useManager()
```

</div>

<div>

## 🎯 设计原则

<v-clicks>

- **单一职责**：一个 Hook 只做一件事
- **合理拆分**：复杂逻辑拆分为小 Hook
- **组合使用**：多个 Hook 协作完成功能
- **职责明确**：每个 Hook 边界清晰

</v-clicks>

```ts
// ✅ 职责清晰的拆分
const useUserProfile = () => {
  const { data: user } = useApiRequest('/api/user')
  const { validate } = useFormValidation(userSchema)
  const { upload } = useFileUpload()
  
  return { user, validate, upload }
}
```

</div>

</div>

---

# 错误处理与副作用管理

<div class="grid grid-cols-2 gap-8">

<div>

## ⚠️ 错误处理

将错误信息作为状态暴露给组件

```ts {all|4|8-11|13-15}
export function useApiRequest(url: string) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const execute = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(url)
      data.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('API Request failed:', err)
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, execute }
}
```

</div>

<div>

## 🧹 清理副作用

使用生命周期钩子清理资源

```ts {all|5-7|9-13|15-17}
export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null)
  const message = ref('')
  
  const connect = () => {
    socket.value = new WebSocket(url)
  }
  
  onUnmounted(() => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
  })
  
  return { socket, message, connect }
}
```

</div>

</div>

---

# 性能优化策略

<v-clicks>

<div class="grid grid-cols-2 gap-8">

<div class="p-6 bg-blue-50 rounded-lg">

## 🚀 避免不必要的响应式

```ts
// ❌ 过度响应式
const config = ref({
  apiUrl: '/api',
  timeout: 5000
})

// ✅ 合理使用响应式
const config = {
  apiUrl: '/api',
  timeout: 5000
}
const data = ref(null)
```

</div>

<div class="p-6 bg-green-50 rounded-lg">

## 📊 合理使用 watch

```ts
// ❌ 监听整个对象
watch(userInfo, () => {
  // 任何属性变化都会触发
})

// ✅ 精确监听特定属性
watch(() => userInfo.value.id, (newId) => {
  // 只在 id 变化时触发
})
```

</div>

<div class="p-6 bg-purple-50 rounded-lg">

## 🎯 缓存计算结果

```ts
const expensiveComputed = computed(() => {
  return heavyCalculation(data.value)
})

// 使用 shallowRef 减少深度响应
const shallowData = shallowRef(largeObject)
```

</div>

<div class="p-6 bg-yellow-50 rounded-lg">

## ⏱️ 防抖与节流

```ts
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((query) => {
  // 搜索逻辑
}, 300)
```

</div>

</div>

</v-clicks>

---
layout: center
---

# 完整的 Hook 开发检查清单 ✅

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="space-y-4">

## 📋 设计阶段
- [ ] 职责单一明确
- [ ] 命名符合规范  
- [ ] 参数设计合理
- [ ] 返回值结构清晰

## 🔧 实现阶段
- [ ] 错误处理完善
- [ ] 副作用正确清理
- [ ] 性能优化到位
- [ ] 类型定义完整

</div>

<div class="space-y-4">

## 🧪 测试阶段
- [ ] 单元测试覆盖
- [ ] 边界情况测试
- [ ] 错误场景测试
- [ ] 性能测试通过

## 📚 文档阶段
- [ ] 使用示例清晰
- [ ] 参数说明完整
- [ ] 注意事项明确
- [ ] 最佳实践指导

</div>

</div>
