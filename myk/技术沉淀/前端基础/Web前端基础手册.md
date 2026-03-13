# Metainfo

* Title: Web前端基础手册
* Author: WY
* Data: 2025-03-13 周四
* Tags:
  * #读书笔记
  * #学习笔记
  * #前端开发

---

# Web前端基础手册

本文档整合了HTML、CSS、JavaScript前端基础知识点，涵盖从入门到实战的核心内容。

---

# 第一部分：HTML基础

## 1. HTML概念

### 简介
超文本标记语言，主要用于描述一个页面(创建网页)

### 思想
页面中有很多数据，不同的数据可能需要不同的显示效果，就可以使用标签把要操作的数据包裹起来，通过修改标签的属性值，来实现标签内数据样式的改变。

本质就是一个容器的思想：一个标签就相当于一个容器，想要修改标签内数据的样式，只需要修改容器的属性值，就可以实现。

### 特点
- 语法非常宽松（浏览器的纠错能力很强）
- 标签名不区分大小写（建议使用小写，符合最新的HTML5的规范）
- 标签名都是预定义好的，每个标签都有特定的含义（不同于后端的xml，xml语言标签可以自定义）

### 语法
- **标签**：由一对尖括号括起来的关键字组成，又称为元素，如果标签中没有元素，可以自闭合
- **属性**：为元素提供更多信息，可以改变元素的样式，以名称和值的形式出现
- **标签体**：开始标签和结束标签中间的所有内容，都叫做标签体，可以是一段普通文本，也可以包含其他标签
- **注释**：用于解释说明，给程序员看的，分为行注释和块注释
- **特殊字符**：空格 `&nbsp;`  大于号 `&gt;`  小于号 `&lt;`  版权 `&copy;`  人民币 `&yen;`

---

## 2. HTML常见标签

### 文档相关标签
```html
<html>                    <!-- 文档的根部 -->
  <head>                  <!-- 文档的头部 -->
    <meta></meta>         <!-- 文档的元数据 -->
    <title></title>       <!-- 文档的标题 -->
  </head>
  <body></body>           <!-- 文档的正文 -->
</html>
```

### 文本相关标签
- **字体标签**：font（size: 1-7, color: 颜色）
- **标题标签**：h1-h6
- **段落标签**：p

### 格式相关标签
- 水平线：hr
- 换行：br
- 粗体：b、strong
- 斜体：i、em
- 下划线：u
- 标记标签：mark

---

## 3. 列表相关标签

### 无序列表
```html
<ul type="disc|circle|square">
  <li>列表项</li>
</ul>
```
- `disc`：实心圆（默认）
- `circle`：空心圆
- `square`：实心方块

### 有序列表
```html
<ol type="1|a|A|i|I">
  <li>列表项</li>
</ol>
```
- `a`：小写英文字母编号
- `A`：大写英文字母编号
- `i`：小写罗马数字编号
- `I`：大写罗马数字编号
- `1`：数字编号（默认）

---

## 4. 标签分类

### 行级元素
- **特点**：默认不能独占一行，上一行有空间就在上一行显示，如果没有空间，才会另起一行
- **常见标签**：span、font、b、i、img、a、input
- **主要作用**：用于分割一行内容，或者存放少量数据

### 块级元素
- **特点**：默认独占一行，不管上一行有没有空间，直接另起一行显示
- **常见标签**：div、h1-h6、p、hr、ul、ol、header、footer
- **主要作用**：划分区域，设置页面布局（主流布局：div+css）

---

## 5. 图片媒体标签

### 图片标签 img
```html
<img src="图片路径" width="宽度" height="高度" alt="加载失败提示" title="悬停提示">
```

**路径说明**：
- `./图片目录/图片名`：相对于当前html文件的路径
- `../图片名`：相对于当前html文件所在目录的上一级目录

### 音频标签 audio
```html
<audio src="音频路径" controls autoplay loop></audio>
```
- `src`：音频文件的路径
- `controls`：显示控制栏
- `autoplay`：自动播放
- `loop`：循环播放

### 视频标签 video
```html
<video src="视频路径" controls autoplay muted></video>
```
- `controls`：显示视频控件
- `autoplay`：自动播放
- `muted`：静音（自动播放需要配合此属性）

---

## 6. 链接相关标签

```html
<a href="url链接" target="打开方式">链接文本</a>
```

**链接分类**：
- 站外链接：链接到外部网站
- 站内链接：链接到站内其他页面
- 锚链接：链接到页面内指定位置

---

## 7. 布局相关标签（语义化标签）

HTML5提供了新的语义元素来明确一个web页面的不同部分：

| 标签 | 作用 |
|------|------|
| `<header>` | 文档的头部区域 |
| `<main>` | 文档的主体区域 |
| `<footer>` | 文档的底部区域 |
| `<aside>` | 页面主区域内容之外的内容（如侧边栏） |
| `<section>` | 文档中的节（section、区段） |
| `<article>` | 独立的内容 |
| `<nav>` | 导航栏 |

---

## 8. 表单相关标签

### form 表单标签
```html
<form action="提交地址" method="get|post">
  <!-- 表单元素 -->
</form>
```
- `action`：设置表单提交的地址，默认提交到当前页面
- `method`：设置表单提交方式
  - `get`：将表单数据附加到URL中，相对不安全，只能提交少量数据
  - `post`：将表单数据附加到HTTP请求的body内，相对安全，可以提交大量数据

### input 输入项标签
```html
<input type="类型" name="名称" value="值">
```

**type属性取值**：
- `text`：文本框
- `password`：密码框
- `radio`：单选框
- `checkbox`：复选框
- `file`：文件
- `submit`：提交按钮
- `reset`：重置按钮
- `button`：普通按钮

### 其他表单元素
```html
<!-- 下拉选择框 -->
<select name="名称">
  <option value="值" selected>选项</option>
</select>

<!-- 文本域 -->
<textarea name="名称" rows="行数" cols="列数"></textarea>

<!-- label标签 -->
<label for="input的id">标签文本</label>
```

### 通用属性
- `name`：规定input元素的名称，只有设置了name属性，才能将表单提交到后台
- `value`：设置表单元素的值
- `checked`：设置单选和复选框的默认选中（布尔属性）
- `selected`：设置下拉选择框的默认选项（布尔属性）
- `required`：规定必须在提交表单前填写输入字段（布尔属性）

---

## 9. 表格标签

```html
<table border="1" width="宽度" height="高度" align="对齐方式">
  <thead>
    <tr>
      <th>表头</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="跨列数" rowspan="跨行数">单元格</td>
    </tr>
  </tbody>
</table>
```

**表格属性**：
- `border`：定义边框
- `width`/`height`：宽高
- `align`：表格相对周围元素的对齐方式
- `cellpadding`：单元边沿与其内容之间的空白
- `cellspacing`：单元格之间的空白

---

# 第二部分：CSS基础

## 1. CSS概念及入门

### 简介
层叠样式表，用于设置样式，布局控制（主流的布局方式：div+css）

### 组成
- **选择器**：用于选择页面中的元素，进行样式的控制
- **属性**：用于设置样式，布局控制

### CSS和HTML属性控制样式的区别
1. CSS控制样式更加的专业，可以实现html属性实现不了的效果
2. 可以实现标签和样式的分离，提高样式的重用性，提高开发效率

---

## 2. CSS引入方式

### 行内样式
```html
<div style="color: red;">内容</div>
```
- **特点**：简单，耦合性强，不利于代码和样式的分离，没有复用性

### 内部样式
```html
<style>
  .className { color: red; }
</style>
```
- **特点**：实现了html代码和样式的分离，只能在当前页面进行复用

### 外部样式
```html
<link rel="stylesheet" href="style.css">
```
- **特点**：实现了html代码和样式的分离，可以在多个页面进行复用，可以统一网站的风格

### 三种引入优先级
行内样式优先级最高，内部样式和外部样式优先级一样，谁最后解析，显示谁。

---

## 3. CSS选择器

### 基本选择器

| 选择器 | 语法 | 说明 |
|--------|------|------|
| ID选择器 | `#id名` | 选择页面中唯一的一个元素 |
| 类选择器 | `.类名` | 选择页面中的一批元素 |
| 元素选择器 | `标签名` | 选择页面中的一批元素 |

**基本选择器优先级**：行内样式 > id选择器 > 类选择器 > 元素选择器

### 扩展选择器

| 选择器 | 语法 | 作用 |
|--------|------|------|
| 并集选择器 | `选择器a,选择器b` | 一次性选择多个选择器 |
| 交集选择器 | `选择器a选择器b` | 选择同时满足多个条件的元素 |
| 后代选择器 | `选择器a 选择器b` | 选择某元素的后代元素 |
| 子代选择器 | `选择器a>选择器b` | 选择某元素的子代元素 |
| 相邻兄弟选择器 | `选择器a+选择器b` | 选择某元素相邻的元素 |
| 属性选择器 | `[属性名=属性值]` | 通过属性选择元素 |

### 伪类选择器
```css
a:link {color:#FF0000;}      /* 未访问的链接 */
a:visited {color:#00FF00;}   /* 已访问的链接 */
a:hover {color:#FF00FF;}     /* 鼠标划过链接 */
a:active {color:#0000FF;}    /* 已选中的链接 */
```

### 伪类结构选择器
```css
:first-child   /* 选择第一个 */
:last-child    /* 选择最后一个 */
:nth-child(n)  /* 选择第n个元素（不考虑元素类型） */
:nth-of-type(n) /* 选择同类型中的第n个同级兄弟元素 */
```

**n的取值**：
- 数字：从1开始，代表第n个元素
- 关键字：`odd`奇数、`even`偶数
- 公式：`2n+1`奇数、`2n`偶数、`-n+3`前三个、`n+4`第4个以后

---

## 4. CSS常见属性

### 尺寸属性
```css
width: 宽度;
height: 高度;
```

### 字体属性
```css
/* 分开写 */
font-style: 字体样式;
font-weight: 字体粗细;
font-size: 字体尺寸;
font-family: 字体系列;

/* 连写 */
font: font-style font-weight font-size/line-height font-family;
```

### 文本属性
```css
color: 文本颜色;
text-align: 文本对齐方式;
line-height: 行高;
text-indent: 首行缩进;
text-decoration: 文本装饰线;
```

**line-height的作用**：
1. 设置行高
2. 设置单行文本垂直居中

### 背景属性
```css
/* 分开写 */
background-color: 背景颜色;
background-image: 背景图片;
background-position: 背景位置;
background-size: 背景尺寸;
background-repeat: 背景重复度;

/* 连写 */
background: color image position/size repeat;
```

**颜色取值方式**：
- 关键字：`red`、`blue`
- 三原色：`rgb(255, 0, 0)`
- 带透明度：`rgba(0, 255, 0, 0.5)`
- 十六进制：`#ff0000` 或 `#f00`

### 精灵图
将项目中用到的多张小图，合成一张大图。

**使用步骤**：
1. 创建一个div盒子
2. 设置盒子的大小为要展示图标的大小
3. 设置精灵图作为盒子的背景图片
4. 获取要展示的图标在精灵图上的坐标，取负值，设置到`background-position`中

---

## 5. CSS三大特性

### 层叠性
对于同一个元素，可以设置多个样式，这些样式都会叠加到他上面。相同的样式会被覆盖，不同的样式会叠加。

### 继承性
子元素可以继承父元素的相关属性，可以在一定程度上减少代码。

**应用**：
1. 给body设置font属性，可以统一页面的默认字体样式
2. 给ul设置`list-style:none`，可以去掉无序列表前面的小圆点

### 优先级
不同的选择器具有不同的优先级，优先级高的选择器会覆盖优先级低的选择器。

**规律**：继承 < 元素选择器 < 类选择器 < id选择器 < 行内样式 < !important

**注意**：
1. `!important`写在属性值的后面，分号的前面
2. `!important`不能提高继承的优先级，只要是继承，优先级是最低的
3. 实际开发中，很少使用`!important`

---

## 6. 盒子模型

### 概念
在CSS中，万物皆盒子，就是把页面中所有的元素都抽象成一个盒子，盒子就有空间，就可以对它精准布局。

### 组成
- **边框**：border
- **内边距**：padding，设置盒子边框和内容之间的距离
- **外边距**：margin，设置盒子与盒子之间的距离

### 行盒和块盒

| 类型 | 特点 |
|------|------|
| 行盒 | 行级元素对应的盒子，默认不能独占一行，宽高由内容决定 |
| 块盒 | 块级元素对应的盒子，默认独占一行，可以设置宽高 |

**互转**：
```css
display: block;        /* 行级 → 块级 */
display: inline;       /* 块级 → 行级 */
display: inline-block; /* 行内块，可设置宽高且在一行显示 */
```

### 边框
```css
/* 分开写 */
border-width: 宽度;
border-style: 样式;
border-color: 颜色;

/* 连写 */
border: width style color;

/* 单一方向 */
border-top/left/right/bottom: width style color;

/* 圆角 */
border-radius: 圆角值;
```

### 内边距
```css
padding: 上 右 下 左;  /* 1-4值，顺时针 */
padding-top/left/right/bottom: 值;  /* 单一方向 */
```

### 盒子尺寸问题
设置边框和内边距都会撑大盒子。

**解决方案**：添加`box-sizing: border-box;`，浏览器会根据边框和内边距的值，自动在内容区域减去。

### 外边距
```css
margin: 上 右 下 左;  /* 1-4值，顺时针 */
margin-top/left/right/bottom: 值;  /* 单一方向 */
```

**清除默认样式**：
```css
* {
  margin: 0;
  padding: 0;
}
```

### 外边距情况分析

| 情况 | 结论 |
|------|------|
| 水平排布两个盒子 | 最终间距为左右外边距之和 |
| 垂直排布两个盒子 | 最终间距为上下外边距中的较大值（合并） |
| 嵌套的块级元素 | 子元素的margin-top会作用在父元素上（塌陷） |

**塌陷解决方案**：不设置子元素的外边距，改为设置父元素的上内边距，并加上自动内减属性。

---

## 7. 布局方式

### 标准流
浏览器默认采用的排版规则：
- 块级元素：从上往下，垂直排布，独占一行
- 行级元素：从左往右，水平排布，不能独占一行

### 浮动布局
一种布局方式，可以让元素漂浮起来，从而实现块元素水平排布。

```css
float: left | right | none;
```

**特点**：
1. 浮动元素会脱标（脱离标准流），在标准流中不占位置
2. 浮动元素比标准流级别高，可以覆盖标准流中的元素
3. 下一个浮动元素会在上一个浮动元素的后面进行左右浮动
4. 浮动元素会受上面元素边界的影响
5. 对于行级元素，设置浮动之后，可以设置宽高

**清除浮动**：
- 子元素浮动之后，会脱标，就不能撑起标准流中父元素的高度

**解决方式**：
1. 直接给父元素设置高度
2. 额外标签法：在父元素内容最后添加一个块元素，设置`clear: both`
3. 单伪元素清除法：使用伪元素替代额外标签
4. 双伪元素清除法：添加前后两个伪元素

### 定位布局
可以让子元素自由摆放在页面中的任意位置（叠加效果）。

```css
position: relative | absolute | fixed | sticky;
top/right/bottom/left: 偏移值;
```

| 定位类型 | 参照原点 | 是否脱标 |
|----------|----------|----------|
| 相对定位 relative | 它之前在标准流的位置 | 否 |
| 绝对定位 absolute | 最近有定位的祖先元素，没有则参照浏览器 | 是 |
| 固定定位 fixed | 浏览器 | 是 |
| 粘性定位 sticky | 相对定位和固定定位的结合 | 否 |

**子绝父相**：一种常用的布局技巧，子元素是绝对定位，父元素是相对定位，可以让子元素相对于父元素进行自由移动。

**层级关系**：
- 标准流 < 浮动 < 定位
- 不同定位之间的层级相同，写在最下面的元素层级最高
- 使用`z-index`属性修改元素的优先级（值越大，优先级越高）

---

## 8. 伪元素

伪元素是在html骨架中，并没有通过html标签去创建元素，而是通过CSS模拟出来的标签效果。

```css
::before { content: ""; }  /* 在父元素位置的最前面添加 */
::after { content: ""; }   /* 在父元素位置的最后面添加 */
```

**注意**：
1. 必须要设置content属性才能生效
2. 伪元素默认是行级元素

---

## 9. CSS其他属性

### vertical-align
设置元素的垂直对齐方式。

```css
vertical-align: baseline | middle | bottom | top | 像素值;
```

**应用**：
- 图片和文字底部对齐
- img撑开div高度时，底部有间隙
- img在div垂直居中

### overflow
控制溢出部分的显示效果。

```css
overflow: visible | hidden | scroll | auto;
```

| 值 | 说明 |
|----|------|
| visible | 默认值，内容不会被修剪 |
| hidden | 内容会被修剪，其余内容不可见 |
| scroll | 显示滚动条 |
| auto | 内容被修剪时显示滚动条 |

### object-fit
指定元素的内容应该如何去适应指定容器的高度与宽度。

```css
object-fit: fill | contain | cover | none;
```

---

## 10. CSS新特性

### 过渡
让元素的样式慢慢发生改变，通常跟hover一起配合使用。

```css
transition: 属性名 过渡持续时长;
```

### 位移
```css
transform: translateX() | translateY() | translate(x, y);
```
取值可以是像素值或百分比（相对于自身）。

### 旋转
```css
transform: rotate(角度);  /* 2D旋转 */
transform: skewY(角度);   /* 沿Y轴倾斜旋转 */
transform-origin: 旋转原点;
```
正数顺时针，负数逆时针。

### 渐变
```css
background-image: linear-gradient(颜色列表);
```

### 动画
```css
/* 定义动画 */
@keyframes 动画名称 {
  from { 动画开始状态 }
  to { 动画完成状态 }
}

/* 使用动画 */
animation: 动画名称 动画时长;
```

**复合属性**：`animation: name duration timing-function delay iteration-count;`

---

## 11. Flex布局

### 简介
一种弹性的布局方式，使用它布局页面更加的简单灵活，避免了浮动脱标的影响。

**与浮动区别**：
1. 浮动子元素脱标会导致父元素没有高度，而flex不会
2. 浮动的属性写在子元素上，flex属性是写在父元素上

### 组成
- **弹性容器**：父元素，也称为flex容器
- **弹性盒子**：子元素，也称为flex子项/弹性元素
- **主轴**：默认在水平方向，也称为横轴
- **侧轴**：默认在垂直方向，也称为纵轴/交叉轴

### 主轴对齐方式
```css
justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
```

### 侧轴对齐方式
```css
align-items: stretch | flex-start | center | flex-end;
align-self: 值;  /* 单独设置某一个元素 */
```

### 子项尺寸特点
如果给了宽高，就按给的走；如果没给，就按内容走；如果有拉伸，就会拉伸跟父类一样高。

### 子项空间动态分配
```css
flex: 数值;  /* 代表占父级剩余尺寸的份数 */
```

### 子元素换行显示
```css
flex-wrap: wrap;
```

### 换行之后行的显示方式
```css
align-content: stretch | center | flex-start | flex-end | space-between | space-around | space-evenly;
```

### 修改轴向
```css
flex-direction: row | row-reverse | column | column-reverse;
```

### flex复合属性
```css
flex: flex-grow flex-shrink flex-basis;
```

| 取值 | 等同于 |
|------|--------|
| none | flex: 0 0 auto |
| auto | flex: 1 1 auto |
| 非负数字 | flex: 数字 1 0% |
| 像素值 | flex: 1 1 像素值 |

---

## 12. Grid布局

### 简介
网格是一组相交的水平线和垂直线，它定义了网格的列和行。

### 组成
- **网格行**：网格元素的水平线方向
- **网格列**：网格元素的垂直线方向
- **网格间距**：两个网格单元之间的间距
- **网格线**：列与列，行与行之间的交接处

### 使用
```css
display: grid;
grid-template-columns: 列宽列表;
grid-template-rows: 行高列表;
grid-gap: 行间距 列间距;
```

**fr单位**：一个fr单位代表网格容器中可用空间的一等份。

### 网格跨行跨列
```css
grid-column: start / end;  /* 跨列 */
grid-row: start / end;     /* 跨行 */
```

---

## 13. 媒体查询

针对不同的媒体类型设置不同的样式规则。

```css
/* 从大屏幕到小屏幕适配 */
@media (max-width: 像素值) {
  /* 当前像素下的样式 */
}

/* 从小屏幕到大屏幕适配 */
@media (min-width: 像素值) {
  /* 当前像素下的样式 */
}
```

---

## 14. 字体图标

### iconfont
阿里巴巴提供的字体库，用于展示图标。

**使用步骤**：
1. 将下载好的字体包拖到项目中
2. 引入字体包中的css样式
3. 挑选类名来展示图标

### font-awesome
在线字体库，不需要下载字体包。

**使用步骤**：
1. 将font-awesome拖到项目中
2. 引入包中的css样式
3. 在网站中查找对应的图标

---

## 15. CSS书写顺序

### 顺序的重要性
1. 如果顺序不对，有可能会影响页面布局
2. 方便程序员维护

### 一般顺序
1. 布局属性：display、float、position
2. 尺寸+背景+盒子模型：width、height、background、margin、padding、border
3. 文本内容属性：color、font、text-align、line-height
4. 点缀属性：border-radius、box-shadow、cursor

### 选择器使用
推荐使用类+后代，一般选择器层级不要超过3个。

### em和rem区别
- **em**：相对长度，默认相对于浏览器的默认字体尺寸，会继承父级元素的字体大小
- **rem**：相对长度，相对于根元素html里面的字体尺寸，不会继承父级的尺寸大小

---

# 第三部分：JavaScript基础

## 1. JS概念及入门

### 概念
一种运行在客户端的脚本语言（也可以运行在服务端，比如Node.js）。

### 特点
不同于其他语言（C语言、Java，它们是编译执行），JS是解释执行（读一行执行一行）。

### 作用
- 动态的控制页面元素的样式
- 表单校验
- 页面特效（轮播图）
- 控制页面元素（DOM操作）
- 服务端开发（Node.js实现后端服务器开发）

### 组成
- **ECMAScript**：基础语法（数据类型、变量、运算符、流程控制、面向对象、内置对象）
- **DOM**：文档对象模型，实现对html文档的操作
- **BOM**：浏览器对象模型，实现弹框、窗口打开关闭、定时器效果

### 引入方式
1. **内嵌式**：在html页面创建一个script标签，书写js代码
2. **外链式**：新建一个js文件，在页面使用script标签引入

### 注释
- 单行注释：`//`
- 多行注释：`/* */`

### 输入输出
```javascript
// 输出
alert();           // 弹框输出
console.log();     // 控制台输出
document.write();  // 页面输出

// 输入
var 变量名 = prompt(提示信息);
```

---

## 2. 变量

### 概念
本质就是内存中存取数据的那块空间（容器）。

### 使用
```javascript
// 方式一：先声明再赋值
var age;
age = 20;

// 方式二：声明的同时并赋值
var age = 20;
```

### 命名规则
- 必须以字母开头
- 也能以 `$` 和 `_` 符号开头（不推荐）
- 变量名称对大小写敏感
- 不能是关键字或保留字
- 尽量见名知意

---

## 3. 数据类型

### 分类
**值类型（基本类型）**：
- String（字符串）
- Number（数字）
- Boolean（布尔）
- Null（空）
- Undefined（未定义）

**引用数据类型（对象类型）**：
- Object（对象）
- Array（数组）
- Function（函数）
- RegExp（正则）
- Date（日期）

### 类型转换
**强制转换**：
```javascript
String();   // 转字符串
Number();   // 转数字
Boolean();  // 转布尔
```

**自动转换（隐式转换）**：
- 任意类型的数据+字符串，执行的是字符串的拼接
- true、false、null跟数字进行运算时，都会被转成数值
- 如果+两端有一端是字符串，就会执行字符串的拼接
- 如果+两端都不是字符串，就会默认使用Number()进行转换

---

## 4. 运算符

### 算术运算符
`+` `-` `*` `/` `%`

### 自增自减运算符
```javascript
变量++  // ++在后，先运算再自增
++变量  // ++在前，先自增再运算
```

### 比较运算符
`>` `<` `>=` `<=` `==` `!=` `===`

结果是boolean类型。

### 逻辑运算符
`&&` `||` `!`

结果是boolean类型。

### 赋值运算符
`=` `+=` `-=` `*=` `/=` `%=`

### 三元运算符
```javascript
表达式/变量a ? 表达式/变量b : 表达式/变量c
```

---

## 5. 流程控制

### 顺序结构
从上往下，依次执行。

### 选择结构

#### if语句
```javascript
if (条件表达式) {
  语句体
}
```

#### if-else语句
```javascript
if (条件表达式) {
  语句体1
} else {
  语句体2
}
```

#### if-else-if语句
```javascript
if (条件表达式1) {
  语句体1
} else if (条件表达式2) {
  语句体2
} else {
  语句体n
}
```

#### switch语句
```javascript
switch (表达式/变量) {
  case 值1:
    执行代码块1
    break;
  case 值2:
    执行代码块2
    break;
  default:
    默认执行代码
    break;
}
```

**选择语句区别**：
- if语句主要用于范围的判断
- switch主要用于等值判断
- if-else-if和switch的结构非常类似，所有的switch语句都可以使用if-else-if改写

### 循环结构

#### for循环
```javascript
for (初始化语句; 条件控制语句; 循环增量语句) {
  循环体语句
}
```

#### while循环
```javascript
初始化语句;
while (条件控制语句) {
  循环体语句;
  循环增量语句;
}
```

#### do-while循环
```javascript
初始化语句;
do {
  循环体语句;
  循环增量语句;
} while (条件控制语句);
```

### 循环区别
- for和while：每次都是先判断循环条件，再执行循环体
- do-while：先执行循环体，再判断循环条件（不管条件成立与否，都会先执行一次）

### 循环关键字
- `break`：跳出循环，结束当前循环
- `continue`：跳过本次循环，继续下一次循环

---

## 6. 数组

### 概念
本质就是一个存储数据的容器，方便管理数据。

### 定义和初始化
```javascript
var arr1 = new Array();
arr1[0] = '张三';

var arr2 = new Array('张三', '李四');

var arr3 = ['张三', '李四'];
```

### 操作
```javascript
// 增
arr[新的索引] = 值;

// 删
delete arr[要删除元素的索引];

// 改
arr[要修改元素的索引] = 新值;

// 查
arr[索引];
arr.length;
```

### 二维数组
本质也是一个数组，里面每一个元素都是一维数组。

```javascript
var arr = [[100, 90, 96], [88, 99, 68], [92, 55, 98]];
arr[1];      // 取出里面的一维数组
arr[1][1];   // 取出里面的一维数组的元素
```

---

## 7. 函数

### 概念
封装了一段具有特定功能的代码块。

### 格式
```javascript
// 定义
function 函数名(参数列表) {
  函数体;
  return 返回值;
}

// 调用
函数名(实际参数);
```

### 参数
就相当于一个媒介，调用者可以通过它将要操作的数据传递到函数内部进行操作。

### 返回值
可以通过return，将操作完的数据返回给调用者。

### 函数注意事项
1. 如果函数没有显示的调用return，那么函数就没有返回值
2. 函数名其实代表整个函数
3. 实参个数小于形参，没有被赋值的形参的值就是undefined

### return两个作用
1. 将结果返回给调用者
2. 用来结束函数

---

## 8. 面向对象

### 面向对象和面向过程的区别
- **面向过程**：完成一件事，需要多少个步骤（重点关注的是步骤）
- **面向对象**：完成一件事，需要多少个对象（重点关注的是对象）

### 类和对象
- **类**：对现实生活中具有相同属性和行为的事物的统称（抽象的，可以看做是模板）
- **对象**：现实生活中的一个具体存在（具体的，是通过类这个模板创建出来的真实存在的个体）

### 类的定义
```javascript
function 类名(参数1, 参数2) {
  // 属性
  this.属性名1 = 参数1;
  this.属性名2 = 参数2;
  // 方法
  this.方法名 = function() {
    方法体;
  };
}
```

### 对象的创建
```javascript
var 对象名 = new 类名(实际参数1, 实际参数2);

// 字面量方式创建对象
var 对象名 = {
  属性名: 属性值,
  方法名: function() {}
};
```

---

## 9. 内置对象

### Math对象
用于执行常见的算术任务，不需要创建对象，直接使用类名调用。

```javascript
Math.PI;           // 圆周率
Math.max();        // 最大值
Math.min();        // 最小值
Math.abs();        // 绝对值
Math.ceil();       // 向上取整
Math.floor();      // 向下取整
Math.round();      // 四舍五入
Math.pow();        // 幂运算
Math.random();     // 随机数[0,1)
```

**随机数公式**：`Math.floor(Math.random() * (max - min + 1)) + min` // [min, max]

### Date对象
用于处理日期与时间。

```javascript
new Date();
new Date(年, 月, 日);
new Date(日期类型的字符串);

// 获取年月日
getFullYear();   // 年份
getMonth();      // 月份(0~11)
getDate();       // 日期(1~31)
getDay();        // 星期(0~6)

// 获取时分秒
getHours();      // 小时(0~23)
getMinutes();    // 分钟(0~59)
getSeconds();    // 秒数(0~59)

// 获取毫秒值
getTime();       // 1970年1月1日至今的毫秒数
```

### Number对象
原始数值的包装对象。

```javascript
Number.MAX_VALUE;    // 可表示的最大数
Number.MIN_VALUE;    // 可表示的最小数
toFixed(x);          // 转换为字符串，小数点后有x位
```

### Array对象

**添加和删除**：
```javascript
push();       // 末尾添加
unshift();    // 开头添加
pop();        // 末尾删除
shift();      // 开头删除
splice();     // 指定位置添加或删除
```

**查找和过滤**：
```javascript
find(匿名函数);       // 查找符合条件的元素
filter(匿名函数);     // 过滤符合条件的元素
indexOf();           // 查找索引
lastIndexOf();       // 从后查找索引
includes();          // 查找元素是否存在
```

**遍历操作**：
```javascript
map(匿名函数);        // 遍历并返回新数组
every(匿名函数);      // 检测所有元素是否都符合条件
some(匿名函数);       // 检测是否有元素符合条件
forEach(匿名函数);    // 遍历
sort(匿名函数);       // 排序
reduce(匿名函数, 初始值); // 累计
```

**其他操作**：
```javascript
concat();      // 合并数组
slice();       // 截取数组
reverse();     // 反转数组
join();        // 转换为字符串
toString();    // 转换为字符串
```

### String对象
用于处理文本（字符串）的对象。

```javascript
// 查找
indexOf();         // 查找索引
lastIndexOf();     // 从后查找索引
charAt(索引);      // 查找字符

// 截取
substr(start, length);   // 截取
substring(start, end);   // 截取

// 替换
replace();         // 替换第一个
replaceAll();      // 替换所有

// 切割转换
split();           // 切割为数组
toUpperCase();     // 转大写
toLowerCase();     // 转小写

// 判断
startsWith();      // 是否以某字符串开头
endsWith();        // 是否以某字符串结尾

// 修剪
trim();            // 去除首尾空格
```

### 正则对象
用于对字符串模式匹配及检索替换。

```javascript
// 创建
var reg = new RegExp('字符串');
var reg = /正则表达式/;

// 使用
reg.test(需要匹配的字符串);  // 测试是否匹配
字符串.match(reg);           // 查找匹配
```

**常用规则**：
- `[abc]`：a或b或c
- `[0-9]`：数字，等同`\d`
- `[^0-9]`：非数字，等同`\D`
- `[a-zA-Z]`：英文字符
- `\w`：单词字符，等同`[a-zA-Z0-9_]`

**数量词**：
- `+`：至少出现一次
- `*`：出现任意次
- `?`：出现0次或1次
- `{x}`：出现x次
- `{x,}`：至少出现x次
- `{x,y}`：出现x到y次

**边界**：
- `^`：开头
- `$`：结尾

### 全局对象
页面中最大对象（顶级对象），在浏览器环境中代表window对象。

```javascript
NaN;            // 非数字值
undefined;      // 未定义的值
eval();         // 执行字符串代码
isNaN();        // 检查是否非数字
parseFloat();   // 转浮点数
parseInt();     // 转整数
String();       // 转字符串
```

### JSON对象
JavaScript Object Notation，一种轻量级的数据交换格式。

```javascript
JSON.parse();      // JSON字符串转JS对象
JSON.stringify();  // JS对象转JSON字符串
```

---

## 10. DOM操作

### DOM概念
Document Object Model 文档对象模型。

当html文档被加载时，浏览器会创建页面文档对象模型，当前html文档会被构造成对象的树。

### DOM作用
- 改变页面中的所有HTML元素
- 改变页面中的所有HTML属性
- 改变页面中的所有CSS样式
- 对页面中的所有事件做出反应

### 获取元素
```javascript
// 获取单个元素
document.getElementById();
document.querySelector();

// 获取多个元素
document.getElementsByClassName();
document.getElementsByTagName();
document.querySelectorAll();
```

### 事件入门
**三要素**：
1. 事件源（按钮）
2. 事件（动作：点击）
3. 事件处理程序（事件发生之后需要做的事情）

**三步骤**：
1. 写一个事件源
2. 写一个监听器（事件处理函数）
3. 绑定监听器和事件源

### DOM操作属性
```javascript
// 原始方式
element.setAttribute('属性名', '属性值');
element.getAttribute('属性名');

// 简化方式
元素对象.属性名 = 属性值;
元素对象.属性名;
```

### DOM操作标签体
```javascript
元素对象.innerHTML;   // 获取/设置（包含HTML标签）
元素对象.innerText;   // 获取/设置（纯文本）
```

### DOM操作样式
```javascript
// 单独设置样式
元素对象.style.样式属性名 = 属性值;

// 批量设置样式
元素对象.className = 'class属性值';

// 使用classList
元素对象.classList.add('类名');
元素对象.classList.remove('类名');
元素对象.classList.toggle('类名');
元素对象.classList.contains('类名');
```

---

# 附录：知识速查表

## HTML标签速查
| 标签 | 作用 |
|------|------|
| `<div>` | 块级容器 |
| `<span>` | 行内容器 |
| `<img>` | 图片 |
| `<a>` | 链接 |
| `<ul>/<ol>/<li>` | 列表 |
| `<table>` | 表格 |
| `<form>` | 表单 |
| `<input>` | 输入框 |

## CSS选择器速查
| 选择器 | 语法 | 示例 |
|--------|------|------|
| ID选择器 | `#id` | `#header` |
| 类选择器 | `.class` | `.container` |
| 后代选择器 | `a b` | `div p` |
| 子代选择器 | `a>b` | `ul>li` |
| 伪类 | `:hover` | `a:hover` |
| 伪元素 | `::before` | `div::before` |

## CSS布局速查
| 布局方式 | 特点 | 使用场景 |
|----------|------|----------|
| 标准流 | 默认布局 | 基础结构 |
| 浮动 | 脱标、水平排布 | 图文混排、导航栏 |
| 定位 | 自由摆放 | 弹窗、固定导航 |
| Flex | 弹性布局 | 一维布局 |
| Grid | 网格布局 | 二维布局 |

## JS数据类型速查
| 类型 | 说明 | 示例 |
|------|------|------|
| String | 字符串 | `'hello'` |
| Number | 数字 | `123` |
| Boolean | 布尔 | `true` |
| Null | 空 | `null` |
| Undefined | 未定义 | `undefined` |
| Object | 对象 | `{}` |
| Array | 数组 | `[]` |
| Function | 函数 | `function(){}` |

## JS循环速查
| 循环 | 特点 | 使用场景 |
|------|------|----------|
| for | 计数循环 | 循环次数确定 |
| while | 条件循环 | 循环次数不确定 |
| do-while | 至少执行一次 | 先执行后判断 |

---

*本文档整理自WEBGIS前端课程学习笔记*