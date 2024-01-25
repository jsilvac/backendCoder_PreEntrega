import exprees from 'express'

const router = exprees.Router();

// clases
class ProductManager {

    constructor() {
    this.filePath = "carrito.json";
    }


    async checkFileExist(){
        try{
            await fs.access(this.filePath);
            return true;
        }catch(error){
            return false
        }
    }

    async createFile() {
        try {
            await fs.promises.writeFile(this.filePath, '[]');
            console.log("Archivo creado: ", this.filePath);
        } catch (error) {
            console.log("Error al crear el archivo: " + error);
        }
    }

    async getCartById(idProduct) {
        const products = await this.getProducts();

        const product = products.find(item => item.id === idProduct);

        return product ? product : null;
    }
}

router.get("/api/cart/:pid", (req,res) => {
    res.send(' cart get')
})

router.post("/api/cart", (req,res) => {
    res.send('cart post')
})

router.put("/api/cart/:pid", (req,res) => {
    res.send('cart put')
})

router.delete("/api/cart/:pid", (req,res) => {
    res.send('cart delete')
})



export default router