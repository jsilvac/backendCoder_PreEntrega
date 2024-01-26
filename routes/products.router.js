import express from 'express'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const products = [];

// clases
class ProductManager {

    constructor() {
        this.filePath = "productos.json";
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
            await fs.promises.writeFile(this.filePath, '[]');
            console.log("Archivo creado: ", this.filePath);
        } catch (error) {
            console.log("Error al crear el archivo: " + error);
        }
    }
  
    async getProducts() {
        try {
            const fileExists = await this.checkFileExist();
            
            if (!fileExists) {
                await this.createFile();
            }
    
            const data = await fs.promises.readFile(this.filePath, "utf8");
            
            return data ? JSON.parse(data) : [];
    
        } catch (error) {
            console.log("Error fetching en productos:", error);
            return [];
        }
    }
    

    async addProduct(product) {

        try {
            
            const existingProducts = await this.getProducts();
            console.log("esto esta en el json", existingProducts)
            
            const existingProductIndex = existingProducts.findIndex(p => p.nombre === product.nombre);
    
            if (existingProductIndex) {
                
                const { stock, ...existingProduct } = existingProducts[existingProductIndex];
                existingProducts[existingProductIndex] = { ...existingProduct, stock: stock + 1 };
            } else {
                
                const newProduct = { ...product, id: uuidv4(), stock: 1 };
                console.log("nuevo producto", newProduct)
                existingProducts.push(newProduct);
            }
    
            await fs.promises.writeFile(this.filePath, JSON.stringify(existingProducts), 'utf8');
    
            return existingProductIndex 
                ? existingProducts[existingProductIndex]
                : existingProducts[existingProducts.length - 1];
    
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Error del servidor'); 
        }
    }
    
    async updateProduct(productID, updateData) {
        try {
            const existingProducts = await this.getProducts();
            console.log("Antes de la actualización:", JSON.stringify(existingProducts, null, 2));

            const existingProductIndex = existingProducts.findIndex(p => p.id === productID);

            if (existingProductIndex >= 0) {
                console.log("entro al update", updateData)

                const PordExist = existingProducts[existingProductIndex];

                for (const key in updateData) {
                    if (updateData.hasOwnProperty(key)) {
                        PordExist[key] = updateData[key];
                    }
                }
                existingProducts[existingProductIndex] = PordExist;

                await fs.promises.writeFile(this.filePath, JSON.stringify(existingProducts), 'utf8');
                
                return existingProducts[existingProductIndex];
            } else {
                throw new Error('Producto no encontrado');
            }
            console.log("no entro")
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Error del servidor');
        }
    }
    
    async getProductById(idProduct) {

        try{
            
            const products = await this.getProducts();   
            const product = products.find(item => item.id === idProduct);

            return product ? product : null;

        }catch(error){
            console.log("Error fetching en productos:", error);
            return [];
        }
    }

    async deleteProduct(productID) {

        try {
            const existingProducts = await this.getProducts();
            
            console.log("produc id: ", productID)
            const existingProductIndex = existingProducts.findIndex(p => p.id === productID);
            console.log("exist id", existingProductIndex)
            if (existingProductIndex >= 0) {

                existingProducts.splice(existingProductIndex, 1);
    
                await fs.promises.writeFile(this.filePath, JSON.stringify(existingProducts), 'utf8');
    
                return { message: 'Producto eliminado correctamente' };
            } else {
                throw new Error('Producto no encontrado!');
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Error del servidor');
        }
    }
    
}

// Enpoint 
router.get("/api/products", async (req, res) => {

    const prod = new ProductManager();
    
    try{
        
        let allProducts = await prod.getProducts();
        console.log(allProducts)
        // Verifica si biene el limit
        const limit = parseInt(req.query.limit);

        if (!isNaN(limit) && limit > 0) {
            
            allProducts = allProducts.slice(0, limit);
        }
        
        if (allProducts.length <= 0) {
            res.send("No se encontraron productos...!");
            return;
        }
       
        res.status(200).json(allProducts);
    
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
});

router.get("/api/products/:pid", async (req, res)=>{
    
    const xId = req.params.pid;
    const prodMan = new ProductManager();
    
    try{

        const product = await prodMan.getProductById(xId);
 
        if(!product){
            res.status(404).send("Producto no encontrado");
            return
        }
        
        res.status(200).json(product);
        
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})

router.post("/api/products", async (req,res) => {

    const prodMan = new ProductManager();
    
    try{

        const newProduct = req.body;

        if(!newProduct){
            res.status(404).send("Producto no creado!");
            return
        }

       const addNewProd = await prodMan.addProduct(newProduct);

        res.status(201).json({
            message:"pruducto creado correctamente",
            product: addNewProd
        })    

    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})

router.put("/api/products/:pid", async (req,res) => {
   
    try{

        const prodId = req.params.pid;
        const updateData = req.body;
        const prodMan = new ProductManager();


        await prodMan.updateProduct(prodId, updateData)
        .then(()=>{
            res.status(200).json({message:'producto actualizado'});
            })
        .catch((err)=>{
            console.log(err);
            res.status(500).json({message:'error al actualizar el producto'+ err});
            });

    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }  
})

router.delete("/api/products/:pid", async (req,res) => {
    
    try{

        const producId = req.params.pid
        console.log("id :",producId)
        const prodMan = new ProductManager()
    
        await prodMan.deleteProduct(producId)
    
        res.status(201).json({
            message:"Producto eliminado correctamente",
            
        }) 

    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }

})


export default router