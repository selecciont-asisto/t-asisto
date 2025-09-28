import admin from 'firebase-admin';

// Revisa si la app ya está inicializada para prevenir errores
if (!admin.apps.length) {
  try {
    // Lee la variable de entorno Base64 de Vercel
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
      throw new Error('La clave de la cuenta de servicio de Firebase no está configurada en las variables de entorno.');
    }

    // Decodifica la cadena Base64 al JSON original
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    
    // Parsea la cadena JSON a un objeto de JavaScript
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Inicializa el SDK de Firebase Admin con las credenciales decodificadas
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("Firebase Admin SDK inicializado correctamente.");

  } catch (error) {
    console.error("Error inicializando Firebase Admin SDK:", error);
    process.exit(1);
  }
}

// Exporta la instancia de admin para usarla en otras rutas de la API
export default admin;

