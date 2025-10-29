export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Contacto
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ¿Tenés alguna consulta? Contactanos por los siguientes medios:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-400">info@wokykids.com</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
              <p className="text-gray-600 dark:text-gray-400">+54 9 11 XXXX-XXXX</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Horario de atención</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lunes a viernes: 9:00 a 18:00 hs<br />
                Sábados: 9:00 a 13:00 hs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
