import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import './TermsAndConditions.css'

const TermsAndConditions = () => {
  return (
    <div className="terms-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Términos y Condiciones', path: '/terminos' }]}
        title="Términos y Condiciones"
        subtitle="Última actualización: mayo de 2025"
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="terms-card">

              <div className="terms-intro mb-5">
                <p>
                  Bienvenido a <strong>NEW LIFE – Productos Biodegradables</strong>. Al acceder o utilizar nuestra plataforma
                  de comercio electrónico, aceptas cumplir con los presentes Términos y Condiciones. Te recomendamos leerlos
                  detenidamente antes de realizar cualquier compra o registrarte en nuestro sitio.
                </p>
              </div>

              <section className="terms-section">
                <h3><span className="terms-num">1.</span> Definiciones</h3>
                <p>
                  <strong>"Plataforma"</strong> se refiere al sitio web y servicios digitales operados por NEW LIFE.
                  <strong> "Usuario"</strong> es toda persona que accede a la plataforma, con o sin registro.
                  <strong> "Cliente"</strong> es el usuario registrado que realiza compras.
                  <strong> "Productos"</strong> son los bienes biodegradables y ecológicos ofrecidos en el catálogo.
                </p>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">2.</span> Uso de la Plataforma</h3>
                <ul>
                  <li>Debes tener al menos 18 años de edad o contar con la autorización de un representante legal para usar esta plataforma.</li>
                  <li>Te comprometes a proporcionar información veraz, precisa y actualizada durante el registro y proceso de compra.</li>
                  <li>Está prohibido el uso de la plataforma para fines ilícitos, fraudulentos o que perjudiquen a terceros.</li>
                  <li>No puedes intentar acceder sin autorización a sistemas, datos o cuentas de otros usuarios.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">3.</span> Registro y Cuenta de Usuario</h3>
                <ul>
                  <li>Para realizar compras deberás crear una cuenta proporcionando un correo electrónico válido y una contraseña segura.</li>
                  <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                  <li>El proceso de registro incluye verificación por correo electrónico mediante un código de 6 dígitos.</li>
                  <li>NEW LIFE se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">4.</span> Productos y Precios</h3>
                <ul>
                  <li>Todos los precios están expresados en pesos colombianos (COP) e incluyen IVA donde corresponda.</li>
                  <li>Los precios pueden variar sin previo aviso. El precio aplicable es el vigente al momento de confirmar el pedido.</li>
                  <li>Las imágenes de los productos son referenciales y pueden diferir ligeramente del producto real.</li>
                  <li>NEW LIFE no garantiza disponibilidad permanente de todos los productos en catálogo.</li>
                  <li>Los descuentos y promociones son aplicables durante el período indicado y no son acumulables salvo indicación expresa.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">5.</span> Proceso de Compra y Pago</h3>
                <ul>
                  <li>Al confirmar un pedido, el usuario acepta el precio, la cantidad y los términos de entrega asociados.</li>
                  <li>NEW LIFE se reserva el derecho de cancelar pedidos en caso de error en precios o disponibilidad.</li>
                  <li>La factura de compra será generada y enviada al correo registrado una vez procesado el pedido.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">6.</span> Envío y Entrega</h3>
                <ul>
                  <li>Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad logística.</li>
                  <li>NEW LIFE no se hace responsable por demoras ocasionadas por causas de fuerza mayor, fallas en servicios postales o dirección incorrecta proporcionada por el cliente.</li>
                  <li>Al recibir el pedido, el cliente debe verificar que los productos estén en buen estado antes de firmar la guía de entrega.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">7.</span> Devoluciones y Garantías</h3>
                <ul>
                  <li>Se aceptan devoluciones dentro de los 5 días hábiles siguientes a la recepción del producto, siempre que este no haya sido usado y conserve su empaque original.</li>
                  <li>Productos dañados en tránsito deben reportarse dentro de las 24 horas siguientes a la recepción con evidencia fotográfica.</li>
                  <li>No se aceptan devoluciones de productos perecederos o personalizados salvo defecto de fabricación.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">8.</span> Protección de Datos Personales</h3>
                <ul>
                  <li>NEW LIFE recopila y trata datos personales de acuerdo con la Ley 1581 de 2012 de Protección de Datos Personales de Colombia.</li>
                  <li>Los datos recopilados (nombre, correo, teléfono, dirección) son utilizados exclusivamente para la prestación del servicio y comunicaciones relacionadas con tus pedidos.</li>
                  <li>No compartimos tu información personal con terceros sin tu consentimiento, salvo obligación legal.</li>
                  <li>Puedes solicitar la rectificación, actualización o eliminación de tus datos contactándonos directamente.</li>
                </ul>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">9.</span> Propiedad Intelectual</h3>
                <p>
                  Todo el contenido de la plataforma (logotipos, imágenes, textos, diseños) es propiedad de NEW LIFE o sus licenciantes.
                  Queda prohibida su reproducción, distribución o uso comercial sin autorización expresa y por escrito.
                </p>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">10.</span> Limitación de Responsabilidad</h3>
                <p>
                  NEW LIFE no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad
                  de uso de la plataforma. La responsabilidad máxima de NEW LIFE frente al cliente estará limitada al valor del
                  pedido en cuestión.
                </p>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">11.</span> Modificaciones</h3>
                <p>
                  NEW LIFE se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán
                  en vigor desde su publicación en la plataforma. El uso continuado de la plataforma tras la publicación de cambios
                  implica la aceptación de los nuevos términos.
                </p>
              </section>

              <section className="terms-section">
                <h3><span className="terms-num">12.</span> Legislación Aplicable</h3>
                <p>
                  Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será resuelta
                  ante los tribunales competentes del domicilio de NEW LIFE.
                </p>
              </section>

              <div className="terms-footer text-center mt-5">
                <p className="text-muted mb-3">
                  ¿Tienes preguntas sobre nuestros términos? Contáctanos en{' '}
                  <a href="mailto:newlife@biodegradables.com" className="terms-email">newlife@biodegradables.com</a>
                </p>
                <Link to="/register" className="btn btn-success terms-back-btn">
                  <i className="fas fa-arrow-left me-2"></i>Volver al registro
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
