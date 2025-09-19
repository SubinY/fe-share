---
layout: default
---

# 项目中的 Hook 分类体系 📂

根据使用范围和职责，Hook 可以分为三个层级

<div class="grid grid-cols-3 gap-6 mt-8">

<div class="p-4 bg-blue-50 rounded-lg text-center">

## 🌐 应用级
全局通用的基础能力
`useHttp` `useMessage` `useResize`

</div>

<div class="p-4 bg-green-50 rounded-lg text-center">

## 📄 页面级
特定页面的业务逻辑
`useUserList` `useProductManagement`

</div>

<div class="p-4 bg-purple-50 rounded-lg text-center">

## 🧩 组件级
单个组件的状态管理
`useTableData` `useModalState`

</div>

</div>

---

# 应用级 Hook 示例

全应用共享的基础功能 Hook

<div class="grid grid-cols-2 gap-8">

<div>

## useHttp - 数据请求

```ts {all|4-6|8-17|19-21}
import { ref, onMounted } from 'vue';

export function useHttp(apiUrl) {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  onMounted(async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      data.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  });
  
  return { data, loading, error };
}
```

</div>

<div>

## useAttrs - 属性管理

```ts {all|3-7|14-23}
import { getCurrentInstance, reactive, 
         shallowRef, watchEffect } from 'vue';

interface UseAttrsOptions {
  excludeListeners?: boolean;
  excludeKeys?: string[];
  excludeDefaultKeys?: boolean;
}

function useAttrs(options: UseAttrsOptions = {}) {
  const instance = getCurrentInstance();
  if (!instance) return {};

  const {
    excludeListeners = false,
    excludeKeys = [],
    excludeDefaultKeys = true,
  } = options;
  
  const attrs = shallowRef({});
  const allExcludeKeys = excludeKeys.concat(
    excludeDefaultKeys ? DEFAULT_EXCLUDE_KEYS : []
  );

  // 监听属性变化逻辑...
  
  return attrs;
}
```

</div>

</div>

---

# 页面级与组件级 Hook

<div class="grid grid-cols-2 gap-8">

<div>

## 页面级 Hook 特点

<v-clicks>

- 服务于特定页面的业务逻辑
- 组合多个应用级 Hook
- 处理页面状态管理
- 封装页面级的数据流

</v-clicks>

```ts
// useUserManagement.js
export function useUserManagement() {
  const { data: users, loading } = useHttp('/api/users');
  const { showMessage } = useMessage();
  const { openModal } = useModal();
  
  const handleEdit = (user) => {
    openModal('edit', user);
  };
  
  return { users, loading, handleEdit };
}
```

</div>

<div>

## 组件级 Hook 特点

<v-clicks>

- 专注于单个组件的状态
- 处理组件内部逻辑
- 提高组件的可复用性
- 简化组件代码结构

</v-clicks>

```ts
// useTableActions.js
export function useTableActions() {
  const selectedRows = ref([]);
  const tableLoading = ref(false);
  
  const handleSelect = (rows) => {
    selectedRows.value = rows;
  };
  
  const handleBatchDelete = async () => {
    tableLoading.value = true;
    // 批量删除逻辑...
    tableLoading.value = false;
  };
  
  return { 
    selectedRows, 
    tableLoading, 
    handleSelect, 
    handleBatchDelete 
  };
}
```

</div>

</div>

---
layout: center
---

# Hook 分层设计原则 🏗️

<div class="grid grid-cols-1 gap-6 mt-8">

<div class="p-6 bg-gray-50 rounded-lg">

## 🔺 自底向上的依赖关系
**组件级** → 依赖 → **页面级** → 依赖 → **应用级**

</div>

<div class="p-6 bg-yellow-50 rounded-lg">

## 🎯 单一职责原则
每个 Hook 只关注自己层级的职责，避免跨层级的复杂依赖

</div>

<div class="p-6 bg-green-50 rounded-lg">

## 🔄 可复用性递减
应用级复用性最高，组件级复用性最低，但针对性最强

</div>

</div>
