export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Envíos
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Zonas de envío</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Realizamos envíos a todo el país a través de nuestros servicios de mensajería.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tiempo de entrega</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>CABA y GBA: 24-48 horas hábiles</li>
                <li>Interior del país: 3-7 días hábiles</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Costos de envío</h3>
              <p className="text-gray-600 dark:text-gray-400">
                El costo de envío se calcula según el destino y el peso del paquete durante el proceso de compra.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Seguimiento</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Una vez despachado tu pedido, recibirás un número de seguimiento para rastrear tu envío.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
