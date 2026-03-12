# 数据处理中间件系统 - 前端

基于 Vue3 + Element Plus + Vite 构建的数据处理中间件系统前端项目。

## 技术栈

- **框架**: Vue 3
- **UI库**: Element Plus
- **路由**: Vue Router
- **HTTP**: Axios
- **构建工具**: Vite

## 功能模块

### 1. 首页 Dashboard
- 系统概览
- 任务统计（总任务数、运行任务、完成任务、失败任务）
- 最近任务列表

### 2. 文件上传
- 支持拖拽上传
- 支持 CSV、Excel、JSON 格式
- 文件大小限制 100MB
- 上传成功后自动跳转任务管理页面

### 3. 任务管理
- 任务列表展示
- 任务状态标签（运行中、已完成、失败、等待中）
- 任务进度条
- 操作按钮：启动任务、停止任务、查看进度、查看日志、下载结果

### 4. 任务进度
- 实时进度展示
- 当前阶段显示
- 处理步骤可视化
- 自动刷新（3秒间隔）

### 5. 日志查看
- 根据任务ID查询日志
- 控制台风格显示
- 日志级别颜色区分（ERROR、WARN、INFO、SUCCESS）
- 自动滚动到底部

## 项目结构

```
src/
├── api/                  # API 接口封装
│   ├── request.js       # Axios 请求封装
│   ├── task.js          # 任务相关接口
│   ├── file.js          # 文件相关接口
│   └── log.js           # 日志相关接口
├── views/               # 页面组件
│   ├── Dashboard.vue    # 首页
│   ├── Upload.vue       # 文件上传
│   ├── Tasks.vue        # 任务管理
│   ├── TaskProgress.vue # 任务进度
│   └── Logs.vue         # 日志查看
├── router/              # 路由配置
│   └── index.js
├── App.vue              # 根组件
└── main.js              # 入口文件
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

访问 http://localhost:3000

## 构建生产

```bash
npm run build
```

## API 接口说明

### 后端接口地址
默认代理到 `http://localhost:9999`，可在 `vite.config.js` 中修改。

### 接口列表

- `GET /api/task/list` - 获取任务列表
- `POST /api/task/create` - 创建任务
- `POST /api/task/start/{taskId}` - 启动任务
- `POST /api/task/stop/{taskId}` - 停止任务
- `GET /api/task/status/{taskId}` - 查询任务状态
- `GET /api/task/progress/{taskId}` - 获取任务进度
- `POST /api/file/upload` - 上传文件
- `GET /api/file/info/{taskId}` - 查询文件信息
- `GET /api/file/download/{taskId}` - 下载结果文件
- `GET /api/log/{taskId}` - 获取任务日志

## 页面路由

- `/` - 首页
- `/upload` - 文件上传
- `/tasks` - 任务管理
- `/task-progress` - 任务进度
- `/logs` - 日志查看

## 使用流程

1. 打开系统首页，查看系统概览
2. 进入文件上传页面，上传数据文件（CSV/Excel/JSON）
3. 上传成功后自动跳转到任务管理页面
4. 在任务管理页面启动任务
5. 点击"查看进度"实时查看任务执行进度
6. 点击"查看日志"查看详细执行日志
7. 任务完成后，点击"下载结果"获取处理后的数据

## 注意事项

- 确保后端服务已启动并运行在 9999 端口
- 上传文件大小不超过 100MB
- 任务进度页面会每 3 秒自动刷新
- 日志显示采用控制台风格，支持不同级别的颜色区分
