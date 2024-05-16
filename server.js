const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');



const app = express();
const PORT = process.env.PORT || 3000;
const sportsFilePath = 'sports.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));


// Manejador de errores
function errorHandler(res, status, message) {
  console.error(message);
  res.status(status).send(message);
}

// Leer datos de deportes desde el archivo JSON
function readSportsData() {
  try {
    const data = fs.readFileSync(sportsFilePath);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Escribir datos de deportes en el archivo JSON
function writeSportsData(data) {
  try {
    fs.writeFileSync(sportsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error al escribir en el archivo de deportes:', error);
  }
}

// Ruta para registrar un nuevo deporte
app.post('/agregar', (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return errorHandler(res, 400, 'Nombre y precio son campos requeridos.');
  }

  const sportsData = readSportsData();
  const nuevoDeporte = { nombre, precio };
  sportsData.push(nuevoDeporte);

  writeSportsData(sportsData);
  res.status(200).send('Deporte agregado exitosamente.');
});

// Ruta para consultar deportes registrados en formato JSON
app.get('/deportes', (req, res) => {
  const deportes = readSportsData();
  res.json({ deportes });
});

// Ruta para editar el precio de un deporte
app.put('/editar', (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return errorHandler(res, 400, 'Nombre y precio son campos requeridos.');
  }

  let sportsData = readSportsData();
  const index = sportsData.findIndex(deporte => deporte.nombre === nombre);
  if (index === -1) {
    return errorHandler(res, 404, 'Deporte no encontrado.');
  }

  sportsData[index].precio = precio;
  writeSportsData(sportsData);
  res.status(200).send('Precio del deporte actualizado exitosamente.');
});

// Ruta para eliminar un deporte
app.delete('/eliminar/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  if (!nombre) {
    return errorHandler(res, 400, 'El nombre del deporte es un campo requerido.');
  }

  let sportsData = readSportsData();
  const index = sportsData.findIndex(deporte => deporte.nombre === nombre);
  if (index === -1) {
    return errorHandler(res, 404, 'Deporte no encontrado.');
  }

  sportsData.splice(index, 1);
  writeSportsData(sportsData);
  res.status(200).send('Deporte eliminado exitosamente.');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
