import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('candidates').orderBy('serverTimestamp', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const candidatos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(candidatos);

  } catch (error) {
    console.error('Error al obtener los candidatos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
