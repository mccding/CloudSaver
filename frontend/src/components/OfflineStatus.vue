<template>
  <div class="offline-status" v-if="showStatus">
    <div class="status-indicator" :class="{ offline: isOffline }">
      <el-icon v-if="isOffline"><Warning /></el-icon>
      <el-icon v-else><SuccessFilled /></el-icon>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Warning, SuccessFilled } from '@element-plus/icons-vue';
import { apiAdapter } from '@/utils/apiAdapter';

const isOffline = ref(false);
const showStatus = ref(false);

const statusText = computed(() => {
  return isOffline.value ? '离线模式' : '在线模式';
});

onMounted(() => {
  // 延迟显示状态，避免闪烁
  setTimeout(() => {
    showStatus.value = true;
    isOffline.value = apiAdapter.getMode() === 'offline';
  }, 1000);
});

// 监听模式变化
watch(() => apiAdapter.getMode(), (mode: string) => {
  isOffline.value = mode === 'offline';
});
</script>

<style lang="scss" scoped>
.offline-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    color: #67c23a;
    transition: all 0.3s ease;
    
    &.offline {
      color: #f56c6c;
      border-color: #fde2e2;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .offline-status {
    top: 10px;
    right: 10px;
    
    .status-indicator {
      padding: 6px 10px;
      font-size: 11px;
      
      .el-icon {
        font-size: 12px;
      }
    }
  }
}
</style> 