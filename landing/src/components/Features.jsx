import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const Features = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const features = [
    {
      icon: '📝',
      title: 'Registro Detallado de Encuentros',
      description: 'Guarda cada encuentro con todos los detalles que importan: fecha, duración, lugar, calificaciones, posiciones, notas personales. Tu historial completo, siempre accesible.'
    },
    {
      icon: '🤖',
      title: 'Análisis Inteligente con IA',
      description: 'La IA analiza tu historial y encuentra patrones que quizás no notaste. Descubre qué funciona mejor, cuándo y con quién. Insights reales basados en tus datos.'
    },
    {
      icon: '💡',
      title: 'Sugerencias Personalizadas',
      description: 'Recibe recomendaciones inteligentes para tus próximos encuentros: mejores momentos, lugares sugeridos, posiciones que podrías probar, todo basado en lo que realmente te funciona.'
    },
    {
      icon: '📊',
      title: 'Estadísticas y Patrones',
      description: 'Visualiza tus datos de forma clara: calificaciones promedio, encuentros más frecuentes, tendencias a lo largo del tiempo. Conoce tus preferencias reales.'
    },
    {
      icon: '👥',
      title: 'Gestión de Tops',
      description: 'Organiza tus contactos con alias personalizados. Ve el historial con cada uno, calificaciones promedio y notas. Todo organizado y fácil de encontrar.'
    },
    {
      icon: '🔒',
      title: 'Privacidad Total',
      description: 'Todo esto sin que Google, Apple o nadie más sepa. Descarga directa, sin tiendas, sin rastreo. Tu información íntima permanece íntima, siempre.'
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
            Todo lo que <span className="gradient-text">Necesitas</span>
          </h2>
          <p className="section-description">
            Registra, analiza y mejora tus encuentros con inteligencia artificial. Todo privado, todo tuyo.
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

