import admin from "./firebaseAdmin.js";
import {
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
      const candidateData = req.body;

      candidateData.serverTimestamp =
        admin.firestore.FieldValue.serverTimestamp();

      const db = admin.firestore();
      const docRef = await db.collection("candidates").add(candidateData);

      return res
        .status(200)
        .json({ id: docRef.id, message: "Candidato guardado exitosamente." });
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);

      return res.status(500).json({
        message: "Error interno del servidor al procesar la solicitud.",
      });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
