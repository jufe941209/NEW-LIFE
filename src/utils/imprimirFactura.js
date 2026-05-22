const fmtCOP = (n) => Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const IVA = 0.19

export const imprimirFactura = (factura, detalles = [], productosMap = {}, clienteData = null) => {
  const fecha = factura.fecha
    ? new Date(factura.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

  // Totales
  let subtotalBase = 0
  let totalDescuento = 0
  detalles.forEach(d => {
    const precio = Number(d.precio_unitario || 0)
    const desc = Number(d.descuento_porcentaje || 0)
    const cant = Number(d.cantidad || 1)
    subtotalBase += precio * cant
    totalDescuento += precio * cant * (desc / 100)
  })
  const subtotalNeto = subtotalBase - totalDescuento
  const totalIva = subtotalNeto * IVA
  const envio = subtotalNeto > 0 && subtotalNeto < 100000 ? 15000 : 0
  const total = subtotalNeto + totalIva + envio

  const statusColors = {
    Pagado:    { bg: '#dcfce7', color: '#16a34a' },
    Pendiente: { bg: '#fef9c3', color: '#ca8a04' },
    Cancelado: { bg: '#fee2e2', color: '#dc2626' },
  }
  const sc = statusColors[factura.estado_pago] || statusColors.Pendiente

  const rowsHTML = detalles.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:24px;font-style:italic;">Sin detalles de productos registrados</td></tr>'
    : detalles.map((d, i) => {
        const prod = productosMap[d.codigo_prod]
        const nombre = prod?.nombres || '—'
        const codigo = d.codigo_prod || ''
        const precio = Number(d.precio_unitario || 0)
        const desc = Number(d.descuento_porcentaje || 0)
        const cant = Number(d.cantidad || 1)
        const lineaNeta = precio * cant * (1 - desc / 100)
        const ivaLinea = lineaNeta * IVA
        const totalLinea = lineaNeta + ivaLinea
        return `<tr>
          <td style="text-align:center;color:#6b7280">${i + 1}</td>
          <td>
            <div style="font-weight:600;color:#111">${nombre}</div>
            <div style="font-size:0.73em;color:#9ca3af;margin-top:2px">${codigo}</div>
          </td>
          <td style="text-align:right">$${fmtCOP(precio)}</td>
          <td style="text-align:center;color:${desc > 0 ? '#16a34a' : '#9ca3af'};font-weight:${desc > 0 ? 700 : 400}">${desc > 0 ? desc + '%' : '—'}</td>
          <td style="text-align:right;color:#6366f1">$${fmtCOP(ivaLinea)}</td>
          <td style="text-align:center;font-weight:600">${cant}</td>
          <td style="text-align:right;font-weight:700;color:#111">$${fmtCOP(totalLinea)}</td>
        </tr>`
      }).join('')

  const cli = clienteData
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${factura.numero_factura || ''} — NEW LIFE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 14px; }
    .invoice { max-width: 820px; margin: 0 auto; padding: 44px 40px; }

    /* Header */
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 22px; border-bottom: 3px solid #28a745; }
    .inv-logo { display: flex; align-items: center; gap: 14px; }
    .inv-logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; flex-shrink: 0; }
    .inv-brand-name { font-size: 1.9rem; font-weight: 900; color: #28a745; letter-spacing: 3px; line-height: 1; }
    .inv-brand-sub { font-size: 0.68rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .inv-id-block { text-align: right; }
    .inv-id-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700; }
    .inv-id-num { font-size: 1.5rem; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin-top: 3px; }
    .inv-id-date { font-size: 0.84rem; color: #6b7280; margin-top: 3px; }

    /* Info boxes */
    .inv-info { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 28px; }
    .inv-box { background: #f9fafb; border-radius: 12px; padding: 16px 18px; border-left: 4px solid #28a745; }
    .inv-box-label { font-size: 0.64rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    .inv-box-row { font-size: 0.86rem; color: #374151; line-height: 1.85; display: flex; gap: 4px; }
    .inv-box-key { color: #9ca3af; flex-shrink: 0; }
    .inv-box-val { font-weight: 600; color: #111827; word-break: break-word; }
    .inv-status { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; background: ${sc.bg}; color: ${sc.color}; }

    /* Table */
    .inv-table-label { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
    thead tr { background: linear-gradient(135deg, #1a1a2e, #16213e); }
    thead th { padding: 11px 13px; text-align: left; color: white; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody td { padding: 11px 13px; color: #374151; vertical-align: middle; }

    /* Totals */
    .inv-totals { display: flex; justify-content: flex-end; margin: 22px 0 28px; }
    .inv-totals-box { background: #f9fafb; border-radius: 14px; padding: 18px 22px; min-width: 290px; border: 1px solid #e5e7eb; }
    .inv-tot-row { display: flex; justify-content: space-between; font-size: 0.86rem; color: #6b7280; padding: 4px 0; }
    .inv-tot-row.discount { color: #16a34a; }
    .inv-tot-row.iva { color: #6366f1; }
    .inv-tot-sep { border-top: 1px solid #e5e7eb; margin: 8px 0; }
    .inv-tot-final { display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 900; color: #1a1a1a; border-top: 2px solid #28a745; padding-top: 11px; margin-top: 6px; }
    .inv-tot-final .amount { color: #28a745; }

    /* Terms */
    .inv-terms { background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 18px; margin-bottom: 28px; }
    .inv-terms-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #92400e; margin-bottom: 6px; }
    .inv-terms-text { font-size: 0.8rem; color: #78350f; line-height: 1.6; }

    /* Footer */
    .inv-footer { text-align: center; padding-top: 22px; border-top: 1px solid #e5e7eb; }
    .inv-footer-brand { font-size: 1rem; font-weight: 800; color: #28a745; letter-spacing: 2px; margin-bottom: 5px; }
    .inv-footer-text { font-size: 0.78rem; color: #9ca3af; line-height: 1.8; }

    .print-btn-wrap { text-align: center; margin-top: 26px; padding-bottom: 6px; }
    .print-btn { background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 13px 40px; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(40,167,69,0.3); }

    @media print {
      .print-btn-wrap { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="invoice">

    <!-- Header -->
    <div class="inv-header">
      <div class="inv-logo">
        <div class="inv-logo-icon">🌿</div>
        <div>
          <div class="inv-brand-name">NEW LIFE</div>
          <div class="inv-brand-sub">Productos Biodegradables</div>
        </div>
      </div>
      <div class="inv-id-block">
        <div class="inv-id-label">Factura de Venta</div>
        <div class="inv-id-num">${factura.numero_factura || '—'}</div>
        <div class="inv-id-date">${fecha}</div>
      </div>
    </div>

    <!-- Info boxes -->
    <div class="inv-info">
      <div class="inv-box">
        <div class="inv-box-label">Información del Cliente</div>
        <div class="inv-box-row"><span class="inv-box-key">Tipo documento:</span><span class="inv-box-val">${cli?.tipo_documento || 'CC'}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">N° Documento:</span><span class="inv-box-val">${factura.cedula_cli || '—'}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">Nombre / Razón social:</span><span class="inv-box-val">${cli?.nombres || '—'}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">Correo:</span><span class="inv-box-val">${cli?.correo || '—'}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">Dirección envío:</span><span class="inv-box-val">${factura.direccion_envio || '—'}</span></div>
        ${cli?.tipo_cliente ? `<div class="inv-box-row"><span class="inv-box-key">Tipo cliente:</span><span class="inv-box-val">${cli.tipo_cliente}</span></div>` : ''}
      </div>
      <div class="inv-box">
        <div class="inv-box-label">Detalles de Pago</div>
        <div class="inv-box-row"><span class="inv-box-key">Fecha:</span><span class="inv-box-val">${fecha}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">Método de pago:</span><span class="inv-box-val">${factura.metodo_pago || '—'}</span></div>
        <div class="inv-box-row"><span class="inv-box-key">Estado:</span><span class="inv-box-val"><span class="inv-status">${factura.estado_pago || '—'}</span></span></div>
      </div>
    </div>

    <!-- Products table -->
    <div class="inv-table-label">Detalle de Productos</div>
    <table>
      <thead>
        <tr>
          <th style="text-align:center;width:36px">#</th>
          <th>Producto / Código</th>
          <th style="text-align:right;width:110px">Precio Unit.</th>
          <th style="text-align:center;width:80px">Desc.</th>
          <th style="text-align:right;width:110px">IVA 19%</th>
          <th style="text-align:center;width:68px">Cant.</th>
          <th style="text-align:right;width:120px">Total</th>
        </tr>
      </thead>
      <tbody>${rowsHTML}</tbody>
    </table>

    ${detalles.length > 0 ? `
    <div class="inv-totals">
      <div class="inv-totals-box">
        <div class="inv-tot-row"><span>Subtotal base</span><span>$${fmtCOP(subtotalBase)}</span></div>
        ${totalDescuento > 0 ? `<div class="inv-tot-row discount"><span>Descuentos</span><span>- $${fmtCOP(totalDescuento)}</span></div>` : ''}
        <div class="inv-tot-row"><span>Subtotal neto</span><span>$${fmtCOP(subtotalNeto)}</span></div>
        <div class="inv-tot-row iva"><span>IVA 19%</span><span>$${fmtCOP(totalIva)}</span></div>
        <div class="inv-tot-row"><span>Envío</span><span>${envio === 0 ? '<span style="color:#16a34a;font-weight:600">Gratis</span>' : `$${fmtCOP(envio)}`}</span></div>
        <div class="inv-tot-sep"></div>
        <div class="inv-tot-final"><span>TOTAL A PAGAR</span><span class="amount">$${fmtCOP(total)}</span></div>
      </div>
    </div>
    ` : ''}

    <!-- Términos y condiciones -->
    <div class="inv-terms">
      <div class="inv-terms-title">⚖️ Términos y Condiciones</div>
      <div class="inv-terms-text">
        Este documento se asimila en todos sus efectos a una letra de cambio de conformidad con el Art. 774 del Código de Comercio.
        Autorizo que en caso de incumplimiento de esta obligación sea reportado a las centrales de riesgo.
        Se cobrarán intereses por mora según la tasa legal vigente.
      </div>
    </div>

    <!-- Footer -->
    <div class="inv-footer">
      <div class="inv-footer-brand">NEW LIFE</div>
      <div class="inv-footer-text">Gracias por su compra · Juntos construimos un futuro sostenible 🌱</div>
      <div class="inv-footer-text">Productos 100% biodegradables</div>
    </div>

    <div class="print-btn-wrap">
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
    </div>

  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=950,height=820,scrollbars=yes,resizable=yes')
  if (win) {
    win.document.write(html)
    win.document.close()
  } else {
    alert('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.')
  }
}
