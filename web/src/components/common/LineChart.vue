<template>
  <div class="line-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: Number,
    default: 300
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-text').trim(),
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-grid').trim(),
        drawBorder: false
      },
      ticks: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-text').trim()
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-grid').trim(),
        drawBorder: false
      },
      ticks: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-text').trim(),
        stepSize: 1
      }
    }
  }
};

const createChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');

  // Merge default options with user-provided options
  const mergedOptions = {
    ...defaultOptions,
    ...props.options,
    plugins: {
      ...defaultOptions.plugins,
      ...props.options.plugins
    },
    scales: {
      ...defaultOptions.scales,
      ...props.options.scales
    }
  };

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: props.data,
    options: mergedOptions
  });
};

const updateChart = () => {
  if (!chartInstance) return;

  chartInstance.data = props.data;
  chartInstance.update();
};

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

onMounted(() => {
  createChart();
});

onBeforeUnmount(() => {
  destroyChart();
});

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      updateChart();
    } else {
      createChart();
    }
  },
  { deep: true }
);

</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: v-bind('`${height}px`');
  position: relative;
}
</style>
