# TableJSON

一个轻量级库，用于在对象数组和表格优化的 JSON 格式之间进行转换。

[![npm 版本](https://img.shields.io/npm/v/@kuriyota/table-json)](https://www.npmjs.com/package/@kuriyota/table-json)
[![许可证](https://img.shields.io/npm/l/@kuriyota/table-json)](LICENSE)

## 功能特点

- **高效序列化**：将对象数组转换为表格优化的 JSON 格式
- **自动检测**：自动识别适合表格转换的数组结构
- **可定制转换**：提供强制转换或深度控制的选项
- **轻量级**：无外部依赖
- **TypeScript 支持**：包含类型定义

## 安装

```bash
npm install @kuriyota/table-json
```

## 使用方法

### 基本用法

```javascript
import { parse, stringify } from 'tablejson';

const data = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
  // ... 数百个类似对象
];

// 转换为表格优化的 JSON
const json = stringify(data);

// 转换回原始对象
const originalData = parse(json);
```

### API 接口

#### `stringify(data: any, options?: StringifyOptions, replacer?, space?): string`

将 JavaScript 值转换为表格优化的 JSON 字符串。

**选项：**

- `tableConversion`: `'auto' | 'force' | number` （默认：`'auto'`)
  - `'auto'`: 自动在有益时转换数组（相当于 `10`）
  - `'force'`: 强制转换所有对象数组
  - `number`: 当数组长度达到此值时，将进行转换
- `maxDepth`: 最大递归深度 （默认：`Infinity`)

#### `parse(input: string): any`

将表格优化的 JSON 解析回 JavaScript 对象。

#### `isTableFormat(obj: any): boolean`

类型守卫，检查对象是否为 TableJSON 格式。

### 高级用法

```javascript
import { stringify } from 'tablejson';

const largeDataSet = [...]; // 包含数千个相似对象的数组

// 强制进行表格转换，不考虑大小
const json1 = stringify(largeDataSet, { tableConversion: 'force' });

// 自定义转换阈值（转换长度超过 5 项的数组）
const json2 = stringify(largeDataSet, { tableConversion: 5 });

// 限制递归深度
const json3 = stringify(complexData, { maxDepth: 3 });
```

## TableJSON 格式

优化后的格式如下所示：

```json
{
  "@table": "1.0.0",
  "columns": ["id", "name", "age"],
  "rows": [
    [1, "Alice", 30],
    [2, "Bob", 25]
  ]
}
```

而非传统格式：

```json
[
  { "id": 1, "name": "Alice", "age": 30 },
  { "id": 2, "name": "Bob", "age": 25 }
]
```

## 性能优势

表格格式在以下情况下提供显著优势：

- 处理大量相似对象的数组时
- JSON 需要通过网络传输时
- 存储空间受限时
