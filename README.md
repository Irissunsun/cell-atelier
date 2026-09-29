# Cell Atelier · 细胞标本室

面向高中生物学习的交互式 3D 细胞标本。Blender 程序化建模，Three.js 网页展示；可旋转、缩放、点选结构并查看中文笔记。

![植物细胞 Blender 渲染预览](docs/images/plant-cell-detailed.png)

## 功能

- 七类标本：动物细胞、植物叶肉细胞、蓝细菌、中性粒细胞、有髓神经元、哺乳动物成熟红细胞、人类精子。
- 点击结构名称或模型，查看结构与功能；支持轮廓高亮、自动旋转、隐藏细胞膜、单独查看和重置。
- 植物细胞支持整体、剖面、透明三种观察方式及可点击结构标签。完整外壳由 Blender 导出。
- 原核与真核结构对照表，支持跳转到对应标本。
- 下载 GLB 模型、保存模型截图。截图包含 WebGL 模型，HTML 标签不包含在截图中。

## 本地运行

需要 Node.js 20.19+ 或 22.12+；使用支持 WebGL 的现代浏览器。

```bash
npm ci
npm run dev -- --port 5188
```

打开 http://127.0.0.1:5188/ 。地址仅适用于运行服务的电脑。

```bash
npm test
npm run build
npm run preview
```

构建结果位于 `dist/`。目前资源使用以 `/` 开头的地址，部署时应放在域名根路径；GitHub Pages 的仓库子路径需要另外调整资源路径。

## 模型与建模脚本

仓库包含可编辑 `.blend`、网页 `.glb` 和生成脚本。已导出的模型可直接用于网页，运行网站不需要安装 Blender。

| 标本 | 当前构建脚本 |
| --- | --- |
| 动物细胞 | `build_animal_detailed.py` |
| 植物叶肉细胞 | `build_plant_detailed.py` |
| 植物完整外壳 | `build_plant_shells.py` |
| 蓝细菌 | `build_cyanobacterium.py` |
| 中性粒细胞、神经元 | `build_variants.py` |
| 成熟红细胞 | `build_red_blood_cell.py` |
| 精子 | `build_sperm_cell.py` |

脚本在 Blender 5.2.1 中生成并验证。请在独立后台进程运行，例如：

```bash
blender --background --factory-startup --python build_plant_detailed.py
blender --background --factory-startup --python build_plant_shells.py
blender --background --factory-startup --python render_thumbnails.py
```

macOS 的 Blender 可执行文件通常在 `/Applications/Blender.app/Contents/MacOS/Blender`。

`build_cell.py` 提供原始动物细胞与其他脚本复用的几何工具。`build_variants.py` 同时生成植物、中性粒细胞和神经元，会覆盖这三类模型；批量重建后应再运行 `build_plant_detailed.py` 恢复当前精修植物版本。脚本会清空运行进程的场景，勿在有未保存工作的 Blender 窗口内直接执行。

## 教学范围

模型是艺术化、简化的教学示意，颜色和比例并非真实；尚未完成生物学专业审核。剖切开口用于观察内部，不代表天然开口。

- 植物标本为成熟叶肉细胞，不能将其叶绿体特征推广到所有植物细胞。
- 白细胞标本为中性粒细胞，不代表所有白细胞形态。
- 红细胞为哺乳动物成熟红细胞，不能将其无核特征推广到所有动物细胞。
- 蓝细菌有光合膜而没有叶绿体。没有叶绿体不等于不能光合作用。
- 部分细胞器省略或放大。各标本右侧笔记说明具体展示范围。

## 项目结构

- `src.js`：模型加载、结构选择与交互状态。
- `specimens.js`：标本配置与教学文字。
- `focus-view.js`：选中轮廓、引线与镜头。
- `view-labels.js`：植物细胞标签。
- `public/`：GLB 模型和 Blender 渲染缩略图。
- `tests/`：资产分组、外壳闭合性与部分教学表述检查。

## 许可与贡献

代码、建模脚本及本仓库生成的模型和渲染图使用 [MIT License](LICENSE)。第三方依赖的许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。页面通过 Google Fonts 加载字体；字体不可访问时使用系统字体。

欢迎通过 Issue 提出教学内容纠错、模型改进或交互问题。修改模型后请保留 `organelle` 分组，并运行测试与构建。新加入的第三方资产请说明来源和授权。
