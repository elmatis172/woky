export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Devoluciones y Cambios
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Política de devolución</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contás con 30 días corridos desde la recepción del producto para solicitar un cambio o devolución.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Condiciones</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>El producto debe estar sin uso</li>
                <li>Debe conservar su embalaje original</li>
                <li>Debe incluir todas las etiquetas</li>
                <li>No debe presentar signos de uso o desgaste</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cómo solicitar una devolución</h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Contactanos por email o WhatsApp</li>
                <li>Indicá el número de orden y el motivo</li>
                <li>Te enviaremos las instrucciones para el retorno</li>
                <li>Una vez recibido, procesamos tu reembolso</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reembolsos</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Los reembolsos se procesan en un plazo de 7-10 días hábiles una vez recibido el producto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
