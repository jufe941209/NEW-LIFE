const fmtCOP = (n) => Number(n || 0).toLocaleString('es-CO')

export const imprimirFactura = (factura, detalles = [], productosMap = {}) => {
  const fecha = factura.fecha
    ? new Date(factura.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

  const subtotal = detalles.reduce((s, d) => {
    const precio = Number(d.precio_unitario || 0)
    const desc = Number(d.descuento_porcentaje || 0)
    const cant = Number(d.cantidad || 1)
    return s + precio * (1 - desc / 100) * cant
  }, 0)
  const envio = subtotal > 0 && subtotal < 100000 ? 15000 : 0
  const total = subtotal + envio

  const statusColors = {
    Pagado:    { bg: '#dcfce7', color: '#16a34a' },
    Pendiente: { bg: '#fef9c3', color: '#ca8a04' },
    Cancelado: { bg: '#fee2e2', color: '#dc2626' },
  }
  const sc = statusColors[factura.estado_pago] || statusColors.Pendiente

  const rowsHTML = detalles.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:24px;font-style:italic;">Sin detalles de productos registrados</td></tr>'
    : detalles.map((d, i) => {
        const prod = productosMap[d.codigo_prod]
        const nombre = prod?.nombres || d.codigo_prod || '—'
        const precio = Number(d.precio_unitario || 0)
        const desc = Number(d.descuento_porcentaje || 0)
        const cant = Number(d.cantidad || 1)
        const subtotalLinea = precio * (1 - desc / 100) * cant
        return `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${nombre}${d.codigo_prod ? `<br><small style="color:#9ca3af;font-size:0.75em">${d.codigo_prod}</small>` : ''}</td>
          <td style="text-align:center">${cant}</td>
          <td style="text-align:right">$${fmtCOP(precio)}${desc > 0 ? `<br><small style="color:#16a34a">-${desc}%</small>` : ''}</td>
          <td style="text-align:right;font-weight:700;color:#111">$${fmtCOP(subtotalLinea)}</td>
        </tr>`
      }).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${factura.numero_factura || ''} — NEW LIFE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; }
    .invoice { max-width: 780px; margin: 0 auto; padding: 48px 40px; }

    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 3px solid #28a745; }
    .inv-logo { display: flex; align-items: center; gap: 14px; }
    .inv-logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; flex-shrink: 0; }
    .inv-brand-name { font-size: 2rem; font-weight: 900; color: #28a745; letter-spacing: 3px; line-height: 1; }
    .inv-brand-sub { font-size: 0.7rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
    .inv-id-block { text-align: right; }
    .inv-id-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700; }
    .inv-id-num { font-size: 1.6rem; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin-top: 4px; }
    .inv-id-date { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }

    .inv-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .inv-box { background: #f9fafb; border-radius: 12px; padding: 18px 20px; border-left: 4px solid #28a745; }
    .inv-box-label { font-size: 0.67rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    .inv-box-row { font-size: 0.88rem; color: #374151; line-height: 1.9; }
    .inv-box-val { font-weight: 600; color: #111827; }
    .inv-status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; background: ${sc.bg}; color: ${sc.color}; }

    .inv-table-header { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    thead tr { background: linear-gradient(135deg, #1a1a2e, #16213e); }
    thead th { padding: 12px 14px; text-align: left; color: white; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr { border-bottom: 1px solid #f0f0f0; transition: background 0.1s; }
    tbody td { padding: 12px 14px; color: #374151; vertical-align: middle; }

    .inv-totals { display: flex; justify-content: flex-end; margin: 24px 0 32px; }
    .inv-totals-box { background: #f9fafb; border-radius: 14px; padding: 20px 24px; min-width: 270px; border: 1px solid #e5e7eb; }
    .inv-tot-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: #6b7280; padding: 5px 0; }
    .inv-tot-final { display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 900; color: #1a1a1a; border-top: 2px solid #28a745; padding-top: 12px; margin-top: 8px; }
    .inv-tot-final .amount { color: #28a745; }

    .inv-footer { text-align: center; padding-top: 28px; border-top: 1px solid #e5e7eb; margin-top: 32px; }
    .inv-footer-brand { font-size: 1.05rem; font-weight: 800; color: #28a745; letter-spacing: 2px; margin-bottom: 6px; }
    .inv-footer-text { font-size: 0.8rem; color: #9ca3af; line-height: 1.8; }

    .print-btn-wrap { text-align: center; margin-top: 28px; padding-bottom: 8px; }
    .print-btn { background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 14px 44px; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(40,167,69,0.3); }
    .print-btn:hover { opacity: 0.9; }

    @media print {
      .print-btn-wrap { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="invoice">
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

    <div class="inv-info">
      <div class="inv-box">
        <div class="inv-box-label">Información del Cliente</div>
        <div class="inv-box-row">Cédula: <span class="inv-box-val">${factura.cedula_cli || '—'}</span></div>
        <div class="inv-box-row">Dirección: <span class="inv-box-val">${factura.direccion_envio || '—'}</span></div>
      </div>
      <div class="inv-box">
        <div class="inv-box-label">Detalles de Pago</div>
        <div class="inv-box-row">Método: <span class="inv-box-val">${factura.metodo_pago || '—'}</span></div>
        <div class="inv-box-row">Estado: <span class="inv-status">${factura.estado_pago || '—'}</span></div>
      </div>
    </div>

    <div class="inv-table-header">Productos del Pedido</div>
    <table>
      <thead>
        <tr>
          <th style="text-align:center;width:40px">#</th>
          <th>Producto</th>
          <th style="text-align:center;width:80px">Cant.</th>
          <th style="text-align:right;width:140px">Precio Unit.</th>
          <th style="text-align:right;width:130px">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rowsHTML}</tbody>
    </table>

    ${detalles.length > 0 ? `
    <div class="inv-totals">
      <div class="inv-totals-box">
        <div class="inv-tot-row"><span>Subtotal productos</span><span>$${fmtCOP(subtotal)}</span></div>
        <div class="inv-tot-row"><span>Envío</span><span>${envio === 0 ? '<span style="color:#16a34a;font-weight:600">Gratis</span>' : `$${fmtCOP(envio)}`}</span></div>
        <div class="inv-tot-row"><span>IVA (incluido)</span><span>—</span></div>
        <div class="inv-tot-final"><span>TOTAL</span><span class="amount">$${fmtCOP(total)}</span></div>
      </div>
    </div>
    ` : ''}

    <div class="inv-footer">
      <div class="inv-footer-brand">NEW LIFE</div>
      <div class="inv-footer-text">Gracias por su compra · Juntos construimos un futuro sostenible 🌱</div>
      <div class="inv-footer-text">Productos 100% biodegradables · newlife.com</div>
    </div>

    <div class="print-btn-wrap">
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
    </div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=950,height=800,scrollbars=yes,resizable=yes')
  if (win) {
    win.document.write(html)
    win.document.close()
  } else {
    alert('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.')
  }
}
