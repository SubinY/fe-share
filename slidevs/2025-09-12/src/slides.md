---
# You can also start simply with 'default'
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://picsum.photos/seed/picsum/500/400
# some information about your slides (markdown enabled)
title: Vue3 Hook 深入解析
info: |
  ## Vue3 Hook 深入解析
  从概念到实践的完整指南

  涵盖Hook定义、框架对比、最佳实践等核心内容

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
# open graph
seoMeta:
  ogImage: https://cover.sli.dev
  ogTitle: Vue3 Hook 深入解析
  ogDescription: 从概念到实践的完整Vue3 Hook指南
routerMode: hash
---

# Vue3 Hook 深入解析

从概念到实践的完整指南 🎣

<div class="mt-12 space-y-4">
  <div class="text-lg opacity-80">
    探索Vue3 Composition API中Hook的核心概念、设计模式和最佳实践
  </div>
  
  <div @click="$slidev.nav.next" class="mt-8 py-2 px-4 bg-blue-500 text-white rounded cursor-pointer inline-block" hover:bg="blue-600">
    开始学习 <carbon:arrow-right class="inline ml-2" />
  </div>
</div>

<div class="abs-br m-6 text-xl">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="slidev-icon-btn">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" class="slidev-icon-btn">
    <carbon:logo-github />
  </a>1
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---

## src: ./pages/00-table-of-contents.md

---

## src: ./pages/01-hook-definition.md

---

## src: ./pages/02-framework-comparison.md

---

## src: ./pages/03-hook-benefits.md

---

## src: ./pages/04-hook-testing.md

---

## src: ./pages/05-hook-classification.md

---

## src: ./pages/06-state-sharing.md

---

## src: ./pages/07-best-practices.md

---

src: ./pages/08-learning-resources.md

<!--
Hook 主题幻灯片的自定义样式
-->

<style>
</style>

<!--
Hook 主题幻灯片完整呈现完毕
感谢观看！
-->
