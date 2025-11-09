import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const Hero = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section className="hero" ref={ref}>
      <div className="hero-gradient" />
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div
          className="hero-badge"
          variants={itemVariants}
        >
          <span className="badge-dot" />
          <span>100% Privado y Seguro</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          variants={itemVariants}
        >
          <span className="gradient-text">Lorei Encounters</span>
          <br />
          Tu historial íntimo con
          <br />
          <span className="highlight">análisis IA y sugerencias</span>
        </motion.h1>

        <motion.p
          className="hero-description"
          variants={itemVariants}
        >
          Registra cada encuentro, analiza patrones y recibe sugerencias personalizadas.
          <br />
          <strong>Todo privado. Sin tiendas. Sin rastreo.</strong>
          <br />
          Tu información íntima nunca pasa por servidores de terceros.
        </motion.p>

        <motion.div
          className="hero-cta"
          variants={itemVariants}
        >
          <motion.a
            href="#download"
            className="cta-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Descargar APK</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3V17M10 17L4 11M10 17L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>
          <motion.a
            href="#features"
            className="cta-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Conocer más
          </motion.a>
        </motion.div>

        <motion.div
          className="hero-stats"
          variants={itemVariants}
        >
          <div className="stat-item">
            <div className="stat-number">📝</div>
            <div className="stat-label">Historial Completo</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">🤖</div>
            <div className="stat-label">Análisis IA</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">🔒</div>
            <div className="stat-label">100% Privado</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-indicator"
        animate={{
          y: [0, 10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  )
}

export default Hero

