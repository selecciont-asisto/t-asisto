import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'No se proporcionó un ID de candidato.' });
    }

    const db = admin.firestore();
    const candidateRef = db.collection('candidates').doc(id);
    const doc = await candidateRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Candidato no encontrado.' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    console.error('Error al obtener el candidato individual:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
