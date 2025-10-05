import admin from "./firebaseAdmin.js";
import {
  QUESTION_DATA,
  setCorsHeaders,
  validateApiKey,
  sendUnauthorizedResponse,
} from "./utils.js";

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (!validateApiKey(req)) {
    return sendUnauthorizedResponse(res);
  }

  if (req.method === "POST") {
    try {
      const { candidateId, answers } = req.body;

      if (!candidateId) {
        return res.status(400).json({ message: "Falta el ID del candidato." });
      }

      const db = admin.firestore();
      const candidateRef = db.collection("candidates").doc(candidateId);

      // Añadimos las respuestas a las preguntas abiertas al documento del candidato
      await candidateRef.update({
        openQuestions: {
          conflicto_experiencia: answers[0][1],
          motivacion_aporte: answers[1][1],
          fortaleza_mejora: answers[2][1],
          submissionTimestamp: new Date().toISOString(),
        },
      });

      return res
        .status(200)
        .json({ message: "Respuestas guardadas exitosamente." });
    } catch (error) {
      console.error(
        "Error al guardar las respuestas a las preguntas abiertas:",
        error
      );

      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json(QUESTION_DATA);
    } catch (error) {
      console.error("Error al obtener los datos de las preguntas:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
