const admin = require('firebase-admin')
require('dotenv').config()

try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('A variável de ambiente GOOGLE_APPLICATION_CREDENTIALS não está definida.')
  }

  if (!admin.apps.length) {
    admin.initializeApp()
  }
} catch (error) {
  console.error('Falha ao inicializar o Firebase Admin SDK:', error)
}

const db = admin.firestore()

module.exports = { db, admin }
