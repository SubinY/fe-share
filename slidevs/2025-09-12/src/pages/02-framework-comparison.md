---
layout: two-cols
---

::default::

# 框架对比分析 ⚔️

## React Hook

<v-clicks>

- **闭包** + Fiber架构
- 函数组件能**共享状态**
- 依赖数组控制重新执行
- 需要遵循Hook规则

</v-clicks>

```jsx
function useCounter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return { count, increment };
}
```

::right::

## Vue Hook

<v-clicks>

- **闭包** + Proxy响应式
- 每次调用都是**新的独立状态**
- 自动依赖收集
- 更直观的使用方式

</v-clicks>

```ts
function useCounter() {
  const count = ref(0);
  
  const increment = () => {
    count.value++;
  };
  
  return { count, increment };
}
```

---
layout: center
---

# 核心区别总结

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="p-6 bg-blue-50 rounded-lg">

## React Hook 特点
- 状态在函数调用间**持久化**
- 需要手动优化性能
- 严格的调用规则
- 心智负担较重

</div>

<div class="p-6 bg-green-50 rounded-lg">

## Vue Hook 特点  
- 每次调用创建**新实例**
- 自动响应式优化
- 调用更加灵活
- 心智负担较轻

</div>

</div>

---
layout: two-cols
---

::default::

# Vue2 Mixin vs Vue3 Hook

## Vue2 Mixin 方式

```js
// counterMixin.js
export const counterMixin = {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};

// 组件中使用
export default {
  mixins: [counterMixin]
};
```

❌ 命名冲突风险  
❌ 来源不明确  
❌ 难以追踪

::right::

## Vue3 Hook 方式

```ts
// useCounter.js
import { ref } from 'vue';

export function useCounter() {
  const count = ref(0);
  const increment = () => {
    count.value++;
  };
  return { count, increment };
}

// 组件中使用
export default {
  setup() {
    const { count, increment } = useCounter();
    return { count, increment };
  }
};
```

✅ 显式导入导出  
✅ 来源清晰明确  
✅ 易于追踪和调试