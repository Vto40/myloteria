const express = require('express');
const app = express();
const port = 3000;

const valoracionesRouter = require('./routes/valoraciones');

app.use(express.json());
app.use('/valoraciones', valoracionesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});