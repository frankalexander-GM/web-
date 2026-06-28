/**
 * Capa de servicios (lógica de negocio) del backend Next.js
 * =========================================================
 * Cada servicio encapsula la lógica de un dominio.
 * Las rutas API (src/app/api/*) son "delgadas": solo validan entrada
 * y llaman a estos servicios. Así separamos transporte de lógica.
 *
 *   route.ts (transporte) -> service.ts (lógica) -> prisma (datos)
 */
export * from './user-service'
export * from './community-service'
export * from './store-service'
export * from './post-service'
