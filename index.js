// Librerías externas
const express = require('express');
const sequelize = require('sequelize');
const joi = require('joi');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Módulos internos
const { readFile, writeFile } = require('./src/files');

const app = express();
const routerApi = require('./routes');
const FILE_NAME = './db/UFC.txt';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Rutas DE PRUEBA
app.get('/hola/:name', (req, res) => {
    console.log(req);
    const name = req.params.name;
    const type = req.query.type;
    const formal = req.query.formal;
    res.send(`Hello ${formal ? 'Mr.' : ''} 
    ${name} ${type ? ' ' + type : ''}`);
});


app.get('/read-file', (req, res) => {
    const data = readFile(FILE_NAME);
    res.send(data);
});

// API
// Listar Luchadores
app.get('/UFC', (req, res)=>{
    const data = readFile(FILE_NAME);
    res.json(data);
})

//Crear Luchador
app.post('/UFC', (req, res) => {
    try {
        //Leer el archivo de luchadores
        const data = readFile(FILE_NAME);
        //Agregar nuevo luchador (Agregar ID)
        const newFigther = req.body;
        newFigther.id = uuidv4();
        console.log(newFigther)
        data.push(newFigther);
        // Escribir en el archivo
        writeFile(FILE_NAME, data);
        res.json({ message: 'El Luchador fue creado con éxito' });
    } catch (error) {
        console.error(error);
        res.json({ message: 'Error al almacenar al nuevo luchador' });
    }
});

//Obtener un solo luchador
app.get('/UFC/:id', (req, res) => {
    console.log(req.params.id);
    //Guardar el ID
    const id = req.params.id
    //Leer el contenido del archivo
    const ufc = readFile(FILE_NAME)
    // Buscar al luchador con el ID que recibimos
    const figtherFound = ufc.find(ufc => ufc.id === id )
    if(!figtherFound){// Si no se encuentra al luchador con ese ID
        res.status(404).json({'ok': false, message:"Luchador no existe"})
        return;
    }
    res.json({'ok': true, ufc: figtherFound});
})

//Actualizar datos de un luchaor
app.put('/UFC/:id', (req, res) => {
    console.log(req.params.id);
    //Guardar el ID
    const id = req.params.id
    //Leer el contenido del archivo
    const ufc = readFile(FILE_NAME)
    // Buscar al luchador con el ID que recibimos
    const ufcIndex = ufc.findIndex(ufc => ufc.id === id )
    if( ufcIndex < 0 ){// Si no se encuentra al luchador con ese ID
        res.status(404).json({'ok': false, message:"Luchador no existe"});
        return;
    }
    let ufigc = ufc[ufcIndex]; //Sacar del arreglo
    ufigc = { ...ufigc, ...req.body  };
    ufc[ufcIndex] = ufigc; //Poner al luchador en el mismo lugar
    writeFile(FILE_NAME, ufc);
    //Si el luchador existe, modificar sus datos y almacenarlo nuevamente
    res.json({'ok': true, ufigc: ufigc});
})

//Eliminar un luchador
app.delete('/UFC/:id', (req, res) => {
    console.log(req.params.id);
    //Guardar el ID
    const id = req.params.id
    //Leer el contenido del archivo
    const ufc = readFile(FILE_NAME)
    // Buscar al luchador con el ID que recibimos
    const ufcIndex = ufc.findIndex(ufc => ufc.id === id )
    if( ufcIndex < 0 ){// Si no se encuentra el luchador con ese ID
        res.status(404).json({'ok': false, message:"Luchador no existe"});
        return;
    }
    //Eliminar al luchador que esté en la posición ufcIndex
    ufc.splice(ufcIndex, 1);
    writeFile(FILE_NAME, ufc)
    res.json({'ok': true});
})

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
});
