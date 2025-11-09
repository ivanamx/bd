import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

const Download = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [showInstructions, setShowInstructions] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const instructions = [
    {
      step: '1',
      title: 'Habilita Fuentes Desconocidas',
      description: 'Ve a Configuración > Seguridad > Fuentes desconocidas y actívala.'
    },
    {
      step: '2',
      title: 'Descarga el APK',
      description: 'Haz clic en el botón de descarga y espera a que se complete.'
    },
    {
      step: '3',
      title: 'Instala la Aplicación',
      description: 'Abre el archivo descargado y sigue las instrucciones de instalación.'
    },
    {
      step: '4',
      title: '¡Listo!',
      description: 'Abre la app, crea tu cuenta y comienza a usar Lorei Encounters.'
    }
  ]

  return (
    <section id="download" className="download" ref={ref}>
      <motion.div
        className="download-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2 className="section-title">
            Descarga <span className="gradient-text">Sin Intermediarios</span>
          </h2>
          <p className="section-description">
            Esta es la única forma de garantizar tu privacidad real. Sin Google Play rastreando. Sin App Store compartiendo datos.
            <br />
            <strong>Descarga directa = Privacidad real.</strong>
          </p>
        </motion.div>

        <motion.div
          className="download-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div className="download-icon">📱</div>
          <h3 className="download-title">Lorei Encounters v1.0.0</h3>
          <p className="download-subtitle">APK para Android</p>
          
          <motion.a
            href="#"
            className="download-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              // Aquí iría la URL real del APK
              alert('URL del APK: Reemplaza esto con la URL real de descarga')
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Descargar APK</span>
          </motion.a>

          <motion.button
            className="instructions-toggle"
            onClick={() => setShowInstructions(!showInstructions)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showInstructions ? 'Ocultar' : 'Mostrar'} Instrucciones
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              animate={{ rotate: showInstructions ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          </motion.button>

          <motion.div
            className="instructions-container"
            initial={false}
            animate={{
              height: showInstructions ? 'auto' : 0,
              opacity: showInstructions ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="instructions-list">
              {instructions.map((instruction, index) => (
                <motion.div
                  key={index}
                  className="instruction-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: showInstructions ? 1 : 0,
                    x: showInstructions ? 0 : -20
                  }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="instruction-step">{instruction.step}</div>
                  <div className="instruction-content">
                    <h4>{instruction.title}</h4>
                    <p>{instruction.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="download-warning"
          variants={itemVariants}
        >
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h4>Por Qué No Estamos en Tiendas</h4>
            <p>
              <strong>Google Play y App Store rastrean todo:</strong> qué apps usas, cuándo, dónde, y venden esos datos.
              <br />
              <strong>Nosotros no.</strong> La descarga directa significa que tu información íntima nunca pasa por sus servidores.
              <br />
              <strong>Esa es la diferencia que pagas:</strong> Privacidad real, no promesas vacías.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Download

