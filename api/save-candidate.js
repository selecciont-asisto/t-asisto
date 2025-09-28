import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { candidateId, testResults } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'Falta el ID del candidato.' });
    }

    const db = admin.firestore();
    const candidateRef = db.collection('candidates').doc(candidateId);

    // Usamos "update" para añadir los resultados del test al documento existente del candidato
    await candidateRef.update({
      psychometricTest: testResults
    });

    res.status(200).json({ message: 'Resultados del test guardados exitosamente.' });
  
  } catch (error) {
    console.error('Error al guardar los resultados del test:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
