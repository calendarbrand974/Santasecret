import { prisma } from './prisma'

export type EmailTemplate = 
  | 'invitation'
  | 'assignment_revealed'
  | 'wishlist_updated'
  | 'reminder_14d'
  | 'reminder_7d'
  | 'reminder_2d'
  | 'password_reset'
  | 'magic_link'

interface EmailOptions {
  to: string
  template: EmailTemplate
  data?: Record<string, any>
  userId?: string
}

/**
 * Envoie un email (mock en dev, réel en prod via Brevo)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, template, data = {}, userId } = options
  
  // En dev, on mock l'envoi si EMAIL_PROVIDER est 'mock' ou non défini
  if (process.env.EMAIL_PROVIDER === 'mock' || !process.env.EMAIL_PROVIDER) {
    console.log(`[EMAIL MOCK] To: ${to}, Template: ${template}`, data)
    
    // Log dans la base de données
    await prisma.emailLog.create({
      data: {
        to,
        template,
        payload: data,
        status: 'sent',
        sentAt: new Date(),
        userId,
      },
    })
    
    return true
  }
  
  // Envoi réel via Brevo
  if (process.env.EMAIL_PROVIDER === 'brevo') {
    try {
      const brevoApiKey = process.env.BREVO_API_KEY
      if (!brevoApiKey) {
        console.error('[EMAIL] BREVO_API_KEY non définie')
        await prisma.emailLog.create({
          data: {
            to,
            template,
            payload: data,
            status: 'failed',
            userId,
          },
        })
        return false
      }
      
      // Importer Brevo (CommonJS)
      const brevo = require('@getbrevo/brevo')
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevoApiKey, 'api-key')
      
      // Générer le contenu de l'email
      const { subject, html } = getEmailContent(template, data)
      
      // Définir l'expéditeur (doit être vérifié dans Brevo)
      const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@example.com'
      const senderName = process.env.BREVO_SENDER_NAME || 'Secret Santa'
      
      // Envoyer l'email
      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.sender = { email: senderEmail, name: senderName }
      sendSmtpEmail.to = [{ email: to }]
      sendSmtpEmail.subject = subject
      sendSmtpEmail.htmlContent = html
      
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
      
      // Log dans la base de données
      await prisma.emailLog.create({
        data: {
          to,
          template,
          payload: { ...data, brevoMessageId: result.messageId },
          status: 'sent',
          sentAt: new Date(),
          userId,
        },
      })
      
      console.log(`[EMAIL] Email envoyé via Brevo à ${to} (Message ID: ${result.messageId})`)
      return true
    } catch (error: any) {
      console.error('[EMAIL] Erreur lors de l\'envoi via Brevo:', error)
      
      // Log l'erreur dans la base de données
      await prisma.emailLog.create({
        data: {
          to,
          template,
          payload: { ...data, error: error.message },
          status: 'failed',
          userId,
        },
      })
      
      return false
    }
  }
  
  // Si aucun provider valide, log en pending
  console.warn(`[EMAIL] Provider "${process.env.EMAIL_PROVIDER}" non reconnu, email non envoyé`)
  await prisma.emailLog.create({
    data: {
      to,
      template,
      payload: data,
      status: 'pending',
      userId,
    },
  })
  
  return false
}

/**
 * Génère le contenu HTML d'un email selon le template
 */
export function getEmailContent(template: EmailTemplate, data: Record<string, any>): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  switch (template) {
    case 'invitation':
      const openAtDate = data.openAt ? new Date(data.openAt) : null
      const formattedDate = openAtDate 
        ? openAtDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: data.timeZone || 'Europe/Paris',
          })
        : 'bientôt'
      
      return {
        subject: `🎄 Invitation au Secret Santa - ${data.groupName || 'Groupe'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 25%, #0d1a0a 50%, #2d0f0f 75%, #1a0a0a 100%);
              }
              .container {
                background: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 2px solid #0d7d4d;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #0d7d4d;
                font-size: 28px;
                margin: 0 0 10px 0;
              }
              .emoji {
                font-size: 48px;
                margin: 20px 0;
              }
              .content {
                color: #333;
                margin-bottom: 30px;
              }
              .code-box {
                background: linear-gradient(135deg, #0d7d4d 0%, #dc2626 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 30px 0;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 3px;
                box-shadow: 0 4px 15px rgba(13, 125, 77, 0.3);
              }
              .button {
                display: inline-block;
                background: #0d7d4d;
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
                box-shadow: 0 4px 15px rgba(13, 125, 77, 0.3);
                transition: background 0.3s;
              }
              .button:hover {
                background: #0a5d38;
              }
              .info-box {
                background: #f8f9fa;
                border-left: 4px solid #0d7d4d;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-box strong {
                color: #0d7d4d;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
              .steps {
                margin: 20px 0;
              }
              .step {
                margin: 15px 0;
                padding-left: 30px;
                position: relative;
              }
              .step::before {
                content: "🎁";
                position: absolute;
                left: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎄</div>
                <h1>Vous êtes invité(e) au Secret Santa !</h1>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${data.displayName || 'Cher/Chère participant(e)'}</strong>,</p>
                
                <p>Nous sommes ravis de vous inviter à rejoindre le groupe <strong>"${data.groupName || 'Secret Santa'}"</strong> ! 🎅</p>
                
                <div class="code-box">
                  Votre code de participation<br>
                  <span style="font-size: 32px; letter-spacing: 5px;">${data.joinCode || ''}</span>
                </div>
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/?code=${data.joinCode || ''}" class="button">
                    🎁 Rejoindre le groupe
                  </a>
                </div>
                
                ${openAtDate ? `
                <div class="info-box">
                  <strong>📅 Date d'ouverture du tirage :</strong><br>
                  ${formattedDate}
                </div>
                ` : ''}
                
                <div class="steps">
                  <h3 style="color: #0d7d4d; margin-top: 30px;">Comment ça marche ?</h3>
                  <div class="step">
                    <strong>1. Rejoignez le groupe</strong><br>
                    Utilisez votre code de participation ci-dessus
                  </div>
                  <div class="step">
                    <strong>2. Remplissez votre liste de souhaits</strong><br>
                    Indiquez vos envies pour aider votre Secret Santa
                  </div>
                  <div class="step">
                    <strong>3. Attendez l'ouverture du tirage</strong><br>
                    Le tirage s'ouvrira automatiquement à la date prévue
                  </div>
                  <div class="step">
                    <strong>4. Découvrez votre Gâté secret</strong><br>
                    Une fois le tirage ouvert, découvrez à qui vous offrez un cadeau !
                  </div>
                </div>
                
                <p style="margin-top: 30px;">
                  Si vous avez des questions, n'hésitez pas à contacter l'organisateur du groupe.
                </p>
                
                <p style="color: #0d7d4d; font-weight: bold; text-align: center; margin-top: 30px;">
                  🎄 Joyeux Noël ! 🎄
                </p>
              </div>
              
              <div class="footer">
                <p>Cet email a été envoyé automatiquement par le système Secret Santa.</p>
                <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }
    
    case 'assignment_revealed':
      return {
        subject: 'Votre Gâté secret Secret Santa',
        html: `
          <h1>Votre Gâté secret a été révélé !</h1>
          <p>Bonjour ${data.displayName || ''},</p>
          <p>Vous avez découvert votre Gâté secret : <strong>${data.targetName || ''}</strong></p>
          <p><a href="${baseUrl}/app/target">Voir la liste de souhaits</a></p>
        `,
      }
    
    case 'wishlist_updated':
      return {
        subject: 'Liste de souhaits mise à jour',
        html: `
          <h1>Liste de souhaits mise à jour</h1>
          <p>Bonjour ${data.displayName || ''},</p>
          <p>La liste de souhaits de <strong>${data.targetName || ''}</strong> a été mise à jour.</p>
          <p><a href="${baseUrl}/app/target">Voir la liste</a></p>
        `,
      }
    
    case 'password_reset':
      return {
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p><a href="${baseUrl}/reset-password?token=${data.token || ''}">Cliquez ici pour réinitialiser</a></p>
          <p>Ce lien expire dans 1 heure.</p>
        `,
      }
    
    case 'magic_link':
      return {
        subject: 'Lien de connexion',
        html: `
          <h1>Lien de connexion</h1>
          <p>Bonjour,</p>
          <p><a href="${baseUrl}/auth/magic-link/consume?token=${data.token || ''}">Cliquez ici pour vous connecter</a></p>
          <p>Ce lien expire dans 24 heures.</p>
        `,
      }
    
    default:
      return {
        subject: 'Notification Secret Santa',
        html: `<p>${JSON.stringify(data)}</p>`,
      }
  }
}

