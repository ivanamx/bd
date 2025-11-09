import React from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import Security from './components/Security'
import Comparison from './components/Comparison'
import Download from './components/Download'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import './App.css'

function App() {
  return (
    <div className="app">
      <ParticleBackground />
      <Hero />
      <Features />
      <Security />
      <Comparison />
      <Download />
      <Footer />
    </div>
  )
}

export default App

