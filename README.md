# 三国演义本体论 (Romance-of-the-Three-Kingdoms Ontology)

基于OWL本体构建的《三国演义》知识图谱与纯前端可视化阅读平台，参考叶锦磊四大名著本体论项目架构开发。

## 项目特性
- 📚 双版本阅读（毛宗岗评本120回、周曰校刊本192章，待完善）
- 🧑‍🤝‍🧑 人物、势力、地理、战役、事件、计谋、器物、谶纬、诗词九大类实体知识库
- 🔍 浏览器端SQL查询，无需后端服务
- 🕸️ 人物关系力导向图可视化
- 🗺️ 三国舆地示意图
- 📊 实体数据统计可视化
- 📝 版本异文LCS逐字比对
- ⚖️ 演义与正史虚实对照

## 技术栈
- HTML + Tailwind CSS + Vanilla JS
- DuckDB-WASM 浏览器端数据库
- ECharts 可视化
- OWL 2 DL 本体（Turtle格式）
- 纯静态站点，可直接部署到GitHub Pages

## 文件结构
```
├── index.html              # 站点首页
├── sanguo-ontology.ttl     # OWL本体规范文件（可导入Protégé等工具）
└── README.md               # 项目说明
```

## 本地运行
直接用浏览器打开 `index.html` 即可，首次加载需联网获取公共CDN资源。

## License
MIT
