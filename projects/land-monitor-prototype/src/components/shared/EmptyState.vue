<script setup lang="ts">
import { computed } from 'vue'
import { FolderOpen, SearchX, Lock } from 'lucide-vue-next'

type EmptyStateType = 'no-data' | 'no-results' | 'no-permission'

const props = withDefaults(defineProps<{
  /** 空状态类型 */
  type?: EmptyStateType
  /** 自定义标题 */
  title?: string
  /** 自定义描述 */
  description?: string
  /** 按钮文案 */
  actionText?: string
}>(), {
  type: 'no-data',
})

const emit = defineEmits<{
  action: []
}>()

const config: Record<EmptyStateType, { icon: typeof FolderOpen; title: string; description: string }> = {
  'no-data': {
    icon: FolderOpen,
    title: '暂无数据',
    description: '当前没有可展示的数据',
  },
  'no-results': {
    icon: SearchX,
    title: '无匹配结果',
    description: '尝试调整筛选条件后重试',
  },
  'no-permission': {
    icon: Lock,
    title: '暂无权限',
    description: '请联系管理员获取访问权限',
  },
}

const current = computed(() => config[props.type])
const displayTitle = computed(() => props.title ?? current.value.title)
const displayDesc = computed(() => props.description ?? current.value.description)
</script>

<template>
  <div class="empty-state">
    <component :is="current.icon" class="empty-state__icon" :size="48" strokeWidth="1.5" />
    <h3 class="empty-state__title">{{ displayTitle }}</h3>
    <p class="empty-state__desc">{{ displayDesc }}</p>
    <el-button
      v-if="actionText"
      type="primary"
      plain
      class="empty-state__action"
      @click="emit('action')"
    >
      {{ actionText }}
    </el-button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #909399;
}

.empty-state__icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-state__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.empty-state__desc {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
}

.empty-state__action {
  margin-top: 4px;
}
</style>
