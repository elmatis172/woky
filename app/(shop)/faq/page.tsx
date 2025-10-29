export default function FAQPage() {
  const faqs = [
    {
      question: "¿Cómo puedo hacer un pedido?",
      answer: "Navegá por nuestro catálogo, agregá productos al carrito y seguí el proceso de checkout. Te pediremos tus datos de envío y luego podrás pagar con Mercado Pago.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos todos los medios de pago de Mercado Pago: tarjetas de débito, crédito, efectivo en puntos de pago y saldo en cuenta.",
    },
    {
      question: "¿Cuánto demora el envío?",
      answer: "Para CABA y GBA: 24-48 horas hábiles. Para el interior del país: 3-7 días hábiles.",
    },
    {
      question: "¿Puedo cambiar mi pedido?",
      answer: "Sí, tenés 30 días corridos desde la recepción para solicitar un cambio o devolución, siempre que el producto esté en perfectas condiciones.",
    },
    {
      question: "¿Cómo sé si mi pedido fue procesado?",
      answer: "Recibirás un email de confirmación con el detalle de tu orden. También podés ver el estado de tu pedido en tu perfil.",
    },
    {
      question: "¿Hacen envíos al interior?",
      answer: "Sí, realizamos envíos a todo el país a través de nuestros servicios de mensajería.",
    },
    {
      question: "¿Los precios incluyen IVA?",
      answer: "Sí, todos nuestros precios incluyen IVA y están expresados en pesos argentinos.",
    },
    {
      question: "¿Puedo retirar mi pedido?",
      answer: "Actualmente solo realizamos envíos a domicilio. No contamos con local para retiro.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Preguntas Frecuentes
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contactanos y con gusto te ayudaremos con tu consulta.
          </p>
        </div>
      </div>
    </div>
  );
}
