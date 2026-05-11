<template>
  <div class="data-compare-page">
    <!-- 统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon><Document /></el-icon>
        <span>{{ statsData.totalRecords || 0 }}</span>
        <span class="stat-label">条记录</span>
      </div>
      <div class="stat-item changed">
        <el-icon><Edit /></el-icon>
        <span>{{ totalChanges }}</span>
        <span class="stat-label">处变化</span>
      </div>
      <div class="stat-item rate">
        <span class="rate-label">变化率</span>
        <span class="rate-value">{{ statsData.changedRate || 0 }}%</span>
        <el-progress
          :percentage="statsData.changedRate || 0"
          :stroke-width="8"
          :show-text="false"
          :color="getRateColor(statsData.changedRate)"
          style="width: 80px"
        />
      </div>
      <div class="stat-divider"></div>
      <div class="field-filter-area">
        <span class="filter-label">按字段过滤：</span>
        <div class="field-tags">
          <el-tag
            v-for="field in sortedFieldStats"
            :key="field.field"
            :type="activeField === field.field ? 'danger' : 'info'"
            :effect="activeField === field.field ? 'dark' : 'light'"
            size="small"
            class="field-tag"
            @click="toggleField(field.field)"
          >
            {{ field.field }}
            <span class="field-mod-count">{{ field.modifications }}</span>
          </el-tag>
        </div>
      </div>
      <div class="stat-divider"></div>
      <el-checkbox v-model="onlyChanged">只看变化</el-checkbox>
      <el-button v-if="activeField" text type="primary" size="small" @click="activeField = ''">
        清除：{{ activeField }}
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <!-- 对比表格 (GitLab 风格) -->
    <div class="diff-container" v-loading="loadingList" element-loading-text="加载对比数据...">
      <div v-if="!loadingList && filteredData.length === 0" class="empty-state">
        <el-empty :description="onlyChanged ? '没有检测到数据变化' : '暂无对比数据'" />
      </div>

      <div v-else class="diff-list">
        <div
          v-for="(row, idx) in filteredData"
          :key="idx"
          :class="['diff-row', row.changedFields?.length > 0 ? 'has-changes' : 'no-changes']"
        >
          <!-- 行头 -->
          <div class="diff-row-header">
            <div class="row-index">
              <el-tag size="small" :type="row.changedFields?.length > 0 ? 'danger' : 'info'" effect="plain">
                #{{ (currentPage - 1) * pageSize + idx + 1 }}
              </el-tag>
            </div>
            <div class="row-status">
              <span v-if="row.changedFields?.length > 0" class="changed-badge">
                <el-icon><Edit /></el-icon>
                {{ row.changedFields.length }} 处变化
              </span>
              <span v-else class="unchanged-badge">无变化</span>
            </div>
            <el-button
              v-if="row.changedFields?.length > 0"
              text
              size="small"
              @click="toggleRow(idx)"
              style="margin-left: auto;"
            >
              {{ expandedRows.has(idx) ? '收起' : '展开' }}
              <el-icon>
                <ArrowUp v-if="expandedRows.has(idx)" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </div>

          <!-- 行内字段对比 -->
          <div class="diff-row-body">
            <template v-for="field in allFields" :key="field">
              <div
                :class="['field-diff', isFieldChanged(row, field) ? 'changed' : 'unchanged']"
              >
                <div class="field-name">{{ field }}</div>
                <div class="field-value before">
                  <el-tooltip
                    :content="String(row.before?.[field] ?? 'null')"
                    placement="top"
                    :show-after="300"
                    :disabled="!isLongValue(row.before?.[field])"
                  >
                    <span :class="['value-text', isFieldChanged(row, field) ? 'changed' : '']">
                      {{ formatValue(row.before?.[field]) }}
                    </span>
                  </el-tooltip>
                </div>
                <div class="field-arrow" v-if="isFieldChanged(row, field)">
                  <el-icon><Right /></el-icon>
                </div>
                <div class="field-arrow empty" v-else></div>
                <div class="field-value after">
                  <el-tooltip
                    :content="String(row.after?.[field] ?? 'null')"
                    placement="top"
                    :show-after="300"
                    :disabled="!isLongValue(row.after?.[field])"
                  >
                    <span :class="['value-text', isFieldChanged(row, field) ? 'changed' : '']">
                      {{ formatValue(row.after?.[field]) }}
                    </span>
                  </el-tooltip>
                </div>
              </div>
            </template>
          </div>

          <!-- 展开详情 -->
          <div v-if="expandedRows.has(idx) && row.changedFields?.length > 0" class="diff-detail">
            <div class="detail-title">
              <el-icon><Guide /></el-icon>
              变化详情
            </div>
            <div class="changed-fields-list">
              <div v-for="change in row.changedFields" :key="change.field" class="changed-field-item">
                <div class="change-field-name">{{ change.field }}</div>
                <div class="change-values">
                  <div class="change-before">
                    <span class="change-label">原始</span>
                    <el-tag type="danger" size="small" effect="plain">{{ change.beforeValue ?? 'null' }}</el-tag>
                  </div>
                  <div class="change-arrow">
                    <el-icon><Right /></el-icon>
                  </div>
                  <div class="change-after">
                    <span class="change-label">清洗后</span>
                    <el-tag type="success" size="small" effect="plain">{{ change.afterValue ?? 'null' }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalCount > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Edit, Document, Right, ArrowDown, ArrowUp, Guide, Close } from '@element-plus/icons-vue'
import { getTaskCompare, getTaskCompareStats } from '@/api/task'

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
})

// ---------- 数据 ----------
// 列表数据
const listData = ref({
  total: 0,
  page: 1,
  size: 100,
  totalPages: 0,
  onlyChanged: false,
  search: '',
  list: []
})

// 统计数据
const statsData = ref({
  totalRecords: 0,
  changedRecords: 0,
  unchangedRecords: 0,
  changedRate: 0,
  fieldStats: []
})

// ---------- 状态 ----------
const loadingList = ref(false)
const loadingStats = ref(false)
const onlyChanged = ref(false)
const currentPage = ref(1)
const pageSize = ref(100)
const expandedRows = ref(new Set())
const activeField = ref('')

// ---------- 计算属性 ----------
const tableData = computed(() => listData.value.list || [])
const totalCount = computed(() => listData.value.total || 0)

// 字段变化总数：把每个字段的修改次数相加
const totalChanges = computed(() => {
  const fieldStats = statsData.value.fieldStats || []
  const total = fieldStats.reduce((sum, field) => sum + (Number(field.modifications) || 0), 0)

  if (total > 0) return total

  return tableData.value.reduce((sum, row) => sum + (row.changedFields?.length || 0), 0)
})

// 所有字段（从数据行推断）
const allFields = computed(() => {
  const list = listData.value.list || []
  if (list.length === 0) return []
  const fields = new Set()
  list.forEach(row => {
    ;[...(row.before ? Object.keys(row.before) : []), ...(row.after ? Object.keys(row.after) : [])].forEach(k =>
      fields.add(k)
    )
  })
  return Array.from(fields).sort()
})

// 按字段过滤
const filteredData = computed(() => {
  if (!activeField.value) return tableData.value
  return tableData.value.filter(row => isFieldChanged(row, activeField.value))
})

// 排序后的字段统计
const sortedFieldStats = computed(() => {
  return [...(statsData.value.fieldStats || [])].sort((a, b) => b.modifications - a.modifications)
})

// ---------- 方法 ----------
const isFieldChanged = (row, field) => {
  return row.changedFields?.some(c => c.field === field) ?? false
}

const isLongValue = val => String(val ?? '').length > 50

const formatValue = val => {
  if (val === null || val === undefined) return 'null'
  const s = String(val)
  return s.length > 50 ? s.substring(0, 50) + '...' : s
}

const toggleRow = idx => {
  const s = new Set(expandedRows.value)
  s.has(idx) ? s.delete(idx) : s.add(idx)
  expandedRows.value = s
}

const toggleField = field => {
  activeField.value = activeField.value === field ? '' : field
}

const getRateColor = rate => {
  if (rate === undefined || rate === null) return '#909399'
  if (rate < 20) return '#67c23a'
  if (rate < 50) return '#e6a23c'
  return '#f56c6c'
}

// ---------- 加载 ----------
const loadStats = async () => {
  if (!props.taskId) return
  loadingStats.value = true
  try {
    const res = await getTaskCompareStats(props.taskId)
    if (res.code === 200 && res.data) {
      statsData.value = res.data
    }
  } catch (e) {
    console.error('加载统计失败:', e)
  } finally {
    loadingStats.value = false
  }
}

const loadCompare = async () => {
  if (!props.taskId) return
  loadingList.value = true
  try {
    const res = await getTaskCompare(props.taskId, {
      page: currentPage.value,
      size: pageSize.value,
      onlyChanged: onlyChanged.value
    })
    if (res.code === 200 && res.data) {
      listData.value = res.data
      expandedRows.value = new Set()
    } else {
      listData.value = { list: [] }
    }
  } catch (e) {
    console.error('加载对比数据失败:', e)
    listData.value = { list: [] }
  } finally {
    loadingList.value = false
  }
}

const loadAll = async () => {
  await Promise.all([loadStats(), loadCompare()])
}

// ---------- 事件 ----------
watch(onlyChanged, () => {
  currentPage.value = 1
  loadCompare()
})

watch(activeField, () => {
  currentPage.value = 1
})

const handlePageChange = () => {
  expandedRows.value = new Set()
  loadCompare()
}

const handleSizeChange = () => {
  currentPage.value = 1
  expandedRows.value = new Set()
  loadCompare()
}

onMounted(() => {
  loadAll()
})

defineExpose({ refresh: loadAll })
</script>

<style scoped>
.data-compare-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 4px 16px;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  color: #303133;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.stat-item .el-icon {
  font-size: 16px;
}

.stat-item.changed {
  color: #f56c6c;
}

.stat-label {
  font-weight: 400;
  font-size: 13px;
  color: #909399;
}

.stat-item.rate {
  gap: 10px;
}

.rate-label {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
}

.rate-value {
  font-size: 20px;
  font-weight: 700;
  color: #e6a23c;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #dcdfe6;
}

.field-filter-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
}

.field-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.field-tag {
  cursor: pointer;
  transition: transform 0.15s;
}

.field-tag:hover {
  transform: scale(1.05);
}

.field-mod-count {
  background: #ecf5ff;
  color: #409eff;
  border-radius: 8px;
  padding: 0 5px;
  margin-left: 4px;
  font-size: 10px;
}

/* Diff 容器 */
.diff-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}

.diff-list {
  display: flex;
  flex-direction: column;
}

/* 单条对比行 */
.diff-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.diff-row:last-child {
  border-bottom: none;
}

.diff-row.has-changes {
  background: #fffbf5;
}

.diff-row.no-changes {
  background: #fafafa;
}

.diff-row.has-changes:hover {
  background: #fff3e8;
}

/* 行头 */
.diff-row-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #f5f7fa;
}

.row-status {
  font-size: 12px;
}

.changed-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-weight: 500;
}

.unchanged-badge {
  color: #909399;
}

/* 行内字段对比 */
.diff-row-body {
  display: flex;
  flex-direction: column;
}

.field-diff {
  display: grid;
  grid-template-columns: 140px 1fr 30px 1fr;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-bottom: 1px dashed #f5f5f5;
  min-height: 40px;
}

.field-diff:last-child {
  border-bottom: none;
}

.field-diff.changed {
  background: rgba(245, 108, 108, 0.04);
  animation: fieldHighlight 1.5s ease-out;
}

@keyframes fieldHighlight {
  0% { background: rgba(245, 108, 108, 0.2); }
  100% { background: rgba(245, 108, 108, 0.04); }
}

.field-name {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-value {
  overflow: hidden;
}

.value-text {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 100%;
  transition: color 0.3s;
}

.value-text.changed {
  color: #f56c6c;
  font-weight: 500;
}

.field-arrow {
  display: flex;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.field-arrow.empty {
  visibility: hidden;
}

/* 展开详情 */
.diff-detail {
  padding: 12px 16px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.changed-fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.changed-field-item {
  padding: 10px 14px;
  background: #fef8f8;
  border: 1px solid #fde2e2;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-field-name {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.change-before, .change-after {
  display: flex;
  align-items: center;
  gap: 6px;
}

.change-label {
  font-size: 11px;
  color: #909399;
  min-width: 30px;
}

.change-arrow {
  color: #909399;
}

.change-arrow .el-icon {
  font-size: 14px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

.empty-state {
  padding: 60px 0;
}
</style>
