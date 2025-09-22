---
layout: default
---

# Hook 单元测试 🧪

Hook 的独立性让单元测试变得简单直观

## 测试 Hook 的基本思路

<v-clicks>

- Hook 本质上是普通的 JavaScript 函数
- 可以独立测试，无需渲染组件
- 测试覆盖状态管理和业务逻辑  
- 验证响应式数据的正确性

</v-clicks>

---

# 示例：useTest Hook

<div class="grid grid-cols-2 gap-8">

<div>

## Hook 实现

```ts
import { ref } from "vue";

export function useTest() {
  const test = ref('test');
  return {
    test,
  };
}
```

</div>

<div>

## 测试用例结构

```ts
import { describe, it, expect } from '@jest/globals';
import { useTest } from '../useTest';

describe('useTest', () => {
  // 测试用例...
});
```

</div>

</div>

---

# 完整测试用例示例

````md magic-move {lines: true}
```ts {1-10|all}
// 基础功能测试
describe('useTest', () => {
  it('should return a reactive test ref with initial value "test"', () => {
    const { test } = useTest();
    
    expect(test.value).toBe('test');
  });
});
```

```ts {1-15|all}
// 状态更新测试
describe('useTest', () => {
  it('should allow updating the test value', () => {
    const { test } = useTest();
    
    // 初始值
    expect(test.value).toBe('test');
    
    // 更新值
    test.value = 'updated test';
    expect(test.value).toBe('updated test');
  });
});
```

```ts {1-20|all}
// 返回值结构测试
describe('useTest', () => {
  it('should return an object with test property', () => {
    const result = useTest();
    
    expect(result).toHaveProperty('test');
    expect(typeof result.test).toBe('object');
    expect(result.test.value).toBe('test');
  });
});
```

```ts {1-25|all}
// 独立实例测试
describe('useTest', () => {
  it('should create independent instances', () => {
    const instance1 = useTest();
    const instance2 = useTest();
    
    // 两个实例应该是独立的
    expect(instance1.test.value).toBe('test');
    expect(instance2.test.value).toBe('test');
    
    // 修改一个实例不应该影响另一个
    instance1.test.value = 'instance1';
    instance2.test.value = 'instance2';
    
    expect(instance1.test.value).toBe('instance1');
    expect(instance2.test.value).toBe('instance2');
  });
});
```
````

---
layout: center
---

# Hook 测试的核心价值 🎯

<div class="grid grid-cols-1 gap-6 mt-8">

<div class="p-6 bg-green-50 rounded-lg">

## ✅ 确保业务逻辑正确性
独立测试 Hook 中的状态管理和业务逻辑，不依赖组件渲染

</div>

<div class="p-6 bg-blue-50 rounded-lg">

## 🚀 提高开发效率  
快速验证 Hook 功能，减少调试时间，提高代码质量

</div>

<div class="p-6 bg-purple-50 rounded-lg">

## 🛡️ 重构保障
完善的测试覆盖让重构更安全，确保修改不会破坏现有功能

</div>

</div>
