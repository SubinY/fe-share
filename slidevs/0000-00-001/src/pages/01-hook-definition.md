---
layout: default
---

# Hook 定义 🎣

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

## 软件层面

Hook（钩子）是一种**编程机制**，用于在特定事件或时间点插入自定义代码，以拦截和修改现有代码的行为

</div>

<div>

## 前端框架层面

**逻辑复用**的核心工具 —— 是拥有状态的闭包函数，用于管理框架API调用/状态以及副作用

</div>

</div>

---

# 常见场景示例

<v-clicks>

<div class="mb-6">

## 1. Webpack 生命周期钩子
webpack运行时的生命周期被plugins监听，做各种拦截修改动作

</div>

<div>

## 2. Vue3 组件生命周期
- `beforeCreate/Created` - 初始化组件对象
- `beforeMounted/onMounted` - 挂载DOM

</div>

</v-clicks>

---
layout: center
---

# Hook 本质探究

Vue3中的Hook本质上就是一个普通函数 ⚡

```js {all|2-6|8-12}
// 这就是一个Hook
function useTest() {
  const test = ref("test");
  return {
    test
  };
}

// 在组件中使用
setup() {
  const { test } = useTest();
  return { test };
}
```

---
layout: center
---

# Vue3编译后的真相 🔍

Hook本质上就是普通的JavaScript函数

```js
function useTest() {
  const test = ref("test");
  return {
    test
  };
}
```

<div class="text-center mt-8">
<span class="bg-blue-100 px-4 py-2 rounded text-blue-800">
没有魔法，只有闭包和响应式系统的完美结合 ✨
</span>
</div>
