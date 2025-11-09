import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const Security = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const securityFeatures = [
    {
      icon: '🚫',
      title: 'No en Tiendas = No Rastreo',
      description: 'Google Play y App Store rastrean todo. Nosotros no. Al descargar directo, evitas completamente su infraestructura de seguimiento.'
    },
    {
      icon: '🔐',
      title: 'Encriptación End-to-End',
      description: 'Encriptación de nivel bancario. Tus registros íntimos están protegidos. Ni siquiera nosotros podemos leerlos sin tu permiso.'
    },
    {
      icon: '👑',
      title: 'Control Absoluto',
      description: 'Tú decides dónde se almacenan tus datos. Tu servidor, tu dispositivo, tu control. Elimina todo cuando quieras.'
    },
    {
      icon: '🛡️',
      title: 'Sin Intermediarios',
      description: 'Sin Google Analytics. Sin Firebase. Sin servicios de terceros que puedan acceder a tu información. Privacidad real.'
    },
    {
      icon: '🔑',
      title: 'Tú Eres el Dueño',
      description: 'Tus datos son tuyos. Puedes exportarlos, eliminarlos o moverlos cuando quieras. Sin ataduras, sin condiciones.'
    },
    {
      icon: '⚡',
      title: 'Sin Compromisos',
      description: 'No vendemos datos. No compartimos información. No hacemos acuerdos con terceros. Tu privacidad es nuestra única prioridad.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section id="security" className="security" ref={ref}>
      <div className="security-gradient" />
      <motion.div
        className="security-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2 className="section-title">
            Privacidad <span className="gradient-text">Real</span>
          </h2>
          <p className="section-description">
            Registra tus encuentros más íntimos con total confianza. Sin Google, sin Apple, sin intermediarios. Solo tú y tus datos.
          </p>
        </motion.div>

        <div className="security-grid">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="security-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <div className="security-icon">{feature.icon}</div>
              <h3 className="security-title">{feature.title}</h3>
              <p className="security-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="security-badge"
          variants={itemVariants}
        >
          <div className="badge-icon">🛡️</div>
          <div className="badge-content">
            <h3>La Diferencia Real</h3>
            <p>
              <strong>Apps en tiendas:</strong> Google/Apple rastrean tu uso, venden datos, comparten con terceros.
              <br />
              <strong>Lorei Encounters:</strong> Descarga directa. Cero rastreo. Cero venta de datos. Control total.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Security

