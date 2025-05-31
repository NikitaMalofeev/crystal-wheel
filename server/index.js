import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/spin', (req, res) => {
  const delay = Math.floor(Math.random() * 3) + 2; // 2-4 секунды задержки
  const symbolId = Math.floor(Math.random() * 8); // 0-7 для 8 символов
  
  setTimeout(() => {
    res.json({ 
      result: symbolId,
      delay 
    });
  }, delay * 1000);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 