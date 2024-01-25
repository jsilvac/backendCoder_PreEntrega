import express from 'express';
import productsRouter from './routes/products.router.js'
import cartRouter from './routes/carts.router.js'

const app = express();
const PORT = 8080;

// Midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}))

// Rutas
app.use('/', productsRouter);
app.use('/', cartRouter);

// endpoint
app.get('/', (req , res)=>{

   res.send('Servidor ON')

})

app.listen(PORT, () => console.log(`server rinig on port ${PORT}`))

