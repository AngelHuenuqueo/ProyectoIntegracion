import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    document.body.classList.add('home-page')
    
    // Función para ocultar el scroll indicator cuando se hace scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      document.body.classList.remove('home-page')
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="bg-black text-white min-h-screen w-full">
      {/* Navbar Agresivo Fitness */}
      <nav className="bg-black/90 backdrop-blur-md py-5 fixed top-0 w-full z-50 border-b-4 border-red-600">
        <div className="w-full px-8 flex justify-center items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-50"></div>
              <svg className="w-10 h-10 text-red-600 relative" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-wider text-white">
                ENERGÍA<span className="text-red-600">TOTAL</span>
              </h1>
              <p className="text-xs text-gray-400 tracking-widest">FITNESS CENTER</p>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-4 items-center">
            <a href="#inicio" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Inicio</a>
            <a href="#servicios" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Clases</a>
            <a href="#membresias" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Membresías</a>
            <a href="#horarios" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Horarios</a>
            <Link 
              to="/login" 
              className="bg-red-600 text-white px-8 py-3 font-black tracking-wider uppercase text-sm hover:bg-red-700 transition-all transform hover:scale-105 clip-path-polygon"
            >
              INICIAR SESIÓN
            </Link>
          </div>

          <button 
            className="md:hidden text-red-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4 space-y-4 border-t-2 border-red-600 pt-4 px-8">
            <a href="#inicio" className="block text-gray-300 hover:text-red-600 transition-colors font-bold uppercase">Inicio</a>
            <a href="#servicios" className="block text-gray-300 hover:text-red-600 transition-colors font-bold uppercase">Clases</a>
            <a href="#membresias" className="block text-gray-300 hover:text-red-600 transition-colors font-bold uppercase">Membresías</a>
            <a href="#horarios" className="block text-gray-300 hover:text-red-600 transition-colors font-bold uppercase">Horarios</a>
            <Link 
              to="/login" 
              className="block bg-red-600 text-white px-6 py-3 font-black text-center uppercase hover:bg-red-700"
            >
              INICIAR SESIÓN
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section - Impactante */}
      <section id="inicio" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden pt-20">
        {/* Background con overlay rojo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop" 
            alt="Gimnasio"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-red-900/30"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Efectos de luz roja */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 px-8 text-left">
          <div className="max-w-4xl">
            <div className="mb-8">
              <div className="inline-block bg-red-600 text-white px-6 py-2 font-black text-sm tracking-widest mb-6 transform -skew-x-12">
                <span className="inline-block transform skew-x-12">NO PAIN, NO GAIN</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none tracking-tight">
              <span className="text-white">DESAFÍA</span><br />
              <span className="text-white">TUS</span>{' '}
              <span className="text-red-600 inline-block transform hover:scale-110 transition-transform">LÍMITES</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl font-medium leading-relaxed">
              El gimnasio más completo de la ciudad. <span className="text-red-600 font-black">Equipamiento de última generación</span>, 
              entrenadores certificados y resultados garantizados.
            </p>
          
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                to="/login" 
                className="group bg-red-600 text-white px-12 py-5 font-black text-lg tracking-wider uppercase hover:bg-red-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">COMIENZA AHORA</span>
                <svg className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>
              
              <a 
                href="#servicios" 
                className="border-4 border-red-600 text-white px-12 py-5 font-black text-lg tracking-wider uppercase hover:bg-red-600 transition-all transform hover:scale-105 text-center"
              >
                VER CLASES
              </a>
            </div>

            {/* Stats agresivos */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-red-600 mb-2">2K+</div>
                <div className="text-gray-400 font-bold uppercase text-sm tracking-wide">Miembros</div>
              </div>
              <div className="text-center border-l border-r border-red-600/30">
                <div className="text-5xl md:text-6xl font-black text-red-600 mb-2">100+</div>
                <div className="text-gray-400 font-bold uppercase text-sm tracking-wide">Clases/Mes</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-red-600 mb-2">15+</div>
                <div className="text-gray-400 font-bold uppercase text-sm tracking-wide">Años</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-500">
            <div className="flex flex-col items-center gap-2 text-gray-400 animate-bounce">
              <span className="text-xs font-bold uppercase tracking-wider">Scroll</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-24 px-8 bg-black relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-red-600 text-white px-6 py-2 font-black text-sm tracking-widest mb-6 transform -skew-x-12">
              <span className="inline-block transform skew-x-12">ENTRENA DURO</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              NUESTRAS <span className="text-red-600">CLASES</span>
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto font-medium">
              Programas intensivos diseñados para destruir tus límites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "CROSSFIT",
                description: "Entrenamiento funcional de alta intensidad. Fuerza, resistencia y velocidad combinadas.",
                icon: (
                  <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                ),
                intensity: "EXTREMO"
              },
              {
                title: "HIIT",
                description: "Intervalos de alta intensidad. Quema grasa y construye músculo en tiempo récord.",
                icon: (
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                intensity: "ALTO"
              },
              {
                title: "SPINNING",
                description: "Ciclismo indoor con música motivadora. Resistencia cardiovascular al máximo.",
                icon: (
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                intensity: "MEDIO"
              },
              {
                title: "COMBAT",
                description: "Técnicas de boxeo y artes marciales. Libera adrenalina y gana fuerza explosiva.",
                icon: (
                  <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.94-6.5-4.35-6.5-8.5V8.3l6.5-3.35 6.5 3.35v3.7c0 4.15-2.64 7.56-6.5 8.5z"/>
                  </svg>
                ),
                intensity: "ALTO"
              }
            ].map((clase, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-b from-gray-900 to-black p-8 border-2 border-gray-800 hover:border-red-600 transition-all duration-300 hover:transform hover:scale-105 relative overflow-hidden"
              >
                {/* Efecto hover rojo */}
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all duration-300"></div>
                
                {/* Badge de intensidad */}
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-black tracking-wider">
                  {clase.intensity}
                </div>

                <div className="relative z-10">
                  <div className="text-red-600 mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {clase.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-white group-hover:text-red-600 transition-colors tracking-wide">
                    {clase.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {clase.description}
                  </p>
                  
                  <Link 
                    to="/login"
                    className="inline-block text-red-600 font-bold uppercase text-sm tracking-wider hover:text-white transition-colors group/btn"
                  >
                    RESERVA AHORA
                    <svg className="w-4 h-4 inline-block ml-2 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA adicional */}
          <div className="text-center mt-16">
            <Link 
              to="/login"
              className="inline-block bg-red-600 text-white px-12 py-5 font-black text-lg tracking-wider uppercase hover:bg-red-700 transition-all transform hover:scale-105"
            >
              VER TODOS LOS HORARIOS
            </Link>
          </div>
        </div>
      </section>

      {/* Membresías Section - NUEVO */}
      <section id="membresias" className="py-24 px-8 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-red-600 text-white px-6 py-2 font-black text-sm tracking-widest mb-6 transform -skew-x-12">
              <span className="inline-block transform skew-x-12">INVIERTE EN TI</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              MEMBRESÍAS <span className="text-red-600">PREMIUM</span>
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto font-medium">
              Elige el plan que se adapte a tus objetivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan BÁSICO */}
            <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2 text-white uppercase tracking-wider text-center">BÁSICO</h3>
                <div className="mb-8 text-center">
                  <span className="text-5xl font-black text-red-600">$599</span>
                  <span className="text-gray-400 font-bold">/MES</span>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso completo al gimnasio</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Zona de cardio y pesas</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Vestuarios y lockers</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-400">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clases grupales limitadas</span>
                  </li>
                </ul>

                <Link 
                  to="/login"
                  className="block w-full text-center bg-gray-800 text-white px-8 py-4 font-black tracking-wider uppercase hover:bg-red-600 transition-all"
                >
                  SELECCIONAR
                </Link>
              </div>
            </div>

            {/* Plan PRO - DESTACADO */}
            <div className="bg-gradient-to-b from-red-900 to-black p-10 border-4 border-red-600 hover:border-red-500 transition-all duration-300 relative group transform scale-105 shadow-2xl shadow-red-600/20">
              <div className="absolute -top-3 -right-3 bg-red-600 text-white px-8 py-2 font-black text-xs tracking-widest transform rotate-12 shadow-lg z-20">
                ⭐ POPULAR
              </div>
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2 text-white uppercase tracking-wider text-center">PRO</h3>
                <div className="mb-8 text-center">
                  <span className="text-5xl font-black text-red-600">$999</span>
                  <span className="text-gray-300 font-bold">/MES</span>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-gray-200">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Todo del plan Básico</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Clases grupales ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Asesoría nutricional básica</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-200">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Invitado gratis mensual</span>
                  </li>
                </ul>

                <Link 
                  to="/login"
                  className="block w-full text-center bg-red-600 text-white px-8 py-4 font-black tracking-wider uppercase hover:bg-red-700 transition-all"
                >
                  SELECCIONAR
                </Link>
              </div>
            </div>

            {/* Plan ELITE */}
            <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2 text-white uppercase tracking-wider text-center">ELITE</h3>
                <div className="mb-8 text-center">
                  <span className="text-5xl font-black text-red-600">$1499</span>
                  <span className="text-gray-400 font-bold">/MES</span>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Todo del plan Pro</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Entrenamiento personal (4 sesiones)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Plan nutricional personalizado</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso VIP y estacionamiento</span>
                  </li>
                </ul>

                <Link 
                  to="/login"
                  className="block w-full text-center bg-gray-800 text-white px-8 py-4 font-black tracking-wider uppercase hover:bg-red-600 transition-all"
                >
                  SELECCIONAR
                </Link>
              </div>
            </div>
          </div>

          {/* Garantía */}
          <div className="text-center mt-16 max-w-3xl mx-auto p-8 border-2 border-red-600/30 bg-red-600/5">
            <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.94-6.5-4.35-6.5-8.5V8.3l6.5-3.35 6.5 3.35v3.7c0 4.15-2.64 7.56-6.5 8.5z"/>
            </svg>
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">Garantía de 30 Días</h3>
            <p className="text-gray-300">
              Si no estás completamente satisfecho con tu membresía en los primeros 30 días, te devolvemos tu dinero. Sin preguntas.
            </p>
          </div>
        </div>
      </section>

      {/* Horarios Section */}
      <section id="horarios" className="py-24 px-8 bg-black relative">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-600 text-white px-6 py-2 font-black text-sm tracking-widest mb-6 transform -skew-x-12">
              <span className="inline-block transform skew-x-12">SIEMPRE ABIERTO</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              HORARIOS <span className="text-red-600">24/7</span>
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto font-medium">
              Entrena cuando quieras, a tu ritmo y en tu tiempo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black p-10 border-2 border-red-600 hover:border-red-500 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all"></div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-8 text-red-600 uppercase tracking-wide">LUNES - VIERNES</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-800">
                    <span className="text-gray-300 font-bold uppercase tracking-wide">Mañana</span>
                    <span className="text-white font-black text-xl">6:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-800">
                    <span className="text-gray-300 font-bold uppercase tracking-wide">Tarde</span>
                    <span className="text-white font-black text-xl">2:00 PM - 10:00 PM</span>
                  </div>
                </div>
                <div className="mt-8 p-5 bg-gradient-to-r from-red-900/40 to-red-600/20 border-l-4 border-red-600 rounded-r-lg">
                  <p className="text-sm text-white font-bold">
                    <span className="text-red-400 font-black uppercase tracking-wider">📅 Clases grupales:</span> <span className="text-gray-200">Cada hora en punto</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black p-10 border-2 border-red-600 hover:border-red-500 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all"></div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-8 text-red-600 uppercase tracking-wide">FIN DE SEMANA</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-800">
                    <span className="text-gray-300 font-bold uppercase tracking-wide">Mañana</span>
                    <span className="text-white font-black text-xl">8:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-800">
                    <span className="text-gray-300 font-bold uppercase tracking-wide">Tarde</span>
                    <span className="text-white font-black text-xl">4:00 PM - 8:00 PM</span>
                  </div>
                </div>
                <div className="mt-8 p-5 bg-gradient-to-r from-red-900/40 to-red-600/20 border-l-4 border-red-600 rounded-r-lg">
                  <p className="text-sm text-white font-bold">
                    <span className="text-red-400 font-black uppercase tracking-wider">🎯 Clases especiales:</span> <span className="text-gray-200">Sábados y Domingos</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-8 bg-gradient-to-b from-gray-900 to-black border-2 border-red-600/50 hover:border-red-600 transition-all group">
              <div className="text-6xl font-black text-red-600 mb-3 group-hover:scale-110 transition-transform">50+</div>
              <div className="text-white font-black uppercase text-sm tracking-wider">Clases Semanales</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-gray-900 to-black border-2 border-red-600/50 hover:border-red-600 transition-all group">
              <div className="text-6xl font-black text-red-600 mb-3 group-hover:scale-110 transition-transform">15+</div>
              <div className="text-white font-black uppercase text-sm tracking-wider">Instructores</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-gray-900 to-black border-2 border-red-600/50 hover:border-red-600 transition-all group">
              <div className="text-6xl font-black text-red-600 mb-3 group-hover:scale-110 transition-transform">20+</div>
              <div className="text-white font-black uppercase text-sm tracking-wider">Tipos de Clases</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-8 bg-gradient-to-br from-red-900 via-red-600 to-black relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute top-10 left-10 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white transform rotate-45"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white transform -rotate-12"></div>
        </div>

        <div className="text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
            ¿LISTO PARA EL <br />
            <span className="text-black">CAMBIO?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 font-bold max-w-3xl mx-auto text-white/90">
            Únete a nuestra comunidad y comienza tu transformación HOY MISMO
          </p>
          <Link 
            to="/login" 
            className="inline-block bg-black text-white px-16 py-6 text-xl font-black hover:bg-gray-900 hover:scale-110 transition-all duration-200 shadow-2xl uppercase tracking-wider border-4 border-white"
          >
            RESERVA TU PRIMERA CLASE
          </Link>
        </div>

        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
      </section>

      {/* Footer - Rediseñado */}
      <footer id="contacto" className="bg-black text-white py-16 px-8 border-t-4 border-red-600">
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-50"></div>
                  <svg className="w-12 h-12 text-red-600 relative" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-black tracking-wider">
                    ENERGÍA<span className="text-red-600">TOTAL</span>
                  </span>
                  <p className="text-xs text-gray-400 tracking-widest">FITNESS CENTER</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Tu gimnasio de confianza para alcanzar tus metas fitness y transformar tu vida.
              </p>
              
              {/* Redes sociales */}
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-900 border-2 border-red-600 flex items-center justify-center hover:bg-red-600 transition-all">
                  <span className="text-white font-bold">F</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-900 border-2 border-red-600 flex items-center justify-center hover:bg-red-600 transition-all">
                  <span className="text-white font-bold">IG</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-900 border-2 border-red-600 flex items-center justify-center hover:bg-red-600 transition-all">
                  <span className="text-white font-bold">TW</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-black mb-6 text-red-600 uppercase tracking-wide">NAVEGACIÓN</h4>
              <ul className="space-y-3">
                <li><a href="#inicio" className="text-gray-400 hover:text-red-600 transition-colors font-medium uppercase text-sm tracking-wide">Inicio</a></li>
                <li><a href="#servicios" className="text-gray-400 hover:text-red-600 transition-colors font-medium uppercase text-sm tracking-wide">Clases</a></li>
                <li><a href="#horarios" className="text-gray-400 hover:text-red-600 transition-colors font-medium uppercase text-sm tracking-wide">Horarios</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-red-600 transition-colors font-medium uppercase text-sm tracking-wide">Iniciar Sesión</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-black mb-6 text-red-600 uppercase tracking-wide">CLASES</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="uppercase text-sm tracking-wide">CrossFit</li>
                <li className="uppercase text-sm tracking-wide">HIIT</li>
                <li className="uppercase text-sm tracking-wide">Spinning</li>
                <li className="uppercase text-sm tracking-wide">Combat</li>
                <li className="uppercase text-sm tracking-wide">Yoga</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-black mb-6 text-red-600 uppercase tracking-wide">CONTACTO</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">(123) 456-7890</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">info@energiatotal.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Av. Principal #123<br />Ciudad, País</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-red-600/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 font-medium">&copy; 2025 <span className="text-red-600 font-black">ENERGÍATOTAL</span>. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-red-600 transition-colors font-medium uppercase tracking-wide">Privacidad</a>
              <a href="#" className="hover:text-red-600 transition-colors font-medium uppercase tracking-wide">Términos</a>
              <a href="#" className="hover:text-red-600 transition-colors font-medium uppercase tracking-wide">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
