import admin from "./firebaseAdmin.js";
import {
  BAREMO,
  TEST_DATA,
  setCorsHeaders,
  validateApiKey,
  sendUnauthorizedResponse,
} from "./utils.js";

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (!validateApiKey(req)) {
    return sendUnauthorizedResponse(res);
  }

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { candidateId, answers } = req.body;

      if (!candidateId) {
        return res.status(400).json({ message: "Falta el ID del candidato." });
      }

      let totalScore = 0;
      let questionAnswers = {};
      for (const [key, value] of answers) {
        const puntuacion = TEST_DATA.preguntas.find(
          (pregunta) => pregunta.id === key
        )?.opciones[value].puntuacion;
        totalScore += +puntuacion;
        questionAnswers["q" + key] = { answer: value, puntuacion: puntuacion };
      }

      let resultEvaluation = "No evaluado";
      let finalMessage = "Error al procesar el resultado.";

      for (const level of BAREMO) {
        const [min, max] = level.rango_puntuacion;
        if (totalScore >= min && totalScore <= max) {
          resultEvaluation = level.evaluacion;
          finalMessage = level.mensaje;
          break;
        }
      }

      const testResults = {
        questionAnswers,
        score: totalScore,
        evaluation: resultEvaluation,
        finalMessage,
        submissionTimestamp: new Date().toISOString(),
      };

      const db = admin.firestore();
      const candidateRef = db.collection("candidates").doc(candidateId);

      // Usamos "update" para añadir los resultados del test al documento existente del candidato
      await candidateRef.update({
        psychometricTest: testResults,
      });

      return res.status(200).json({
        resultEvaluation,
        finalMessage,
        message: "Resultados del test guardados exitosamente.",
      });
    } catch (error) {
      console.error("Error al guardar los resultados del test:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  if (req.method === "GET") {
    try {
      const preguntas = TEST_DATA.preguntas.map((question) => ({
        ...question,
        opciones: question.opciones.map(({ puntuacion, ...rest }) => rest),
      }));

      return res.status(200).json({ preguntas });
    } catch (error) {
      console.error("Error al obtener los datos del test:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
