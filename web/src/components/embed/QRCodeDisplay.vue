<template>
  <div class="qr-code-display">
    <div class="qr-container">
      <canvas ref="qrCanvas"></canvas>
    </div>
    <div v-if="showUrl" class="qr-url">
      {{ url }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 200,
  },
  showUrl: {
    type: Boolean,
    default: false,
  },
  color: {
    type: Object,
    default: () => ({
      dark: '#000000',
      light: '#FFFFFF',
    }),
  },
});

const qrCanvas = ref(null);

const generateQRCode = async () => {
  if (!qrCanvas.value || !props.url) return;

  try {
    await QRCode.toCanvas(qrCanvas.value, props.url, {
      width: props.size,
      margin: 2,
      color: props.color,
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
};

onMounted(() => {
  generateQRCode();
});

watch(() => props.url, () => {
  generateQRCode();
});

watch(() => props.size, () => {
  generateQRCode();
});
</script>

<style scoped>
.qr-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.qr-container {
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.qr-url {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 300px;
  word-break: break-all;
}
</style>
