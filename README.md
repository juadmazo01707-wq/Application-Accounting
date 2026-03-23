# AccoVix App.

Aplicación web de contabilidad personal que permite gestionar ingresos, gastos, presupuestos y ahorros de manera sencilla, visual e interactiva.

---

## Descripción.

**AccoVix App** es una aplicación frontend desarrollada en JavaScript que permite a los usuarios llevar el control de sus finanzas personales. Incluye funcionalidades como autenticación básica, registro de movimientos, visualización de datos mediante gráficos y generación de reportes.

La aplicación funciona completamente en el navegador utilizando almacenamiento local (`sessionStorage` y posiblemente `localStorage`), sin necesidad de backend.

---

## Características.

* Sistema de autenticación básico (login).
* Registro de ingresos y gastos.
* Visualización de datos con gráficos dinámicos.
* Filtro de movimientos por mes.
* Gestión de presupuestos.
* Módulo de ahorro.
* Generación de reportes.
* Sistema de alertas.
* Calculadora integrada.
* Exportación de datos en PDF.

---

## Tecnologías utilizadas.

* **HTML5**
* **CSS3**
* **JavaScript (Vanilla)**
* **Chart.js** → Para gráficos
* **jsPDF** → Para generación de reportes en PDF
* **Google Fonts**

---

## Instalación.

1. Clona el repositorio:

```bash
git clone https://github.com/juadmazo01707-wq/Application-Accounting.git
```

2. Accede a la carpeta del proyecto:

```bash
cd Application-Accouting
```

3. Abre el archivo `index.html` en tu navegador:

```bash
# En Linux
xdg-open index.html

# En Windows
start index.html
```

---

## Uso

1. Al abrir la aplicación, serás redirigido al login.
2. Inicia sesión para acceder al sistema.
3. Navega entre las diferentes secciones:

   * Inicio.
   * Movimientos.
   * Presupuesto.
   * Ahorro.
   * Reportes.
   * Alertas.
   * Calculadora.
4. Registra tus movimientos financieros.
5. Visualiza gráficos y reportes en tiempo real.

---

## Autenticación.

La aplicación utiliza un sistema simple basado en `sessionStorage`.

* Si no hay sesión activa redirige automáticamente al login.
* La sesión se guarda en el navegador.

---

## Gráficos.

Los datos financieros se representan mediante gráficos dinámicos utilizando **Chart.js**, lo que permite:

* Visualizar ingresos vs gastos.
* Analizar tendencias.
* Mejorar la toma de decisiones.

---

## Generación de reportes.

Se pueden generar reportes en PDF gracias a la integración con **jsPDF**, permitiendo exportar información financiera fácilmente.

---

## Arquitectura.

El proyecto sigue una estructura modular en JavaScript:

* `app.js` → Controlador principal.
* `ui.js` → Manejo de interfaz.
* `storage.js` → Persistencia de datos.
* `charts.js` → Renderización de gráficos.
* `login.js` → Lógica de autenticación.

---

## Responsividad.

La aplicación está diseñada para adaptarse a diferentes tamaños de pantalla mediante CSS, permitiendo su uso en:

* Escritorio.
* Dispositivos móviles.

---

## Contribución.

Las contribuciones son bienvenidas.

1. Haz un fork del proyecto.
2. Crea una rama:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Haz commit de tus cambios:

```bash
git commit -m "Agrega nueva funcionalidad"
```

4. Haz push:

```bash
git push origin feature/nueva-funcionalidad
```

5. Abre un Pull Request.

---

## Mejoras futuras.

* Integración con backend (API REST).
* Almacenamiento en la nube.
* Autenticación segura (JWT).
* Reportes avanzados.
* Modo oscuro.
* App móvil.

---

## Licencia.

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

---

## Estructura del proyecto.

```
Application-Accouting/
│
├── index.html
├── README.md
│
└── AccoVix/
    ├── css/
    │   ├── main.css
    │   └── login.css
    │
    ├── html/
    │   └── login.html
    │
    └── js/
        ├── app.js
        ├── ui.js
        ├── storage.js
        ├── charts.js
        └── login.js
```
