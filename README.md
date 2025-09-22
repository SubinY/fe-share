# Slidev Workspace

> 集中式管理多个 Slidev 项目

## 特性

1. 支持单个slidev项目预览和构建
2. 提供预览页面，方便查看所有项目
3. 支持预览页面常规部署及IPFS部署

## 使用

1. 安装依赖

```bash
pnpm install
```

2. 项目预览

2.1 单个项目预览

```bash
pnpm run dev
```

2.2 所有项目预览

```bash
pnpm run build:all
pnpm run preview
```

3. 项目构建

3.1 单个slidev项目构建

```bash
pnpm run build
```

3.2 所有slidev项目构建

```bash
pnpm run build:all
```

3.3 预览项目普通构建

```bash
pnpm run build:default
```

3.4 预览项目IPFS构建

```bash
pnpm run build:ipfs
```

[IPFS网络](https://www.xugj520.cn/archives/pinme-ipfs-guide.html)
