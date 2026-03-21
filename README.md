# AccountIQ — Application Accounting

Plataforma todo-en-uno de contabilidad inteligente para usuarios personales, freelancers y empresas.

## Estructura del Proyecto

```
application-accounting/
├── index.html          ← Punto de entrada principal
├── css/
│   └── main.css        ← Estilos completos (dark theme profesional)
├── js/
│   ├── data.js         ← Datos de ejemplo y estado de la app
│   ├── charts.js       ← Módulo de gráficas (Chart.js 4)
│   ├── ui.js           ← Renderizado de componentes UI
│   └── app.js          ← Lógica principal, navegación, modales
└── README.md
```

## Cómo usar

1. Abre `index.html` directamente en tu navegador (no requiere servidor).
2. Para desarrollo avanzado, usa un servidor local:
   ```bash
   npx serve .
   # o
   python -m http.server 3000
   ```

## Módulos disponibles

| Módulo           | Descripción |
|------------------|-------------|
| Dashboard        | KPIs, flujo de caja, presupuesto, alertas IA |
| Transacciones    | Registro completo con filtros y exportación CSV |
| Presupuesto      | Sistema "cada peso tiene un propósito" |
| Reportes         | Estado de resultados, balance general, flujo de caja |
| Facturación      | Facturas con seguimiento de cobros |
| Clientes CRM     | Directorio y gestión de relaciones comerciales |
| Inventario       | Control de stock con alertas de reposición |
| Predicciones IA  | Proyecciones Q2 con escenarios múltiples |
| Alertas          | Centro de recomendaciones inteligentes |

## Funcionalidades

- ✅ Dashboard con gráficas interactivas (Chart.js)
- ✅ Gráfica de flujo de caja (bar + line chart)
- ✅ Donut chart de gastos por categoría
- ✅ Sparklines en KPIs
- ✅ Presupuesto inteligente con barras de progreso
- ✅ Tabla de transacciones con filtros
- ✅ Exportación a CSV
- ✅ Módulo de facturación completo
- ✅ CRM de clientes
- ✅ Control de inventario
- ✅ Predicciones IA con 3 escenarios
- ✅ Centro de alertas con recomendaciones
- ✅ Modales para crear registros
- ✅ Sistema de notificaciones (toast)
- ✅ Diseño responsive (mobile/tablet/desktop)
- ✅ Reportes: Estado de resultados, balance, flujo de caja
- ✅ Exportación de reportes (PDF / Excel — botones listos para integrar)

## Tecnología

- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Gráficas**: Chart.js 4.4.1
- **Fuentes**: Syne (headings) + DM Sans (body) vía Google Fonts
- **Sin dependencias de build**: funciona abriendo el HTML directamente

## Próximos pasos para producción

1. **Backend**: Node.js/Express o Python/FastAPI con PostgreSQL
2. **Autenticación**: JWT / OAuth 2.0
3. **API Bancaria**: Integración con Plaid, Belvo (Latinoamérica) o Prometeo
4. **IA real**: Python + Prophet para predicciones de flujo de caja
5. **Multi-empresa**: Tenants separados con roles (admin, contador, usuario)
6. **Facturación electrónica**: Integración con la DIAN (Colombia)
7. **Exportación PDF**: Librería jsPDF o generación server-side

## Monetización SaaS sugerida

| Plan       | Precio    | Incluye |
|------------|-----------|---------|
| Free       | $0/mes    | 1 usuario, 50 transacciones/mes, reportes básicos |
| Pro        | $19/mes   | Multiusuario, IA completa, exportaciones ilimitadas |
| Business   | $49/mes   | ERP completo, facturación electrónica, API |
| Enterprise | $99/mes   | White-label, SLA, soporte dedicado, contador asignado |

---
Desarrollado con AccountIQ © 2025
