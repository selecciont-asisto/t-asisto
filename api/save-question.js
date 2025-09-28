import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { candidateId, openQuestions } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'Falta el ID del candidato.' });
    }

    const db = admin.firestore();
    const candidateRef = db.collection('candidates').doc(candidateId);

    // Añadimos las respuestas a las preguntas abiertas al documento del candidato
    await candidateRef.update({
      openQuestions: openQuestions
    });

    res.status(200).json({ message: 'Respuestas guardadas exitosamente.' });

  } catch (error) {
    console.error('Error al guardar las respuestas a las preguntas abiertas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
