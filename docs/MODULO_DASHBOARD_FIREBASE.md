# Modulo Dashboard Con Firebase

## 1. Objetivo

Este documento resume lo que se implemento en el dashboard principal de la app y como quedo conectado con Firebase para que el equipo pueda continuar el trabajo sobre una base comun.

## 2. Que Se Implemento

Se desarrollo la primera version funcional del dashboard o muro principal.

Esta version ya permite:

- entrar al dashboard despues del login
- visualizar un muro principal
- escribir una publicacion desde el bloque `¿Que quieres anunciar hoy?`
- guardar publicaciones reales en Firebase Firestore
- listar publicaciones en tiempo real desde Firestore

## 3. Ubicacion Del Dashboard

El dashboard principal quedo implementado en:

- `src/app/pages/main/main.component.ts`
- `src/app/pages/main/main.component.html`
- `src/app/pages/main/main.component.scss`

En esta rama, el dashboard vive dentro de `main`.

## 4. Conexion Con Firebase

La conexion con Firebase ya estaba preparada desde el modulo de autenticacion.

Para el dashboard se agrego el servicio:

- `src/app/core/services/posts.service.ts`

Y el modelo:

- `src/app/models/post.model.ts`

## 5. Coleccion Utilizada

La coleccion principal del muro es:

- `posts`

Cada publicacion se guarda en Firestore como un documento nuevo dentro de esa coleccion.

## 6. Estructura Del Post

Cada documento en `posts` contiene:

- `authorId`
- `authorName`
- `authorRole`
- `content`
- `likesCount`
- `commentsCount`
- `createdAt`

## 7. Flujo Actual Del Muro

El flujo implementado funciona asi:

1. El usuario inicia sesion.
2. Entra a `main`.
3. Escribe un mensaje en el cuadro de publicacion.
4. Pulsa `Publicar`.
5. La app guarda el documento en Firestore.
6. El muro vuelve a renderizar y muestra la publicacion en tiempo real.

## 8. Estado De La Version 1

La version 1 del muro ya es funcional, pero esta pensada como base.

Incluye:

- publicacion de texto
- autor
- contenido
- lectura en tiempo real

No incluye todavia:

- comentarios reales
- likes persistentes
- compartir real
- imagenes
- filtros por facultad
- edicion o borrado

## 9. Paginas Ya Preparadas Para El Equipo

Para que el equipo tenga estructura lista, se dejaron creadas las rutas placeholder de:

- `chat`
- `notifications`
- `profile`

Archivos creados:

- `src/app/pages/chat/`
- `src/app/pages/notifications/`
- `src/app/pages/profile/`

Estas paginas todavia estan en blanco funcional, pero ya tienen ruta, componente y navegacion lista.

## 10. Recomendaciones Para El Equipo

### Para quien tome Perfil

Debe trabajar sobre:

- `src/app/pages/profile/`

Y puede usar como base:

- el usuario autenticado de Firebase
- el documento en `profiles/{uid}`

### Para quien tome Avisos o Notificaciones

Debe trabajar sobre:

- `src/app/pages/notifications/`

Y despues podra conectar una coleccion como:

- `notifications`

### Para quien tome Chat

Debe trabajar sobre:

- `src/app/pages/chat/`

Y luego conectar Firestore para conversaciones y mensajes.

## 11. Recomendaciones Tecnicas

Para no romper la base actual:

- no eliminar la coleccion `posts`
- no cambiar nombres de campos sin avisar al equipo
- no romper el flujo `login -> main`
- no mover el servicio `posts.service.ts` sin actualizar imports
- probar siempre con `npm run build`

## 12. Resumen Rapido Para Explicarlo Al Equipo

Se puede explicar asi:

> Ya se implemento la version 1 real del dashboard con Firebase.  
> El usuario autenticado puede publicar mensajes de texto y el muro los lee desde Firestore en tiempo real usando la coleccion `posts`.  
> Ademas, ya quedaron creadas las rutas base de `chat`, `avisos` y `perfil` para que cada integrante continue sobre una estructura definida.
