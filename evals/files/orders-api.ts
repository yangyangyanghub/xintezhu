import express from 'express';

const app = express();

type Order = {
  id: string;
  total: number;
};

const mockOrders: Order[] = [
  { id: 'A-1001', total: 199 },
  { id: 'A-1002', total: 299 }
];

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

  return res.json(payload.total.toFixed(2));
});

app.listen(3000);
