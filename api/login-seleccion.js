export default async function handler(req, res) {
  // Solo permitir peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { password } = req.body;

  // Contraseña de acceso al portal de selección.
  // IMPORTANTE: Para mayor seguridad en producción, esta contraseña debería ser una variable de entorno.
  const ADMIN_PASSWORD = process.env.SELECTION_PORTAL_PASSWORD || "T-asisto#2025";

  if (password === ADMIN_PASSWORD) {
    // Si la contraseña es correcta, se responde con éxito.
    // El frontend (login-seleccionados.html) guardará la "llave" de sesión.
    res.status(200).json({ success: true, message: 'Autenticación exitosa.' });
  } else {
    // Si la contraseña es incorrecta, se responde con un error.
    res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }
}
