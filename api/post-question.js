import admin from "./firebaseAdmin.js";
import { setCorsHeaders } from "../utils/cors.js";
import { validateApiKey, sendUnauthorizedResponse } from "../utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    setCorsHeaders(res);
    return res.status(405).json({ message: "Método no permitido" });
  }

  // Validate API key
  if (!validateApiKey(req)) {
    return sendUnauthorizedResponse(res, setCorsHeaders);
  }

  try {
    const { candidateId, answers } = req.body;

    if (!candidateId) {
      setCorsHeaders(res);
      return res.status(400).json({ message: "Falta el ID del candidato." });
    }

    const db = admin.firestore();
    const candidateRef = db.collection("candidates").doc(candidateId);

    let questionAnswers = {};
    for (const [key, value] of answers) {
      questionAnswers["q" + key] = { answer: value };
    }
    // Añadimos las respuestas a las preguntas abiertas al documento del candidato
    await candidateRef.update({
      openQuestions: {
        questionAnswers,
        submissionTimestamp: new Date().toISOString(),
      },
    });

    setCorsHeaders(res);
    res.status(200).json({ message: "Respuestas guardadas exitosamente." });
  } catch (error) {
    console.error(
      "Error al guardar las respuestas a las preguntas abiertas:",
      error
    );
    setCorsHeaders(res);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}
