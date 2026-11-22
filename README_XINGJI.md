# 行迹 · 本机预览（基于江山时序）

本仓库为开源项目 [江山时序（DeanChensj/jiangshan-map）](https://github.com/DeanChensj/jiangshan-map) 的 **GitHub Fork 第三方衍生**，项目名「行迹」。**不是** [江山时序官方站点](https://deanchen.me/jiangshan-map/)。

- 上游地图引擎与宣纸二维舆图：GPL-3.0，须保留署名与 CHGIS / 示意疆域说明。
- 本衍生在 Fork 上增加 PRD 1.6 人物的节点标题、拐点停顿、「星火燎原」毛泽东公开行迹包等能力。

## 本地预览（Docker + Nginx）

```bash
docker compose up -d --build
```

浏览器打开：**http://127.0.0.1:8088**

毛泽东行迹直达：**http://127.0.0.1:8088/?person=maozedong**

技术样例（苏轼，不得回归）：**http://127.0.0.1:8088/?person=sushi**

停止：

```bash
docker compose down
```

说明：

- 默认映射主机 **8088**；同时保留 **8008** 以兼容旧说明。
- 仅静态 Nginx 服务，不依赖 n8n 或其他本机栈。
- 若 8088 被占用，可在 `docker-compose.yml` 中把 `8088:80` 改为其他主机端口。

## 交付内容（1.6 切片）

- 毛泽东「星火燎原」：12 段 / 25 拐点 / 52 节点，1893—1949，止于开国大典。
- 拐点自动停顿 + 阶段简述 +「继续往下」「重看这段」；无整屏黑遮罩。
- 播放头小红旗 + 朱砂示意弧线（图例见左下说明）。
- 数据来源：本地 `js/xingji/maozedong_journey.js`（由 `scripts/xingji/build_maozedong_pack.js` 生成）。

## PRD 1.7 必过（本分支）

- **品牌**：左上主标「行迹」；人物主标题为毛泽东「星火燎原」；页内可见「基于江山时序」「非官方」及上游 GitHub 链接（非仅 README）。
- **继续往下**：拐点面板收起后轨迹与红旗立即恢复播放。
- **人物–地图同步**：人物行迹模式下年代/疆域随所选人物跳转，不触发全局中国全史自动播放。
- 验收截图见 PR #1 附件：`brand_mao_epithet.png`、`inflection_before_continue.png`、`inflection_after_continue.png`、`mao_early_hunan.png`、`mao_late_1949.png`、`sushi_smoke.png`。

## 上游链接

请在页面与文档中保留指向上游的可见链接：<https://github.com/DeanChensj/jiangshan-map>