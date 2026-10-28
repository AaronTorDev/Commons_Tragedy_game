# Plan de Implementación: Renderizado Matemático LaTeX con KaTeX

Integración de **KaTeX** para el formateo y renderizado de fórmulas matemáticas LaTeX ($ y $$) en toda la aplicación web de la Tragedia de los Comunes, garantizando tipografía matemática limpia, soporte para expresiones en línea y en bloque, y rendimiento sin parpadeos ni demoras en dispositivos móviles.

---

## Decisiones Críticas y Resumen de Preferencias

> [!IMPORTANT]
> Decisiones confirmadas por el usuario:
> - **Librería seleccionada**: **KaTeX** (`katex`) debido a su tamaño ultraligero (< 100 KB), velocidad síncrona de renderizado y óptima compatibilidad con navegadores móviles.
> - **Alcance de aplicación**: En **toda la interfaz**, incluyendo el modal de reglas y teoría económica, el ticket del estudiante, la calculadora interactiva del slider y los encabezados y resúmenes de la tabla pública de extracciones.
> - **Manejo de errores resiliente**: `throwOnError: false` en la configuración de KaTeX para asegurar que si una expresión tiene algún detalle de sintaxis, se muestre de forma segura sin romper la aplicación.

---

## 1. Visión General y Beneficios

### Propósito
Actualmente, las expresiones matemáticas en las reglas y las descripciones se muestran con sintaxis cruda (`$x$`, `\text{round}(\ln(x))`, `$$...$$`). Con KaTeX:
- Se presentarán con tipografía matemática tipográfica clásica (fuente serif matemática nítida).
- Las funciones económicas como $f(x) = \text{round}(\ln(x))$ y $\text{Bono\_Final} = \text{round}(\ln(\text{Bote\_Restante}))$ serán legibles y profesionales para el profesor y los compañeros del curso de Teoría de Juegos.
- Se mantiene el estilo visual limpio y sobrio de Shadcn UI (sin colores "glow" ni elementos recargados).

---

## 2. Arquitectura de Componentes de Renderizado

```
┌────────────────────────────────────────────────────────┐
│                   KATEX CORE ENGINE                    │
│             katex.renderToString(math, ...)            │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│   <MathView math="" /> │      │   <MathText text="" /> │
│  (Fórmula directa      │      │  (Parsea texto mixto   │
│   inline o bloque)     │      │   con $...$ y $$...$$) │
└───────────┬────────────┘      └───────────┬────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│               COMPONENTES DE LA APLICACIÓN             │
│                                                        │
│  · GameTheoryGuideModal: Definición formal del juego   │
│  · DecisionModal: Ecuación viva f(x) en el slider      │
│  · TicketCard: Recompensas en el ticket del estudiante │
│  · PublicLedger: Columnas y resúmenes auditables       │
│  · JoinBoteView: Reglas sintéticas en la bienvenida    │
└────────────────────────────────────────────────────────┘
```

### Componente Reutilizable (`src/components/MathView.tsx`)
1. `<MathView math={string} block={boolean} />`:
   - Renderiza directamente una expresión matemática dada (ej. `\text{round}(\ln(x))`).
   - Modo `inline` (por defecto) o `block` (centrado para ecuaciones destacadas).
2. `<MathText text={string} />`:
   - Parsea dinámicamente cadenas de texto que combinan texto regular con fórmulas entre `$formula$` y `$$formula$$`.
   - Permite que los párrafos explicativos se lean con naturalidad intercalando variables como $x$, $\ln(x)$ y $u_i(x_i)$.

---

## 3. Integración en Pantallas y Vistas

1. **Modal de Reglas y Teoría (`GameTheoryGuideModal.tsx`)**:
   - Sección de Utilidad Marginal:
     $$\text{Utilidad}: u_i(x_i) = \text{round}(\ln(x_i))$$
   - Ejemplos tabulados matemáticamente:
     $\ln(1) = 0$, $\ln(3) \approx 1.1 \to 1$, $\ln(20) \approx 3.0 \to 3$, $\ln(100) \approx 4.6 \to 5$.
   - Sección de Gobernanza (Elinor Ostrom):
     $$\text{Dividendo Final} = \text{round}(\ln(\text{Bote}_{\text{restante}}))$$

2. **Modal de Decisión del Turno (`DecisionModal.tsx`)**:
   - Previsualización dinámica de la ecuación en vivo según el valor seleccionado en el slider:
     $$x = 25 \implies f(25) = \text{round}(\ln(25)) = 3\text{ confites}$$
   - Impacto sobre el bote:
     $$\text{Bote}_{\text{nuevo}} = \text{Bote}_{\text{actual}} - f(x)$$

3. **Ticket de Participante (`TicketCard.tsx`)**:
   - Reemplazar texto plano con fórmulas KaTeX: $x$ solicitado, $\text{round}(\ln(x))$ asignado.
   - Fórmula de dividendo proyectado: $\text{round}(\ln(\text{Bote}))$.

4. **Pizarra Pública (`PublicLedger.tsx`)**:
   - Encabezados de tabla: Columna "$x$ solicitado" y columna "$\text{round}(\ln(x))$ recibido".

5. **Pantalla de Entrada (`JoinBoteView.tsx`)**:
   - Reglas breves con renderizado matemático estilizado en lugar de texto plano.

---

## 4. Fases de Ejecución

1. **Instalación de Dependencias**:
   - Instalar `katex` y `@types/katex`.
   - Importar los estilos CSS de KaTeX (`katex/dist/katex.min.css`) en `src/index.css`.
2. **Creación del Componente de Soporte (`src/components/MathView.tsx`)**:
   - Implementar `MathView` y `MathText` con sanitización y manejo seguro de errores.
3. **Actualización de Vistas**:
   - Migrar `GameTheoryGuideModal.tsx`, `DecisionModal.tsx`, `TicketCard.tsx`, `PublicLedger.tsx` y `JoinBoteView.tsx`.
4. **Verificación**:
   - Comprobar compilación TypeScript con `compile_applet` y `lint_applet`.
   - Verificar renderizado síncrono en dispositivos móviles sin desbordamiento.
