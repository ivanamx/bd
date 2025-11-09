import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="footer-brand">
            <h3 className="footer-title">Lorei Encounters</h3>
            <p className="footer-tagline">Privacidad y seguridad en cada encuentro</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Producto</h4>
              <a href="#features">Características</a>
              <a href="#security">Seguridad</a>
              <a href="#download">Descarga</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacidad</a>
              <a href="#terms">Términos</a>
              <a href="#support">Soporte</a>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p>&copy; {new Date().getFullYear()} Lorei Encounters. Todos los derechos reservados.</p>
          <p className="footer-note">Diseñado con privacidad en mente</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

