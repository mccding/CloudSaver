<template>
  <div class="browser-status" v-if="showStatus">
    <div class="status-indicator">
      <el-icon><Database /></el-icon>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Database } from '@element-plus/icons-vue';

const showStatus = ref(false);

const statusText = computed(() => {
  return '浏览器数据存储';
});

onMounted(() => {
  // 延迟显示状态，避免闪烁
  setTimeout(() => {
    showStatus.value = true;
  }, 1000);
});
</script>

<style lang="scss" scoped>
.browser-status {
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
    color: #409eff;
    transition: all 0.3s ease;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .browser-status {
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