const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const math = require('mathjs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Función para validar la matriz estocástica
function validarMatrizEstocastica(matriz) {
    return matriz.every(fila => {
        const suma = fila.reduce((a, b) => a + b, 0);
        return Math.abs(suma - 1) < 1e-10 && fila.every(valor => valor >= 0 && valor <= 1);
    });
}

// Función para validar el vector inicial
function validarVectorInicial(vector, n) {
    const suma = vector.reduce((a, b) => a + b, 0);
    return vector.length === n && Math.abs(suma - 1) < 1e-10 && vector.every(valor => valor >= 0 && valor <= 1);
}

// Endpoint para proyección de estados
app.post('/api/proyeccion', (req, res) => {
    try {
        const { matriz, vector, pasos } = req.body;
        
        // Validaciones
        if (!validarMatrizEstocastica(matriz)) {
            return res.status(400).json({ error: 'La matriz no es estocástica' });
        }
        
        if (!validarVectorInicial(vector, matriz.length)) {
            return res.status(400).json({ error: 'El vector inicial no es válido' });
        }

        // Cálculos
        const P = math.matrix(matriz);
        const P_t = math.pow(P, pasos);
        const resultado = math.multiply(vector, P_t);

        res.json({
            matrizResultante: P_t.toArray(),
            distribucionFinal: resultado.toArray()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para estados absorbentes
app.post('/api/absorbentes', (req, res) => {
    try {
        const { matriz } = req.body;
        
        if (!validarMatrizEstocastica(matriz)) {
            return res.status(400).json({ error: 'La matriz no es estocástica' });
        }

        // Identificar estados absorbentes
        const estadosAbsorbentes = matriz.map((fila, i) => {
            return fila[i] === 1 && fila.every((val, j) => j === i || val === 0);
        });

        // Reordenar matriz en forma canónica
        const n = matriz.length;
        const absorbentes = estadosAbsorbentes.map((esAbsorbente, i) => ({ esAbsorbente, indice: i }));
        const ordenados = [...absorbentes].sort((a, b) => (a.esAbsorbente === b.esAbsorbente) ? 0 : a.esAbsorbente ? 1 : -1);
        
        const matrizReordenada = ordenados.map(o => 
            ordenados.map(p => matriz[o.indice][p.indice])
        );

        // Calcular matriz fundamental N
        const numTransitorios = estadosAbsorbentes.filter(x => !x).length;
        const Q = matrizReordenada.slice(0, numTransitorios).map(fila => fila.slice(0, numTransitorios));
        const I = math.identity(numTransitorios);
        const N = math.inv(math.subtract(I, Q));

        // Calcular probabilidades de absorción
        const R = matrizReordenada.slice(0, numTransitorios).map(fila => fila.slice(numTransitorios));
        const B = math.multiply(N, R);

        // Calcular tiempos esperados
        const unos = math.ones(numTransitorios, 1);
        const t = math.multiply(N, unos);
        const tiemposEsperados = t.toArray().map(row => row[0]);

        res.json({
            estadosAbsorbentes,
            matrizReordenada,
            matrizFundamental: N.toArray(),
            probabilidadesAbsorcion: B.toArray(),
            tiemposEsperados
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Servidor de la Calculadora de Cadenas de Markov funcionando correctamente.');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
}); 