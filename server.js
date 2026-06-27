const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que el Frontend se conecte al Backend

// 1. CONEXIÓN A MONGO DB
mongoose.connect('mongodb://localhost:27016/portfolio_ucsc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado exitosamente a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// 2. MODELOS DE DATOS (Mongoose)
// Colección 1: Integrantes
const IntegranteSchema = new mongoose.Schema({
    nombre: String,
    rol: String,
    sobreMi: String,
    habilidades: [String]
});
const Integrante = mongoose.model('Integrante', IntegranteSchema);

// Colección 2: Proyectos (Relacionada con Integrantes)
const ProyectoSchema = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    tecnologias: [String],
    urlGithub: String,
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Integrante' } // Relación ObjectId
});
const Proyecto = mongoose.model('Proyecto', ProyectoSchema);

// Colección 3: Contacto / Mensajes
const MensajeSchema = new mongoose.Schema({
    nombre: String,
    correo: String,
    tipoConsulta: String,
    mensaje: String,
    fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', MensajeSchema);


// 3. RUTAS Y CONTROLADORES (CRUD & Consultas Requeridas)

// --- CRUD INTEGRANTES ---
app.post('/api/integrantes', async (req, res) => {
    try { const nuevo = new Integrante(req.body); await nuevo.save(); res.status(201).json(nuevo); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/integrantes', async (req, res) => {
    // Uso de find() solicitado en la rúbrica
    const lista = await Integrante.find();
    res.json(lista);
});

// --- CRUD PROYECTOS ---
app.post('/api/proyectos', async (req, res) => {
    try { const nuevo = new Proyecto(req.body); await nuevo.save(); res.status(201).json(nuevo); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Consulta con Filtro, Sort y Populate (Garantiza requerimientos de rúbricas)
app.get('/api/proyectos', async (req, res) => {
    try {
        const { tech } = req.query;
        let filtro = {};
        
        // Filtro con operadores si se solicita una tecnología específica
        if (tech) { filtro.tecnologias = { $in: [tech] }; }

        // find() + sort() alfabético por título
        const proyectos = await Proyecto.find(filtro)
                                        .populate('autor')
                                        .sort({ titulo: 1 }); 
        res.json(proyectos);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/proyectos/:id', async (req, res) => {
    const actualizado = await Proyecto.findByIdAndUpdate(req.body._id || req.params.id, req.body, { new: true });
    res.json(actualizado);
});

app.delete('/api/proyectos/:id', async (req, res) => {
    await Proyecto.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Proyecto eliminado con éxito" });
});

// --- CRUD MENSAJES (Formulario) ---
app.post('/api/mensajes', async (req, res) => {
    try { const nuevo = new Mensaje(req.body); await nuevo.save(); res.status(201).json(nuevo); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CONSULTA AVANZADA AGGREGATE ---
// Cuenta cuántos proyectos tiene asignados cada integrante
app.get('/api/reporte-proyectos', async (req, res) => {
    try {
        const reporte = await Proyecto.aggregate([
            { $group: { _id: "$autor", totalProyectos: { $sum: 1 } } }
        ]);
        res.json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Iniciar servidor
app.listen(3000, () => console.log('Servidor Backend corriendo en http://localhost:3000'));