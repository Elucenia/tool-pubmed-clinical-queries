# 在 ELUCENIA 内检索临床研究

输入科学检索词，然后选择研究类别和检索范围。检索词将发送至 NCBI；请勿输入患者信息。

## 方法与版本

NLM Clinical Study Categories · December2011

## 输入

- **检索词** (`query`, `string`)
- **研究类别** (`category`, `enum`)
  - `therapy`: 治疗
  - `diagnosis`: 诊断
  - `etiology`: 病因
  - `prognosis`: 预后
  - `prediction`: 临床预测规则
- **检索范围** (`scope`, `enum`)
  - `broad`: 宽范围 · 更高敏感度
  - `narrow`: 窄范围 · 更高特异度
- **页码** (`page`, `integer`) [0–999]

## 限制与审查

筛选条件不评价单项研究的质量。最多显示 10,000 条记录；结果更多时请缩小检索范围。这不能替代系统综述。

参考文献保留 NLM 提供的原始元数据。

不转载摘要或全文。元数据实时获取；数据来源可能修正记录。

数据来源：NLM / NCBI PubMed。不代表 NLM 的认可。

技术检查使用合成数据。尚未开展独立临床审查和专业翻译审查。

## 使用合成数据运行

```sh
node cli.cjs examples/input.json zh
```

## 结果

- 检索结果总数
- 已应用的检索策略
- PubMed 对检索式的解释
- 检索时间
- 参考文献保留 NLM 提供的原始元数据。

## 来源与权利

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

执行实时检索前，请将 NCBI_TOOL_EMAIL 设置为部署负责人的联系地址。未设置时，命令行工具会拒绝检索。npm ci 按锁定文件安装依赖版本。请使用科学检索词，不要发送患者标识信息。

```sh
npm ci
npm test
```
