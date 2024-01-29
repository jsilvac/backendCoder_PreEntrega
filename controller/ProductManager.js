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
            console.log("Error fetching en producto:", error);
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

export default ProductManager