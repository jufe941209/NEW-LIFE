import api from './api'

const WOMPI_CHECKOUT = 'https://checkout.wompi.co/p/'

export async function redirigirAPago({ referencia, cliente, redirectUrl }) {
  // El backend calcula el total con IVA (19%) + envío desde la BD — no confiamos en el frontend
  const { data } = await api.post('/pagos/firma', { referencia })
  const { firma, llavePublica, montoCentavos } = data

  // Construir la URL manualmente para evitar que URLSearchParams codifique los
  // dos puntos en nombres de parámetros como signature:integrity y customer-data:*
  // (Wompi espera el carácter literal ':', no '%3A')
  const p = (k, v) => `${k}=${encodeURIComponent(v)}`

  const partes = [
    p('public-key', llavePublica),
    p('currency', 'COP'),
    p('amount-in-cents', String(montoCentavos)),
    p('reference', referencia),
    p('signature:integrity', firma),
    p('redirect-url', redirectUrl),
  ]

  if (cliente?.correo)               partes.push(p('customer-data:email', cliente.correo))
  if (cliente?.nombres)              partes.push(p('customer-data:full-name', cliente.nombres))
  if (cliente?.telefono)             partes.push(p('customer-data:phone-number', cliente.telefono))
  if (cliente?.numero_identificacion) {
    partes.push(p('customer-data:legal-id', cliente.numero_identificacion))
    partes.push(p('customer-data:legal-id-type', 'CC'))
  }

  window.location.href = `${WOMPI_CHECKOUT}?${partes.join('&')}`
}
