## 问题定位

第 28 行存在问题：

```typescript
return res.json(payload.total.toFixed(2));
```

**问题分析：**

1. `payload.total.toFixed(2)` 返回的是字符串（如 `"199.00"`），而不是完整的订单对象
2. API 应该返回订单详情，而非单独的金额字符串
3. 订单数据包含 `id`、`total`、`createdAt`，应该全部返回

## 修复方案

将第 28 行改为：

```typescript
return res.json(payload);
```

完整修复后的代码：

```typescript
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const order = mockOrders.find((item) => item.id === orderId);

  if (!order) {
    return res.status(404).json({ message: 'order not found' });
  }

  const payload = {
    ...order,
    createdAt: new Date().toISOString()
  };

  return res.json(payload);
});
```

修复后，接口将返回完整的订单对象：

```json
{
  "id": "A-1001",
  "total": 199,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```
