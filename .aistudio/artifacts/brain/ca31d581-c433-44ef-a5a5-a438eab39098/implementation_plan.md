# Plan de Implementación: La Tragedia de los Comunes (UCR Economía)

Aplicación web móvil interactiva en tiempo real para simular la "Tragedia de los Comunes" en el curso de Teoría de Juegos de la Universidad de Costa Rica (UCR), acompañando el disfraz con la caja física de confites. Permite al administrador crear botes de confites con código y QR, asignar tickets a los estudiantes según orden de llegada, gestionar turnos secuenciales con cálculo logarítmico $\text{round}(\ln(x))$, registrar reclamos físicos y repartir el dividendo final del remanente.

---

## Decisiones Críticas y Resumen de Preferencias

> [!IMPORTANT]
> Decisiones confirmadas por el usuario durante la fase de clarificación:
> - **Sincronización en tiempo real**: Firebase Firestore mediante listeners reactivos (`onSnapshot`), asegurando que todos los estudiantes vean las actualizaciones al instante desde sus teléfonos celulares sin recargar.
> - **Mecánica de turnos**: Turno secuencial estricto por número de ticket (#1, #2, #3...), donde solo el jugador activo puede someter su decisión de extracción, con control de pase o avance para el administrador.
> - **Estilo visual**: Minimalista académico inspirado en la Universidad de Costa Rica (azules sobrios institucionales, toques dorados y detalles sutiles de confites), altamente responsivo y ergonómico para uso móvil táctil.
> - **Cálculo matemático**: Implementación transparente de la función de pago $f(x) = \text{round}(\ln(x))$ con visualización pedagógica para contrastar lo que el jugador *deseaba extraer* ($x$) frente a lo que *realmente recibe* ($\ln(x)$) y el impacto sobre el recurso común.

---

## 1. Visión General y Concepto Pedagógico

### Propósito Económico
Demostrar experimentalmente la sobreexplotación de un recurso de uso común (Common-Pool Resource o CPR) no excluible pero rival.
- Cada estudiante que tiene el turno se enfrenta al dilema de extraer $x \in [1, \text{Bote\_Actual}]$.
- La función de recompensa asigna $y = \text{round}(\ln(x))$, modelando la utilidad marginal decreciente y amortiguando el agotamiento inmediato por un solo agente egoísta.
- Al finalizar el juego, los recursos restantes en el bote se reparten como beneficio colectivo a todos los participantes: $\text{Bono\_Final} = \text{round}(\ln(\text{Bote\_Restante}))$.
- Se crea una tensión de teoría de juegos: ¿conviene extraer mucho al inicio para beneficio propio o cooperar para preservar un bote final alto compartido?

### Audiencia Objetivo
1. **Estudiante / Disfraz (Administrador)**: Porta la caja blanca de confites con el código y QR impresos. Controla el juego desde su celular o laptop: crea el bote, monitorea la cola, avanza turnos, marca reclamos de confites (tanto iniciales como finales) y declara el fin del juego.
2. **Compañeros de clase (Jugadores)**: Escanean el QR con su teléfono, ingresan su nombre, reciben un ticket con número único, observan la pizarra pública en vivo y deciden su extracción cuando llega su turno.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos de Usuario Principales

```
[ PANTALLA PRINCIPAL ]
        │
        ├──► [ MODO JUGADOR ] ──► Ingresar Código + Nombre ──► Ticket Digital (#N)
        │                                                              │
        │                                  ┌───────────────────────────┴───────────────────────────┐
        │                                  ▼                                                       ▼
        │                       [ En Espera de Turno ]                                     [ Turno Activo (#N) ]
        │                       · Bote en vivo                                             · Slider/Input 1 a Bote
        │                       · Ticket actual decidiendo                                 · Previsualización: ln(x)
        │                       · Historial público en vivo                                · Confirmar extracción
        │                                                                                          │
        │                                  ┌───────────────────────────────────────────────────────┘
        │                                  ▼
        │                       [ Ticket de Reclamo ]
        │                       · Confites a retirar: ln(x) (Pendiente / Reclamado)
        │                       · Proyección dinámica de bono final: ln(Bote Actual)
        │                       · Estado final post-juego (Bono Pendiente / Reclamado)
        │
        └──► [ MODO ADMINISTRADOR ] ──► Login/PIN de Administrador
                                                │
                                                ├── Crear Bote (ej. 100 confites, Código alfanumérico)
                                                ├── Ver código grande + Código QR para pegar en la caja
                                                ├── Monitor en Vivo: Turno actual, jugadores, bote restante
                                                ├── Control de Turno: Siguiente ticket / Pausar
                                                ├── Despacho de Confites: Marcar ticket #N como "Entregado"
                                                └── Finalizar Juego: Calcular bono final y gestionar reclamo final
```

### Identidad Visual y Tema (UCR Minimalista Académico)
- **Paleta de Colores**:
  - *Lienzo Base*: Fondo claro limpio `#F8FAFC` (Slate 50) con superficies blancas puras `#FFFFFF`.
  - *Azul Institucional UCR*: `#0B4F6C` y `#1E3A8A` para encabezados, barras de navegación y acentos principales.
  - *Acentos Dulces & Estado*: Ámbar dorado `#D97706` (reserva de confites), Rojo rubí suave `#E11D48` (agotamiento/alerta) y Esmeralda `#059669` (reclamos completados).
- **Tipografía**:
  - Títulos e Identidad: `Plus Jakarta Sans` en peso semibold y bold con espaciado limpio.
  - Métricas Numéricas: `font-mono tabular-nums` para que los contadores del bote, tickets y confites permanezcan estables sin parpadeos.
  - Textos y Fórmulas: Serif matemático sutil para expresiones económicas ($\ln(x)$) y `DM Sans` para el cuerpo.
- **Ergonomía Táctil Móvil**:
  - Botones y controles con área de toque mínima de $48 \times 48\text{px}$.
  - Zona de acción natural en el pulgar (parte inferior de la pantalla).
  - Resumen visual permanente del tamaño del bote actual y del número de ticket que está en juego.
  - Animaciones sutiles de transición con Framer Motion (reducción del bote, cambio de turno, ticket sellado como "Entregado").

---

## 3. Decisiones Técnicas y de Producto

1. **Persistencia y Tiempo Real (Firebase Firestore)**:
   - Uso de `onSnapshot` para suscripciones reactivas en clientes móviles.
   - Si un jugador toma confites en su teléfono, todos los demás estudiantes ven el bote descontarse y la tabla actualizarse en $<200\text{ms}$.
   - Reglas de seguridad estrictas (`firestore.rules`) siguiendo el estándar de mínimo privilegio y validación de tipos.

2. **Gestión de Turnos y Ausencias**:
   - Turno secuencial indexado (`currentTurnTicket: number`).
   - El jugador solo puede interactuar con el formulario de decisión si su ticket coincide exactamente con `currentTurnTicket` y el bote está abierto.
   - El administrador dispone de un botón de emergencia "Avanzar Turno" (por si un compañero no está prestando atención o se fue del aula).

3. **Doble Fase de Reclamo Físico**:
   - Cada jugador tiene dos estados de reclamo físico independientes:
     1. `initialClaimed`: si ya fue a la caja de confites a recoger sus $\text{round}(\ln(x))$ confites de extracción.
     2. `bonusClaimed`: si ya recogió su bono final $\text{round}(\ln(\text{remanente}))$ una vez terminado el juego.
   - En el panel de administrador, el usuario puede buscar rápidamente por número de ticket o nombre y marcar con un solo toque el reclamo correspondiente.

4. **Transparencia y Registro Público (Ledger)**:
   - Tabla pública visible para todos los jugadores mostrando:
     - Nombre del jugador.
     - Número de ticket.
     - Extracción deseada ($x$).
     - Confites asignados ($\ln(x)$).
     - Confites restantes en el bote tras la jugada.
     - Hora del movimiento.

---

## 4. Arquitectura de Datos y Componentes

### Diagrama del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FIREBASE FIRESTORE DB                           │
│                                                                        │
│  /botes/{boteCode}                                                     │
│   ├── name, initialCandies, currentCandies, currentTurnTicket, status  │
│   ├── createdAt, endedAt, adminId                                      │
│   │                                                                    │
│   ├── /players/{playerId}                                              │
│   │    ├── ticketNumber, name, chosenX, receivedLnX                    │
│   │    ├── initialClaimed, bonusClaimed, joinedAt, playedAt            │
│   │                                                                    │
│   └── /ledger/{actionId}                                               │
│        └── ticketNumber, playerName, x, lnX, remainingAfter, timestamp │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ onSnapshot (Realtime sync)      │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       DISPOSITIVO JUGADOR (Móvil)    │  │   ADMINISTRADOR (Disfraz)    │
│                                      │  │                              │
│ · Vista Entrada (Código + Nombre)    │  │ · Creador de Bote + QR Code  │
│ · Ticket Digital Personalizado       │  │ · Tablero de Control en Vivo │
│ · Formulario de Decisión (en turno)  │  │ · Selector de Turno Siguiente│
│ · Pizarra Pública de Extracciones    │  │ · Marcador de Reclamos Físicos│
│ · Calculadora Dinámica de Bono Final │  │ · Cierre y Reporte del Juego │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Estructura de Entidades (Schema Blueprint)

1. **`botes/{boteId}`**:
   - `id`: string (código corto de 6 caracteres, ej: `UCR-702` o `COMUN1`)
   - `name`: string ("Curso Teoría de Juegos - Grupo 01")
   - `initialCapacity`: number (ej. 100)
   - `currentCandies`: number (remanente en tiempo real)
   - `status`: `'waiting' | 'active' | 'ended'`
   - `currentTurnTicket`: number (ticket activo decidiendo)
   - `totalPlayers`: number
   - `finalBonus`: number (calculado al finalizar: $\text{round}(\ln(\text{currentCandies}))$)
   - `createdAt`: timestamp
   - `endedAt`: timestamp | null

2. **`botes/{boteId}/players/{playerId}`**:
   - `id`: string (UID o ID generado)
   - `boteId`: string
   - `ticketNumber`: number (1, 2, 3...)
   - `name`: string (nombre del compañero)
   - `hasPlayed`: boolean
   - `chosenX`: number | null (cuánto pidió)
   - `receivedLnX`: number | null (cuánto le dio $\text{round}(\ln(x))$)
   - `initialClaimed`: boolean (si ya retiró los primeros confites con el profe/estudiante)
   - `initialClaimedAt`: timestamp | null
   - `bonusClaimed`: boolean (si ya retiró el bono final)
   - `bonusClaimedAt`: timestamp | null
   - `joinedAt`: timestamp

3. **`botes/{boteId}/ledger/{entryId}`**:
   - `ticketNumber`: number
   - `playerName`: string
   - `chosenX`: number
   - `receivedLnX`: number
   - `remainingCandies`: number
   - `timestamp`: timestamp

---

## 5. Fases de Ejecución Tras Aprobación

1. **Configuración de Firebase**:
   - Provisionar Firebase Firestore mediante las herramientas oficiales (`show_aistudio_ui` y `ProvisionFirebase`).
   - Crear `firebase-blueprint.json` y desplegar reglas de seguridad seguras en `firestore.rules`.
2. **Instalación de Dependencias**:
   - Instalar `firebase`, `qrcode.react` (para el código QR del bote en pantalla) y `canvas-confetti` para celebración al reclamar o finalizar.
3. **Módulo Central de Lógica Económica**:
   - Implementar cálculo matemático exacto: $f(x) = \text{round}(\ln(x))$.
   - Servicio reactivo de Firestore con transacciones atómicas para descontar confites de forma concurrente y segura.
4. **Vistas e Interfaz**:
   - Pantalla de Bienvenida y Selección de Rol (Estudiante con Código / Admin con PIN).
   - Generador y Administrador de Botes con visualización de Código y QR imprimible/mostrable.
   - Vista de Jugador con Ticket Digital animado, indicador de turno y slider/selector interactivo.
   - Pizarra de Historial en Tiempo Real accesible para todos los asistentes.
   - Panel de Despacho de Confites para el administrador con búsqueda rápida de ticket y doble verificación de reclamo.
   - Pantalla de Fin de Juego con resumen económico (¿se agotó el recurso?, reparto de bonos, estadísticas finales).
5. **Verificación y Compilación**:
   - Pruebas de compilación TypeScript (`compile_applet`).
   - Verificación del comportamiento responsivo en móviles.
