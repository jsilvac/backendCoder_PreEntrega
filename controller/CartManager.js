import express from 'express'
import fs from 'fs'

import { v4 as uuidv4 } from 'uuid';


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
            await fs.promises.writeFile(this.filePath, '[]');
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

            const data = await fs.promises.readFile(this.filePath, 'utf8');

            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.log('Error fetching en carritos:', error);
            return null;
        }
    }
    async getCartById(idCarrito) {
        try {
            const carritos = await this.getCarritos();
    
            const carrito = carritos.find((cart) => String(cart.id) === String(idCarrito));

            if (carrito) {
                return carrito;
            } else {
                console.log('Carrito no encontrado.');
                return null;
            }
        } catch (error) {
            console.log('Error fetching en carrito:', error);
            return null;
        }
    }
    
    async addNewProductCart(cartId, product) {
        try {
            // Obtener la lista de carritos
            const carritos = await this.getCarritos();
            // Buscamos el carrito
            const cartIndex = carritos.findIndex((cartItem) => cartItem.id === cartId);
    
            if (cartIndex !== -1) {
                // El carrito ya existe, buscar el producto
                const productIndex = carritos[cartIndex].products.findIndex(
                    (prod) => prod.product_id === product.id
                );
    
                if (productIndex !== -1) {
                    // Producto existente, aumentamos la cantidad
                    carritos[cartIndex].products[productIndex].quantity += 1;
                } else {
                    // Producto no existe, agregamos al carrito
                    carritos[cartIndex].products.push({
                        product_id: product.id,
                        quantity: 1
                    });
                }
            } else {
                // El carrito no existe, crear uno nuevo con el producto
                const newCart = {
                    id: cartId,
                    products: [
                        {
                            product_id: product.id,
                            quantity: 1,
                        },
                    ],
                };
    
                carritos.push(newCart);
            }
    
            // Guardar el carrito actualizado
            await fs.promises.writeFile(this.filePath, JSON.stringify(carritos, null, 2), 'utf8');
    
            return carritos;
        } catch (error) {
            console.error('Error en addNewProductCart:', error);
            throw new Error('Error del servidor');
        }
    }
    
        
        
}

export default CartManager