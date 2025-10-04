import admin from "./firebaseAdmin.js";
import { BAREMO, TEST_DATA } from "./utils/constants.js";
import { setCorsHeaders } from "./utils/cors.js";
import { validateApiKey, sendUnauthorizedResponse } from "./utils/auth.js";

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(200).end();
  }

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
    console.log("💀 ~ handler ~ answers:", answers);

    if (!candidateId) {
      setCorsHeaders(res);
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

    setCorsHeaders(res);
    res.status(200).json({
      resultEvaluation,
      finalMessage,
      message: "Resultados del test guardados exitosamente.",
    });
  } catch (error) {
    console.error("Error al guardar los resultados del test:", error);
    setCorsHeaders(res);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}
