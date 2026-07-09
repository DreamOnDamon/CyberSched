根据参考图 image_4402e7.jpg 的排布结构，我们将原有的自由时间块布局调整为“数字化活页本”式结构，保留像素赛博朋克的核心视觉，同时引入复古绿色矩阵色调、左侧纵向时间分段（上下午等）控制轴、以及右侧的“任务完成状态（Checklist）”机制。以下是为您全新改写的 Web 应用技术规格说明（Spec）文档：Markdown---
app_name: "CyberSchedule_Matrix"
version: "1.1.0"
spec_type: "technical_specification"
target_environment: ["web_browser"]
app_architecture: "SPA / PWA"
core_stack: ["react/vue", "indexeddb", "html2canvas+jspdf"]
layout_reference: "image_4402e7.jpg"
---

# CyberSchedule_Matrix - Technical Specification

## 1. Updated Data Schemas (Entities)

为了完美适配 `image_4402e7.jpg` 中的三栏式表格与完成情况打卡功能，对 `ScheduleItem` 实体进行结构扩充，新增了时间分段（Period）与完成状态（Completed）字段。

```json
{
  "ScheduleItem": {
    "id": "string (UUID)",
    "date": "string (YYYY-MM-DD)",
    "period": "enum [MORNING, NOON, AFTERNOON, NIGHT]",
    "time_range": "string (e.g., '08:00-08:30')",
    "title": "string (事項)",
    "completed": "boolean (完成情況)",
    "tag": "enum [STUDY, ENTERTAINMENT, REST, EXERCISE]"
  }
}
2. UI Layout & Component Architecture整体界面布局严格映射 image_4402e7.jpg 的三栏活页设计，并进行像素赛博朋克化重构。+-----------------------------------------------------------------------+
|  [Mascot: Pixel Pointed-Color Cat]      CYBER SUMMER MATRIX (Header)  |
+-----------------------------------------------------------------------+
| (Digital Binder Loops) | [时间/Time]   | [事项/Mission] | [状态/Status] |
|                        |--------------+---------------+---------------|
|    AM_CYCLE (上午)     | 08:00-08:30  | 起床洗漱       | [ X ] Neon    |
|                        | 08:30-09:00  | 吃早餐         | [   ] Empty   |
| ---------------------- |--------------+---------------+---------------|
|    NOON_PHASE (中午)   | 12:00-12:30  | 吃晚餐         | [ X ] Neon    |
+-----------------------------------------------------------------------+
2.1 UI Component breakdownHeader Zone (顶部状态栏)：中央区域： 像素艺术风格的“暑假计划表 / SUMMER MATRIX”动态发光霓虹艺术字。左上角挂件： 引入一个像素风格的重点色/重点色花纹猫咪（Pointed-color Cat）交互式微章作为 UI 吉祥物，点击可触发复古 8-bit 喵呜声效并随机切换状态（如“在线/休眠”）。Left-side Timeline Binder (左侧纵向控制轴)：参考 image_4402e7.jpg 的活页环设计，使用 CSS 像素阴影渲染出“数字机械活页环”视觉。将一天划分为四个主区块（AM_CYCLE 上午、NOON_PHASE 中午、PM_CYCLE 下午、NIGHT_CYCLE 晚上），纵向跨行居中排列。Main Schedule Matrix Grid (中央三栏数据表)：采用标准 3-Column 栅格布局：Column 1 (时间)： 固定宽度，像素字体展示 time_range。支持点击直接原位编辑文本或弹出像素刻度盘选择器。Column 2 (事项)： 弹性宽度，支持双击编辑。当 completed 为 true 时，文字自动叠加低饱和度暗色及像素删除线。Column 3 (完成情况)： 居中对齐。默认显示为空白像素方框，点击后触发粒子扩散特效并渲染出一个霓虹粉/荧光绿色的像素对勾（$\checkmark$）。3. Design Tokens (Interface Style Update)视觉风格由纯暗黑赛博转为赛博矩阵复古绿（Cyber-Mint Matrix），完美融合参考图的绿色基调与原定像素赛博朋克风。YAMLdesign_tokens:
  colors:
    background_main: "#121814"      # 极深矩阵绿黑（替代原纯黑）
    sheet_background: "#E2F0D9"     # 活页纸张底色（参考图淡绿色的高亮像素化像素版本，可一键切为暗黑版）
    text_primary: "#2A3B2E"         # 复古终端暗绿字
    accent_neon_green: "#00FF66"    # 荧光矩阵绿（用于边框激活、对勾、高亮）
    accent_cyber_pink: "#FF007F"    # 赛博粉红（用于警告或重点标记）
    binder_rings: "#7F8C8D"         # 金属活页环灰
  typography:
    family: ["Zpix", "Fusion Pixel", "Courier New", "monospace"]
    rendering: "pixelated"
  borders:
    pixel_solid: "3px solid #2A3B2E"
    pixel_box_shadow: "3px 3px 0px #000000"
4. Modified Core Workflows4.1 Grid Data Synchronization & Interactive Check当用户点击 Column 3 的完成框时，执行 Service.toggleComplete(id)。状态变更立即写入前端绑定的本地缓存状态机，且无需刷新页面直接通过 CSS 类名切换实现任务行“灰度化/降噪”。4.2 Layout-Preserved PDF Export Engine (一键导出周报)A4比例自适应： 导出引擎在执行 Service.exportToPDF() 时，需将当前的 3 栏式活页夹布局自动拉伸或等比缩放到标准 A4 纵向（Portrait）版面。按星期归组导出： 导出时会在 PDF 内部生成 7 个并排或连续的活页页面（周一至周日），每个页面的顶部左侧均保留该像素重点色猫咪头像 与活页机械环样式，完美达成从屏幕到纸张的视觉统一。打印主题过滤： 若选择 print_grayscale 主题，背景 sheet_background 自动强制转换为 #FFFFFF（纯白），所有霓虹色线框变更为 1px 黑色像素点阵线，确保省墨清晰。