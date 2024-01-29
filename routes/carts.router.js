import exprees from 'express'
import ProductManager from '../controller/ProductManager.js';

const router = exprees.Router();

// clases
class CartManager {

    constructor() {
    this.filePath = "carrito.json";
    }

    async checkFileExist() {
        try {

            await fs.promises.stat(this.filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    async createFile() {
        try {
            await fs.promises.writeFile(this.filePath, `[
                {"product":[],}
            ]`);
            console.log("Archivo creado: ", this.filePath);
        } catch (error) {
            console.log("Error al crear el archivo: " + error);
        }
    }

    async getCarritos() {
        try {
            const fileExists = await this.checkFileExist();
            
            if (!fileExists) {
                await this.createFile();
            }
    
            const data = await fs.promises.readFile(this.filePath, "utf8");
            
            return data ? JSON.parse(data) : [];
    
        } catch (error) {
            console.log("Error fetching en carritos:", error);
            return [];
        }
    }

    async getCartById(idCarrito) {

        try{

            const carrito = await this.getCarritos();
    
            const carro = carrito.find(cart => cart.id === idCarrito);
    
            return carro ? carro : null;

        }catch(error){
            console.log("Error fetching en carrito:", error);
            return [];
        }
    }

    async addNewProductCart(cart, product) {
        try {
            let cartExist = false;
    
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id === product.id_carrito) {
                    cartExist = true;
    
                    let productExist = false;
    
                    
                    for (let j = 0; j < cart[i].productos.length; j++) {
                        if (cart[i].productos[j].id_producto === product.id_producto) {
                            productExist = true;
                            cart[i].productos[j].stock += 1;  
                        }
                    }
    
                    if (!productExist) {
                        
                        cart[i].productos.push({
                            id_producto: product.id_producto,
                            stock: 1
                        });
                    }
                }
            }
    
            if (!cartExist) {
                // Si el carrito no existe, asignar un nuevo id basado en el máximo existente
                const maxCartId = Math.max(...cart.map(cartItem => cartItem.id), 0);
                const newCartId = maxCartId + 1;
    
                cart.push({
                    id: newCartId,
                    productos: [{
                        id_producto: product.id_producto,
                        stock: 1
                    }]
                });
            }
    
            await fs.promises.writeFile(this.filePath, JSON.stringify(cart), 'utf8');
    
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Error del servidor');
        }
    }
    
    
}

router.get("/api/cart/:cid", async (req,res) => {
    
    const xId = req.params.pid;
    const prodMan = new ProductManager();
    
    try{

        const carrito = await prodMan.getCartById(xId);
 
        if(!carrito){
            res.status(404).send("Carrito no encontrado");
            return
        }
        
        res.status(200).json(carrito);
        
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})

router.post("/api/cart/:cid/product/:pid", async  (req,res) => {
   
    try{

        const newCart = req.body;

        if (!newCart || Object.keys(newCart).length === 0) {
            res.status(400).json({ error: "El objeto de carito está vacío o no es válido." });
            return;
        }

        const CartMan = new CartManager();
        const cUId = req.params.pid

        const prodMan = new ProductManager();
        const pUId = req.params.pid;

        const product = await prodMan.getCartById(pUId);
        const cart = await CartMan.getCartById(cUId);

        if(!cart){
            res.status(404).send("Carrito no encontrado");
            return
        }
        
        if(!product){
            res.status(404).send("Producto no encontrado");
            return
        }

        //Si el id del producto y del carrito son diferentes, hacemos una comprobación adicional para asegurarnos que el producto no esté ya
  
        const NewProduct = await CartMan.addNewProductCart(cart,product)

        res.status(200).json(cart);
        
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})

router.put("/api/cart/:pid", (req,res) => {
    res.send('cart put')
})

router.delete("/api/cart/:pid", (req,res) => {
    res.send('cart delete')
})



export default router