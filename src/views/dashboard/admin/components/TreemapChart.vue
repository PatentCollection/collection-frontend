<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>
  
  <script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
import axios from "axios";
const animationDuration = 3000;

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "600px",
    },
  },
  data() {
    return {
      chart: null,
      backendData: null,
    };
  },
  computed: {
    chartData() {
      if (!this.backendData) return [];
      const totalCounts = this.backendData.total_counts;
      const labels = {
        A: "人类生活必需",
        B: "作业；运输",
        C: "化学；冶金",
        D: "纺织；造纸",
        E: "固定建筑物",
        F: "机械工程；照明；加热；武器；爆破",
        G: "物理",
        H: "电",
      };
      const data = Object.keys(totalCounts).map((key) => ({
        name: labels[key] || key,
        value: totalCounts[key],
      }));
      return data;
    },
    percentages() {
      if (!this.backendData) return {};
      const labels = {
        A: "人类生活必需",
        B: "作业；运输",
        C: "化学；冶金",
        D: "纺织；造纸",
        E: "固定建筑物",
        F: "机械工程；照明；加热；武器；爆破",
        G: "物理",
        H: "电",
      };
      const percentages = this.backendData.percentages;
      const newPercentages = {};
      for (const key in percentages) {
        newPercentages[labels[key] || key] = percentages[key];
      }
      return newPercentages;
    },
  },
  mounted() {
    this.fetchData();
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    fetchData() {
      axios
        .get("/api/dashboard/IPC_treemap_data")
        .then((response) => {
          this.backendData = response.data;
          this.$nextTick(() => {
            this.initChart();
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    },
    initChart() {
      if (!this.backendData) return;

      this.chart = echarts.init(this.$el, "macarons");

      this.chart.setOption({
        title: {
          text: "本专利所属技术领域（IPC）占比图",
          left: "center",
          top: "top",
          textStyle: {
            fontSize: 30,
            fontWeight: "bold",
            color: "#000",
          },
        },
        tooltip: {
          trigger: "item",
          formatter: (params) => {
            const percent = this.percentages[params.name];
            return `${params.name}: ${params.value} (${percent})`;
          },
        },
        series: [
          {
            type: "treemap",
            roam: false, // 禁止拖拽和缩放
            zoomToNodeRatio: 1, // 禁止通过点击节点放大
            data: this.chartData,
            label: {
              show: true,
              formatter: (params) => {
                const percent = this.percentages[params.name];
                return `${params.name}: ${params.value}\n(${percent})`;
              },
              position: "inside",
            },
            breadcrumb: {
              show: false,
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 1,
            },
            nodeClick: false, // 禁用节点点击
          },
        ],
        animationDuration: animationDuration,
      });
    },
  },
};
</script>