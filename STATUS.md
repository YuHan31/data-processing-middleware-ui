# 任务状态说明文档

## 任务状态枚举

根据后端定义，系统支持以下 7 种任务状态：

### 1. UPLOADED（已上传）
- **含义**: 文件已成功上传到服务器
- **标签颜色**: 蓝色（info）
- **可执行操作**: 启动任务
- **下一状态**: PARSING

### 2. PARSING（解析中）
- **含义**: 正在解析上传的文件
- **标签颜色**: 橙色（warning）
- **可执行操作**: 停止任务、查看进度、查看日志
- **下一状态**: CLEANING 或 FAILED

### 3. CLEANING（清洗中）
- **含义**: 正在清洗和验证数据
- **标签颜色**: 橙色（warning）
- **可执行操作**: 停止任务、查看进度、查看日志
- **下一状态**: NORMALIZING 或 FAILED

### 4. NORMALIZING（标准化中）
- **含义**: 正在标准化数据格式
- **标签颜色**: 橙色（warning）
- **可执行操作**: 停止任务、查看进度、查看日志
- **下一状态**: EXPORTING 或 FAILED

### 5. EXPORTING（导出中）
- **含义**: 正在导出处理结果
- **标签颜色**: 橙色（warning）
- **可执行操作**: 停止任务、查看进度、查看日志
- **下一状态**: FINISHED 或 FAILED

### 6. FINISHED（已完成）
- **含义**: 任务执行成功完成
- **标签颜色**: 绿色（success）
- **可执行操作**: 查看进度、查看日志、下载结果
- **下一状态**: 无（终态）

### 7. FAILED（失败）
- **含义**: 任务执行失败
- **标签颜色**: 红色（danger）
- **可执行操作**: 启动任务（重试）、查看日志
- **下一状态**: PARSING（重新启动）

## 状态流转图

```
UPLOADED
   ↓
PARSING ────→ FAILED
   ↓              ↑
CLEANING ─────────┤
   ↓              ↑
NORMALIZING ──────┤
   ↓              ↑
EXPORTING ────────┤
   ↓
FINISHED
```

## 前端状态处理

### 运行中状态判断
以下状态被视为"运行中"：
- PARSING
- CLEANING
- NORMALIZING
- EXPORTING

### 按钮显示逻辑

#### 启动任务按钮
- 显示条件: `status === 'UPLOADED' || status === 'FAILED'`
- 按钮类型: success（绿色）

#### 停止任务按钮
- 显示条件: `status in ['PARSING', 'CLEANING', 'NORMALIZING', 'EXPORTING']`
- 按钮类型: warning（橙色）

#### 查看进度按钮
- 显示条件: 始终显示
- 按钮类型: primary（蓝色）

#### 查看日志按钮
- 显示条件: 始终显示
- 按钮类型: info（灰色）

#### 下载结果按钮
- 显示条件: `status === 'FINISHED'`
- 按钮类型: success（绿色）

## 进度条状态

### 正常状态（蓝色）
- UPLOADED
- PARSING
- CLEANING
- NORMALIZING
- EXPORTING

### 成功状态（绿色）
- FINISHED

### 异常状态（红色）
- FAILED

## 统计数据计算

### 总任务数
所有任务的总数

### 运行中任务
状态为 PARSING、CLEANING、NORMALIZING、EXPORTING 的任务数

### 已完成任务
状态为 FINISHED 的任务数

### 失败任务
状态为 FAILED 的任务数

## 处理阶段步骤

在任务进度页面，使用 Steps 组件展示处理阶段：

1. **已上传** - 文件上传完成
2. **文件解析** - 解析上传的文件
3. **数据清洗** - 清洗和验证数据
4. **数据标准化** - 标准化数据格式
5. **结果导出** - 导出处理结果
6. **完成** - 任务执行完成

### 步骤索引映射

```javascript
const stageMap = {
  'UPLOADED': 0,
  'PARSING': 1,
  'CLEANING': 2,
  'NORMALIZING': 3,
  'EXPORTING': 4,
  'FINISHED': 5
}
```

## 工具函数使用

前端提供了统一的状态工具函数（`src/utils/taskStatus.js`）：

```javascript
import {
  getStatusText,      // 获取状态文本
  getStatusType,      // 获取状态类型（用于 el-tag）
  getProgressStatus,  // 获取进度条状态
  isRunningStatus,    // 判断是否为运行中状态
  canStart,           // 判断是否可以启动
  canStop,            // 判断是否可以停止
  canDownload,        // 判断是否可以下载
  getStageStep        // 获取阶段对应的步骤索引
} from '@/utils/taskStatus'
```

## 注意事项

1. **状态一致性**: 前端状态枚举必须与后端保持完全一致
2. **大小写敏感**: 状态值区分大小写，必须使用大写
3. **状态验证**: 接收到未知状态时，应有默认处理逻辑
4. **实时更新**: 运行中的任务应定期刷新状态（建议 3 秒）
5. **错误处理**: 状态转换失败时应给予用户明确提示
