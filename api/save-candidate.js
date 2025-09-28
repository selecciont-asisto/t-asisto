import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  // Paso 1: Asegurarse de que la petición sea de tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Paso 2: Obtener los datos del candidato que vienen del formulario
    const candidateData = req.body;

    // Paso 3: Añadir una marca de tiempo del servidor para un registro preciso
    candidateData.serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // Paso 4: Conectarse a la base de datos y guardar la información en una nueva colección "candidates"
    const db = admin.firestore();
    const docRef = await db.collection('candidates').add(candidateData);

    // Paso 5: Responder al navegador con un mensaje de éxito y el ID del nuevo registro
    res.status(200).json({ id: docRef.id, message: 'Candidato guardado exitosamente.' });
  
  } catch (error) {
    console.error('Error al guardar en Firestore:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
  }
}

