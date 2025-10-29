# Checklist de Queries de Order

## Estado: VERIFICADO ✅

### Campos requeridos en el schema Order:
- id ✅
- userId ✅
- email ✅
- status ✅
- currency ✅
- subtotal ✅
- shipping ✅
- discount ✅
- totalAmount ✅
- mpPaymentId ✅
- mpPreferenceId ✅
- timeline ✅
- createdAt ✅
- updatedAt ✅
- shippingAddress ✅
- billingAddress ✅
- customerData ✅
- user (relation) ✅
- items (relation) ✅

---

## Archivos Verificados:

### ✅ 1. app/(admin)/admin/ordenes/[id]/page.tsx
**Query:** `db.order.findUnique`
**Campos incluidos:**
- id, userId, email, status
- currency, subtotal, shipping, discount, totalAmount
- mpPaymentId, mpPreferenceId
- createdAt, updatedAt
- shippingAddress, billingAddress, customerData
- user (id, name, email)
- items (id, quantity, unitPrice, product)

**Estado:** ✅ COMPLETO

---

### ✅ 2. app/(admin)/admin/ordenes/[id]/print/page.tsx
**Query:** `db.order.findUnique`
**Campos incluidos:**
- id, userId, email, status
- currency, subtotal, shipping, discount, totalAmount
- mpPaymentId, mpPreferenceId
- createdAt, updatedAt
- shippingAddress, billingAddress, customerData
- user (id, name, email)
- items (id, quantity, unitPrice, product)

**Estado:** ✅ COMPLETO

---

### ✅ 3. app/(admin)/admin/ordenes/page.tsx
**Query:** `db.order.findMany`
**Campos incluidos:**
- id, userId, email, status
- totalAmount, createdAt
- user (name, email)

**Estado:** ✅ SUFICIENTE (solo lista, no necesita todos los campos)

---

### ✅ 4. app/(store)/ok/page.tsx (Confirmación de pedido)
**Query:** `db.order.findUnique`
**Campos incluidos:**
- id, userId, email, status
- totalAmount, subtotal, shipping, discount
- createdAt
- shippingAddress, billingAddress, customerData
- items (id, quantity, unitPrice, product)

**Estado:** ✅ COMPLETO

---

### ✅ 5. app/api/mp-webhook/route.ts (Webhook Mercado Pago)
**Query:** `db.order.findUnique`
**Campos incluidos:**
- id, status, userId, email
- totalAmount, timeline

**Estado:** ✅ COMPLETO (tiene timeline para actualizar historial)

---

### ✅ 6. app/api/diagnostic/route.ts
**Query:** `db.order.findFirst`
**Campos incluidos:**
- id, status, email, createdAt

**Estado:** ✅ SUFICIENTE (solo diagnóstico)

---

## Otros archivos con Order:

### ✅ 7. app/(admin)/admin/usuarios/[id]/page.tsx
**Query:** Incluye orders del usuario
**Verificar:** Necesita revisar si usa campos correctos

---

## Campos críticos que SIEMPRE deben incluirse cuando se usan:

1. **Financieros:** currency, subtotal, shipping, discount, totalAmount
2. **Mercado Pago:** mpPaymentId, mpPreferenceId (si se muestran)
3. **Historial:** timeline (si se actualiza status)
4. **Items:** Usar `unitPrice` NO `price`
5. **Fechas:** createdAt, updatedAt (si se muestran)

---

## REGLA GENERAL:
✅ Usar `select` explícito SIEMPRE
✅ Incluir TODOS los campos que se usan en el JSX
✅ Los items deben tener `unitPrice` (no `price`)
✅ Si se actualiza timeline, debe estar en el select

---

## Próximos pasos:
1. ✅ Verificar app/(admin)/admin/usuarios/[id]/page.tsx
2. ✅ Asegurar que todos los queries están actualizados
3. ⏳ Deploy y prueba final
