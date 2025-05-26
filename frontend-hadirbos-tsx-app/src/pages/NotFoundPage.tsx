import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, Search, Clock, ArrowLeft, Users, Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { getCurrentUser } from "../services/authService"

const NotFoundPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setUserRole(user.role)
    }
  }, [])

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (userRole === "admin") {
      navigate("/admin/dashboard")
    } else if (userRole === "employee") {
      navigate("/employee/dashboard")
    } else {
      navigate("/")
    }
  }

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 3,
      ease: "easeInOut",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>

      {/* Floating icons */}
      <motion.div
        className="absolute top-1/4 left-1/4 text-white/20"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 4,
          ease: "easeInOut",
        }}
      >
        <Users size={64} />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4 text-white/20"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3.5,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Calendar size={64} />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/3 text-white/20"
        animate={{
          y: [0, 10, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 5,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Clock size={48} />
      </motion.div>

      <div className="container max-w-4xl mx-auto z-10">
        <div className="bg-white/10 backdrop-filter backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
          <div className="flex flex-col items-center text-center">
            {/* 404 Number */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-100 leading-none">
                505
              </h1>

              {/* Animated search icon */}
              <motion.div
                className="absolute top-1/2 -right-1/2 md:-right-24 transform -translate-y-1/2"
                animate={floatingAnimation}
              >
                <div className="relative">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-blue-600/80 to-indigo-600/80 flex items-center justify-center">
                    <Search className="w-8 h-8 md:w-12 md:h-12 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold md:text-base"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    !
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-8 mb-4">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl mb-8">
                Sepertinya Anda mencari halaman yang tidak ada atau telah dipindahkan. 
                Mari kembali ke halaman utama untuk melanjutkan pengelolaan HR dan kehadiran Anda.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Single "Kembali ke Beranda" button with role-based navigation */}
              <button
                onClick={handleHomeClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Kembali ke Beranda
              </button>

              {/* Show login button only for non-authenticated users */}
              {!userRole && (
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-filter backdrop-blur-sm text-white rounded-full font-bold border border-white/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                  Masuk ke Akun
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Role-based quick links */}
        <motion.div
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {userRole === "admin" ? (
            <>
              <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <h3 className="text-white font-medium mb-2">Dashboard Admin</h3>
                <Link to="/admin/dashboard" className="text-blue-200 hover:text-white transition-colors">
                  Kelola Dashboard
                </Link>
              </div>
              <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <h3 className="text-white font-medium mb-2">Kelola Karyawan</h3>
                <Link to="/admin/add-user" className="text-blue-200 hover:text-white transition-colors">
                  Tambah Karyawan
                </Link>
              </div>
            </>
          ) : userRole === "employee" ? (
            <>
              <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <h3 className="text-white font-medium mb-2">Dashboard Karyawan</h3>
                <Link to="/employee/dashboard" className="text-blue-200 hover:text-white transition-colors">
                  Lihat Dashboard
                </Link>
              </div>
              <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <h3 className="text-white font-medium mb-2">Kehadiran</h3>
                <Link to="/employee/attendance" className="text-blue-200 hover:text-white transition-colors">
                  Catat Kehadiran
                </Link>
              </div>
            </>
          ) : null}
          <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h3 className="text-white font-medium mb-2">Bantuan</h3>
            <Link to="/help" className="text-blue-200 hover:text-white transition-colors">
              Pusat Bantuan
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Add CSS for background pattern */}
      <style>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}

export default NotFoundPage