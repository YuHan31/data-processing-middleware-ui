# 安装和运行指南

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 4. 预览生产构建

```bash
npm run preview
```

## 配置说明

### 后端 API 地址配置

在 `vite.config.js` 中修改代理配置：

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:9999',  // 修改为你的后端地址
      changeOrigin: true
    }
  }
}
```

## 常见问题

### 1. 端口被占用

如果 3000 端口被占用，可以在 `vite.config.js` 中修改端口号。

### 2. API 请求失败

确保后端服务已启动，并检查 `vite.config.js` 中的代理配置是否正确。

### 3. 依赖安装失败

尝试清除缓存后重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```
