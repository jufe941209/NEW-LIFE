import api from './api'

const WOMPI_CHECKOUT = 'https://checkout.wompi.co/p/'

export async function redirigirAPago({ referencia, montoCentavos, cliente, redirectUrl }) {
  const { data } = await api.post('/pagos/firma', { referencia, montoCentavos })
  const { firma, llavePublica } = data

  const url = new URL(WOMPI_CHECKOUT)
  url.searchParams.set('public-key', llavePublica)
  url.searchParams.set('currency', 'COP')
  url.searchParams.set('amount-in-cents', String(montoCentavos))
  url.searchParams.set('reference', referencia)
  url.searchParams.set('signature:integrity', firma)
  url.searchParams.set('redirect-url', redirectUrl)

  if (cliente?.correo)            url.searchParams.set('customer-data:email', cliente.correo)
  if (cliente?.nombres)           url.searchParams.set('customer-data:full-name', cliente.nombres)
  if (cliente?.telefono)          url.searchParams.set('customer-data:phone-number', cliente.telefono)
  if (cliente?.numero_identificacion) {
    url.searchParams.set('customer-data:legal-id', cliente.numero_identificacion)
    url.searchParams.set('customer-data:legal-id-type', 'CC')
  }

  window.location.href = url.toString()
}
