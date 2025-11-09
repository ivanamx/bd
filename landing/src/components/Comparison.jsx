import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const Comparison = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const comparisons = [
    {
      feature: 'Rastreo de Datos',
      stores: 'Google/Apple rastrean todo tu uso',
      direct: 'Cero rastreo. Tu información es privada'
    },
    {
      feature: 'Venta de Información',
      stores: 'Tus datos se venden a terceros',
      direct: 'Nunca vendemos. Nunca compartimos'
    },
    {
      feature: 'Servidores de Terceros',
      stores: 'Pasa por infraestructura de Google/Apple',
      direct: 'Tu servidor o nuestro servidor privado'
    },
    {
      feature: 'Control de Datos',
      stores: 'Ellos controlan qué se almacena',
      direct: 'Tú controlas todo. Exporta o elimina cuando quieras'
    },
    {
      feature: 'Analytics y Tracking',
      stores: 'Google Analytics, Firebase, etc.',
      direct: 'Cero analytics. Cero tracking'
    },
    {
      feature: 'Privacidad Real',
      stores: 'Promesas, pero datos compartidos',
      direct: 'Garantía real. Sin compromisos'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  return (
    <section id="comparison" className="comparison" ref={ref}>
      <motion.div
        className="comparison-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2 className="section-title">
            La Diferencia <span className="gradient-text">Real</span>
          </h2>
          <p className="section-description">
            Compara lo que obtienes con apps en tiendas vs. descarga directa
          </p>
        </motion.div>

        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-header-cell feature-header">Característica</div>
            <div className="comparison-header-cell stores-header">
              <span className="header-icon">📱</span>
              Apps en Tiendas
            </div>
            <div className="comparison-header-cell direct-header">
              <span className="header-icon">🔒</span>
              Lorei Encounters
            </div>
          </div>

          {comparisons.map((comparison, index) => (
            <motion.div
              key={index}
              className="comparison-row"
              variants={itemVariants}
            >
              <div className="comparison-cell feature-cell">
                {comparison.feature}
              </div>
              <div className="comparison-cell stores-cell">
                <span className="cross-icon">❌</span>
                {comparison.stores}
              </div>
              <div className="comparison-cell direct-cell">
                <span className="check-icon">✅</span>
                {comparison.direct}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="comparison-cta"
          variants={itemVariants}
        >
          <p className="cta-text">
            <strong>Esa es la diferencia que pagas:</strong> Privacidad real, no promesas vacías.
          </p>
          <motion.a
            href="#download"
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Descargar Ahora
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Comparison

