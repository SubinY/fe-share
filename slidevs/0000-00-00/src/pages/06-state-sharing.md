---
layout: default
---

# Hook 状态共享问题 🔄

使用 Hook 时经常遇到的状态共享挑战与解决方案

<div class="grid grid-cols-3 gap-6 mt-8">

<div class="p-4 bg-red-50 rounded-lg">

## ❌ 常见做法
逐级传递 Props
*繁琐且易出错*

</div>

<div class="p-4 bg-yellow-50 rounded-lg">

## ⚠️ 局限方案
- 父子孙: `provide/inject`
- 兄弟组件: `pinia`

</div>

<div class="p-4 bg-green-50 rounded-lg">

## ✅ 完美解决
父子兄弟组件共享
*优雅的 Hook 解决方案*

</div>

</div>

---

# 传统状态共享方式对比

<div class="grid grid-cols-2 gap-8">

<div>

## 父子孙组件共享

```ts
// 父组件
import { provide } from 'vue'
import { useUserData } from '@/hooks/useUserData'

export default {
  setup() {
    const userData = useUserData()
    provide('userData', userData)
    
    return { userData }
  }
}

// 子/孙组件
import { inject } from 'vue'

export default {
  setup() {
    const userData = inject('userData')
    return { userData }
  }
}
```

</div>

<div>

## 兄弟组件共享

```ts
// 使用 Pinia Store
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userData = ref(null)
  
  const fetchUser = async () => {
    // 获取用户数据
  }
  
  return { userData, fetchUser }
})

// 兄弟组件中使用
import { useUserStore } from '@/stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    return { userStore }
  }
}
```

</div>

</div>

---
layout: center
---

# 父子兄弟组件共享解决方案 💡

优雅的 Hook 封装，解决复杂场景下的状态共享

---

# useProvide & useInject Hook

完美解决父子兄弟组件的状态共享问题

````md magic-move {lines: true}
```ts {1-8|all}
// useProvide - 提供状态的 Hook
import { provide, inject } from 'vue'

export function useProvide(key: string, hook: () => any) {
  const hookResult = hook()
  provide(key, hookResult)
  return hookResult
}
```

```ts {1-12|all}
// useInject - 注入状态的 Hook
export function useInject(key: string) {
  const injected = inject(key)
  if (injected) {
    return injected
  }
  
  throw new Error(`未找到标识为 "${key}" 的上下文，请确保父组件已调用 useProvide`)
}
```

```ts {all}
// 完整的解决方案
import { provide, inject } from 'vue'

export function useProvide(key: string, hook: () => any) {
  const hookResult = hook()
  provide(key, hookResult)
  return hookResult
}

export function useInject(key: string) {
  const injected = inject(key)
  if (injected) {
    return injected
  }
  
  throw new Error(`未找到标识为 "${key}" 的上下文，请确保父组件已调用 useProvide`)
}
```
````

---

# 实际使用示例

<div class="grid grid-cols-2 gap-8">

<div>

## 父组件 - 提供状态

```vue
<template>
  <div>
    <ChildComponent />
    <SiblingComponent />
  </div>
</template>

<script setup>
import { useProvide } from '@/hooks/useProvide'
import { useUserData } from '@/hooks/useUserData'

// 提供用户数据给子组件
const userData = useProvide('userData', useUserData)
</script>
```

</div>

<div>

## 子/兄弟组件 - 消费状态

```vue
<template>
  <div>
    <h2>{{ userData.name }}</h2>
    <p>{{ userData.email }}</p>
  </div>
</template>

<script setup>
import { useInject } from '@/hooks/useInject'

// 注入父组件提供的用户数据
const userData = useInject('userData')
</script>
```

</div>

</div>

---
layout: center
---

# 方案优势总结 🎯

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="p-6 bg-blue-50 rounded-lg">

## ✨ 优雅简洁
- 统一的 Hook API
- 无需额外配置
- 类型安全保障
- 清晰的错误提示

</div>

<div class="p-6 bg-green-50 rounded-lg">

## 🔧 灵活强大
- 支持任意 Hook 共享
- 可嵌套使用
- 适用于复杂组件树
- 保持响应式特性

</div>

</div>

<div class="text-center mt-8">
<span class="text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
让状态共享变得简单而优雅 ✨
</span>
</div>
