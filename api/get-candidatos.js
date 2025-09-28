import admin from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('candidates').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const candidatos = snapshot.docs.map(doc => {
      const data = doc.data();
      // Si el timestamp no existe o no es objeto Timestamp, asigna 0
      let submissionTimestampMs = 0;
      if (data.serverTimestamp && typeof data.serverTimestamp.toDate === "function") {
        submissionTimestampMs = data.serverTimestamp.toDate().getTime();
      }
      return {
        id: doc.id,
        ...data,
        submissionTimestamp: submissionTimestampMs
      };
    });

    // Ordena descendente por la fecha en milisegundos
    candidatos.sort((a, b) => b.submissionTimestamp - a.submissionTimestamp);

    res.status(200).json(candidatos);

  } catch (error) {
    console.error('Error al obtener los candidatos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
