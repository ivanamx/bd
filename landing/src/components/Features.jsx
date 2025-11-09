import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const Features = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const features = [
    {
      icon: '🔒',
      title: 'Control Total de Datos',
      description: 'Tus datos nunca salen de tu control. Sin Google Play, sin App Store, sin intermediarios. Descarga directa = Privacidad real.'
    },
    {
      icon: '🚫',
      title: 'Cero Rastreo de Terceros',
      description: 'No hay analytics de Google, Facebook o Apple. No hay cookies. No hay seguimiento. Tu información íntima permanece íntima.'
    },
    {
      icon: '🔐',
      title: 'Encriptación End-to-End',
      description: 'Todos tus registros están encriptados con estándares bancarios. Solo tú tienes las llaves. Ni siquiera nosotros podemos ver tu información.'
    },
    {
      icon: '📱',
      title: 'Sin Servidores de Terceros',
      description: 'Tu servidor, tu control. O elige nuestro servidor privado. Pero nunca pasamos por infraestructura de grandes tech.'
    },
    {
      icon: '📝',
      title: 'Registro Completo y Privado',
      description: 'Registra cada encuentro íntimo con total confianza. Detalles completos, calificaciones, notas. Todo privado, todo tuyo.'
    },
    {
      icon: '🤖',
      title: 'Análisis IA Local',
      description: 'Análisis inteligente que corre en tu dispositivo o servidor privado. Insights sin compartir datos con servicios externos.'
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
    hidden: { y: 50, opacity: 0 },
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
    <section id="features" className="features" ref={ref}>
      <motion.div
        className="features-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2 className="section-title">
            Por Qué Elegir <span className="gradient-text">Descarga Directa</span>
          </h2>
          <p className="section-description">
            No es solo una app. Es tu garantía de que tu información íntima nunca será vendida, rastreada o compartida.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default Features

