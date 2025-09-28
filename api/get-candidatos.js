import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const db = admin.firestore();
    // 1. Obtenemos los candidatos sin ordenar desde Firestore.
    const snapshot = await db.collection('candidates').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const candidatos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 2. Ordenamos los candidatos por fecha en el servidor usando JavaScript.
    candidatos.sort((a, b) => {
      const dateA = a.serverTimestamp.toDate();
      const dateB = b.serverTimestamp.toDate();
      return dateB - dateA; // Orden descendente (más nuevos primero)
    });

    res.status(200).json(candidatos);

  } catch (error) {
    console.error('Error al obtener los candidatos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

