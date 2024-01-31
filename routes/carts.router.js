import exprees from 'express'
import ProductManager from '../controller/ProductManager.js';
import CartManager from '../controller/CartManager.js';

const router = exprees.Router();

const prodMan = new ProductManager()
const CartMan = new CartManager()

// clases
// class CartManager {

//     constructor() {
//     this.filePath = "carrito.json";
//     }

//     async checkFileExist() {
//         try {

//             await fs.promises.stat(this.filePath);
//             return true;
//         } catch (error) {
//             return false;
//         }
//     }

//     async createFile() {
//         try {
//             await fs.promises.writeFile(this.filePath, `[
//                 {
//                     "id": 1,
//                     "products": [
//                         {
//                             "id_product": 1,
//                             "stock": 0
//                         }
//                     ]
//                 }
//             ]`);
//             console.log("Archivo creado: ", this.filePath);
//         } catch (error) {
//             console.log("Error al crear el archivo: " + error);
//         }
//     }

//     async getCarritos() {
//         try {
//             const fileExists = await this.checkFileExist();
            
//             if (!fileExists) {
//                 await this.createFile();
//             }
    
//             const data = await fs.promises.readFile(this.filePath, "utf8");
            
//             return data ? JSON.parse(data) : [];
    
//         } catch (error) {
//             console.log("Error fetching en carritos:", error);
//             return [];
//         }
//     }

//     async getCartById(idCarrito) {

//         try{

//             const carrito = await this.getCarritos();
    
//             const carro = carrito.find(cart => cart.id === idCarrito);
    
//             return carro ? carro : null;

//         }catch(error){
//             console.log("Error fetching en carrito:", error);
//             return [];
//         }
//     }

//     async addNewProductCart(cart, product) {
//         try {
//             let cartExist = false;
    
//             for (let i = 0; i < cart.length; i++) {
//                 if (cart[i].id === product.id_carrito) {
//                     cartExist = true;
    
//                     let productExist = false;
    
                    
//                     for (let j = 0; j < cart[i].productos.length; j++) {
//                         if (cart[i].productos[j].id_producto === product.id_producto) {
//                             productExist = true;
//                             cart[i].productos[j].stock += 1;  
//                         }
//                     }
    
//                     if (!productExist) {
                        
//                         cart[i].productos.push({
//                             id_producto: product.id_producto,
//                             stock: 1
//                         });
//                     }
//                 }
//             }
    
//             if (!cartExist) {
//                 // Si el carrito no existe, asignar un nuevo id basado en el máximo existente
//                 const maxCartId = Math.max(...cart.map(cartItem => cartItem.id), 0);
//                 const newCartId = maxCartId + 1;
    
//                 cart.push({
//                     id: newCartId,
//                     productos: [{
//                         id_producto: product.id_producto,
//                         stock: 1
//                     }]
//                 });
//             }
    
//             await fs.promises.writeFile(this.filePath, JSON.stringify(cart), 'utf8');
    
//         } catch (error) {
//             console.error('Error:', error);
//             throw new Error('Error del servidor');
//         }
//     }
    
    
// }

router.get("/api/cart/:cid", async (req,res) => {
    
    const xId = req.params.cid;

    try{
        
        const carrito = await CartMan.getCartById(xId);

        if(!carrito ){
            res.status(400).json({ error: "Carrito no encontrado!" });
            return
        }
        
        res.status(200).json(carrito);
        
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})
router.post("/api/cart/:cid/product/:pid", async (req, res) => {
    try {
        const cUId = req.params.cid;
        const pUId = req.params.pid;

        // Validar que los datos en el obdy
        const newCart = req.body;
        if (!newCart || !newCart.id_product) {
            res.status(400).json({ error: "El objeto de carrito está vacío o no es válido." });
            return;
        }

        // Obtener el carrito y el producto segun los IDs
        const prodMan = new ProductManager();
        const product = await prodMan.getProductById(pUId);
        const cart = await CartMan.getCartById(cUId);

        const newProduct = await CartMan.addNewProductCart(cUId, product);

        res.status(200).json(newProduct);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
});




export default router