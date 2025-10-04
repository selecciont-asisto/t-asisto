import { TEST_DATA } from "./utils/constants.js";
import { setCorsHeaders } from "./utils/cors.js";
import { validateApiKey, sendUnauthorizedResponse } from "./utils/auth.js";

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    setCorsHeaders(res);
    return res.status(405).json({ message: "Método no permitido" });
  }

  // Validate API key
  if (!validateApiKey(req)) {
    return sendUnauthorizedResponse(res, setCorsHeaders);
  }

  try {
    const preguntas = TEST_DATA.preguntas.map((question) => ({
      ...question,
      opciones: question.opciones.map(({ puntuacion, ...rest }) => rest),
    }));

    setCorsHeaders(res);
    res.status(200).json({ preguntas });
  } catch (error) {
    console.error("Error al obtener los datos del test:", error);
    setCorsHeaders(res);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}
