import express from 'express'
import ProductManager from '../controller/ProductManager.js';

const router = express.Router();

const products = [];

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
        
        if (!newProduct || Object.keys(newProduct).length === 0) {
            res.status(400).json({ error: "El objeto de producto está vacío o no es válido." });
            return;
        }

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