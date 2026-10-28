# Testing

Política de tests del backend. Es de lectura obligatoria antes de crear o modificar cualquier test.

## Máximas

1. **Un test no está terminado hasta que vimos que falla.** Verde no prueba nada; verde y capaz de ponerse rojo sí.
2. **Primero se intenta romper el código.** Si una mutación deliberada no hace fallar el test, el test no cubre ese comportamiento.
3. **Un test existe para proteger un comportamiento que importa.** Si no puede explicar qué riesgo del SaaS cubre, no se escribe.
4. **Pocos tests, bien elegidos.** El objetivo es comprobar que el sistema funciona, no tener una suite gigante.
5. **Primero se justifica, después se escribe.** Antes de crear un test se informa por qué debe existir.
6. **Se testea comportamiento, no implementación.** Refactorizar sin cambiar el comportamiento no debe romper tests.
7. **Cada capa se prueba según su responsabilidad.** Negocio en el service, HTTP en el controller, persistencia en el repository.
8. **Lo unitario y lo integrado viven separados.** Distinta velocidad, propósito y costo.
9. **Los flujos críticos tienen prioridad.** Turnos y pacientes antes que cualquier utilidad.
10. **Los tests son deterministas y usan datos ficticios.** Nunca datos reales de pacientes.

## Reglas

### 1. Informar antes de crear

El agente indica qué comportamiento cubre, qué riesgo mitiga y por qué no lo cubre un test existente. Sin eso, no se crea.

### 2. Prohibido testear por testear

Nada de tests para getters, DTOs triviales, código de framework ni para subir métricas.

### 3. Flujo obligatorio para cada test nuevo

1. Escribir el test y ver que pasa.
2. Mutar el código de producción que dice cubrir: invertir una condición (`>` por `>=`), cambiar un operador, borrar una validación, alterar una constante o devolver otro valor.
3. Correr el test: **tiene que fallar**. Si sigue verde, el test es débil: se refuerza la aserción o se descarta.
4. Revertir la mutación y confirmar que vuelve a pasar.

### 4. Reporte del mutante

Al entregar un test, el agente informa qué mutaciones probó y que el test las detectó. Un test sin esta evidencia no se considera listo.

### 5. Integración mínima

Un archivo por feature como máximo, con DB aislada (`mongodb-memory-server`), solo para flujos críticos de punta a punta.

### 6. Estructura

```
__test__/
├── unit/
│   └── <feature>/
└── integration/
    └── <feature>/
```
