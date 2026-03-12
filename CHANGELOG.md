# 更新日志

## 版本 1.1.0 (2024-03-13)

### 🎯 重要更新：状态枚举同步

根据后端实际的任务状态枚举，完成了前端状态系统的全面更新。

### ✨ 新增功能

1. **状态工具函数** (`src/utils/taskStatus.js`)
   - 统一的状态处理工具
   - 包含 8 个实用函数
   - 所有页面统一调用

2. **新增 API 接口**
   - `POST /api/task/create` - 创建任务
   - `GET /api/task/status/{taskId}` - 查询任务状态
   - `GET /api/file/info/{taskId}` - 查询文件信息

3. **新增文档**
   - `STATUS.md` - 任务状态详细说明
   - `CHANGELOG.md` - 更新日志（本文档）

### 🔄 状态枚举更新

#### 旧状态（已废弃）
- ~~PENDING~~ → 已移除
- ~~RUNNING~~ → 已移除
- ~~PROCESSING~~ → 已移除

#### 新状态（当前使用）
- ✅ UPLOADED - 已上传
- ✅ PARSING - 解析中
- ✅ CLEANING - 清洗中
- ✅ NORMALIZING - 标准化中
- ✅ EXPORTING - 导出中
- ✅ FINISHED - 已完成
- ✅ FAILED - 失败

### 📝 文件修改清单

#### 新增文件
- `src/utils/taskStatus.js` - 状态工具函数
- `STATUS.md` - 状态说明文档
- `CHANGELOG.md` - 本文档

#### 修改文件
- `src/views/Dashboard.vue` - 更新状态处理逻辑
- `src/views/Tasks.vue` - 更新按钮显示逻辑
- `src/views/TaskProgress.vue` - 更新进度步骤
- `src/api/task.js` - 新增接口函数
- `src/api/file.js` - 新增接口函数
- `API.md` - 更新接口文档
- `README.md` - 更新说明

### 🔧 配置更新

1. **后端端口**: 8080 → 9999
2. **文件大小限制**: 50MB → 100MB
3. **处理阶段**: 4 步 → 6 步

### 📊 处理阶段更新

#### 旧流程（4 步）
1. ~~文件解析~~
2. ~~数据清洗~~
3. ~~数据处理~~
4. ~~结果导出~~

#### 新流程（6 步）
1. ✅ 已上传
2. ✅ 文件解析
3. ✅ 数据清洗
4. ✅ 数据标准化（新增）
5. ✅ 结果导出
6. ✅ 完成

### 🎨 UI 优化

1. **状态标签颜色**
   - 已上传：蓝色（info）
   - 处理中：橙色（warning）
   - 已完成：绿色（success）
   - 失败：红色（danger）

2. **按钮显示逻辑**
   - 启动按钮：仅在 UPLOADED 或 FAILED 状态显示
   - 停止按钮：仅在运行中状态显示
   - 下载按钮：仅在 FINISHED 状态显示

3. **统计数据**
   - 运行中任务：包含 PARSING、CLEANING、NORMALIZING、EXPORTING

### 🐛 修复问题

1. 修复状态判断逻辑错误
2. 修复按钮显示条件不准确
3. 修复进度步骤与实际流程不匹配

### 📚 文档完善

1. 更新 API 文档，添加新接口说明
2. 更新 README，修正端口和文件大小
3. 新增 STATUS.md，详细说明状态系统
4. 更新 SUMMARY.md，补充完整信息

### ⚠️ 破坏性变更

如果你之前使用了旧版本，请注意：

1. **状态枚举变更**
   - 所有 `PENDING` 需改为 `UPLOADED`
   - 所有 `RUNNING` 需根据实际阶段改为对应状态
   - 移除了 `PROCESSING` 状态

2. **后端端口变更**
   - 默认端口从 8080 改为 9999
   - 需要在 `vite.config.js` 中确认配置

3. **文件大小限制**
   - 从 50MB 提升到 100MB
   - 需要确保后端也支持此限制

### 🚀 升级指南

如果你正在使用旧版本，请按以下步骤升级：

1. **备份代码**
   ```bash
   git commit -am "backup before upgrade"
   ```

2. **拉取最新代码**
   ```bash
   git pull origin main
   ```

3. **重新安装依赖**
   ```bash
   npm install
   ```

4. **检查配置**
   - 确认 `vite.config.js` 中的后端地址
   - 确认后端服务运行在正确端口

5. **启动项目**
   ```bash
   npm run dev
   ```

### 📋 待办事项

未来版本计划：

- [ ] 添加任务筛选功能
- [ ] 添加任务搜索功能
- [ ] 支持批量操作
- [ ] 添加数据可视化图表
- [ ] 支持 WebSocket 实时推送
- [ ] 添加用户认证系统

---

## 版本 1.0.0 (2024-03-13)

### 🎉 初始版本

- ✅ 完成基础项目搭建
- ✅ 实现 5 个核心页面
- ✅ 封装 10 个 API 接口
- ✅ 完善项目文档
- ✅ 支持文件上传下载
- ✅ 支持任务管理
- ✅ 支持进度查看
- ✅ 支持日志查看

---

**维护者**: Claude Code
**最后更新**: 2024-03-13
