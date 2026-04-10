# Embedding Provider 配置指南

## 当前状态
系统当前运行在 **keyword-only 模式** (degraded)，因为没有配置 embedding provider。

## 启用 Semantic Retrieval

### 选项 1: 使用 Ollama (推荐，完全本地)

1. **安装 Ollama**
   ```bash
   # Windows (PowerShell)
   winget install Ollama
   
   # 或从官网下载: https://ollama.ai
   ```

2. **启动 Ollama 服务**
   ```bash
   # Ollama 会自动在后台运行
   # 确认服务状态
   ollama serve
   ```

3. **下载 embedding 模型**
   ```bash
   ollama pull nomic-embed-text
   ```

4. **配置 local-memory 使用 Ollama**
   
   修改 `.local-memory/config.json`:
   ```json
   {
     "provider": {
       "embedding": {
         "provider": "ollama",
         "baseUrl": "http://localhost:11434",
         "model": "nomic-embed-text"
       },
       "inference": {
         "provider": "none"
       }
     }
   }
   ```

5. **重启 local-memory 服务**
   ```bash
   bun run src/index.ts start --port 37777
   ```

6. **验证配置**
   ```bash
   curl http://127.0.0.1:37777/health
   # 应显示 embedding provider 可用
   ```

### 选项 2: 继续使用 Keyword-Only 模式

如果不配置 embedding provider，系统将继续使用 keyword-only 模式，这适用于：
- 不想安装额外依赖
- 只需要关键词检索
- 测试环境

**Keyword-only 模式限制**:
- 不支持 semantic search
- Hybrid search 自动降级为 keyword-only
- 没有 embedding 相似度计算

## 配置优先级

系统按以下顺序加载配置：
1. 环境变量 `LOCAL_MEMORY_CONFIG`
2. 配置文件 `.local-memory/config.json`
3. 默认配置 (keyword-only)

## 验证 Provider 状态

```bash
# HTTP API
curl http://127.0.0.1:37777/health

# CLI
bun run src/index.ts status --detailed
```

## 故障排除

### Ollama 连接失败
```
[ProviderRouter] Failed to initialize embedding provider: Connection refused
```
**解决**: 确认 Ollama 服务已启动 (`ollama serve`)

### 模型未找到
```
[ProviderRouter] Model 'nomic-embed-text' not found
```
**解决**: 运行 `ollama pull nomic-embed-text`

### 降级模式
```
[ProviderRouter] Degraded: No embedding provider configured, keyword-only mode
```
**解决**: 这是正常行为，表示系统运行在 keyword-only 模式

## 性能考虑

- **Ollama**: 完全本地，无需网络，延迟低 (~50-200ms)
- **Keyword-only**: 更快，无需额外资源，但召回率较低

## 推荐配置

### 开发环境
```json
{
  "provider": {
    "embedding": { "provider": "none" }
  }
}
```

### 生产环境 (需要 semantic search)
```json
{
  "provider": {
    "embedding": {
      "provider": "ollama",
      "baseUrl": "http://localhost:11434",
      "model": "nomic-embed-text"
    }
  }
}
```
