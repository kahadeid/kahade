# Bcrypt Migration Guide

## Migrasi dari `bcrypt` ke `@node-rs/bcrypt`

### Alasan Migrasi
- `bcrypt` menggunakan `node-pre-gyp` yang deprecated dan menyebabkan warning
- `@node-rs/bcrypt` adalah implementasi modern menggunakan Rust
- 10x lebih cepat dari bcrypt
- Zero deprecated dependencies
- API kompatibel dengan bcrypt

### Perubahan Import

**Sebelum (bcrypt):**
```typescript
import * as bcrypt from 'bcrypt';
// atau
import bcrypt from 'bcrypt';
```

**Sesudah (@node-rs/bcrypt):**
```typescript
import { hashSync, compareSync, hash, compare, genSaltSync } from '@node-rs/bcrypt';
// atau untuk named exports
import * as bcrypt from '@node-rs/bcrypt';
```

### API yang Sama

API `@node-rs/bcrypt` kompatibel 100% dengan `bcrypt`:

```typescript
// Hash password (sync)
const hashed = hashSync(password, 10);

// Hash password (async)
const hashed = await hash(password, 10);

// Compare password (sync)
const isMatch = compareSync(password, hashedPassword);

// Compare password (async)
const isMatch = await compare(password, hashedPassword);

// Generate salt (sync)
const salt = genSaltSync(10);
```

### Tidak Perlu Perubahan Kode

Jika Anda menggunakan pattern seperti ini:
```typescript
import * as bcrypt from 'bcrypt';

// Di service
const hashedPassword = await bcrypt.hash(password, 10);
const isPasswordValid = await bcrypt.compare(password, user.password);
```

Cukup ganti import menjadi:
```typescript
import * as bcrypt from '@node-rs/bcrypt';

// Kode lainnya tetap sama!
const hashedPassword = await bcrypt.hash(password, 10);
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### Performa

`@node-rs/bcrypt` **10x lebih cepat** dari bcrypt karena menggunakan Rust binding.

### Kompatibilitas

- ✅ Hash yang dibuat `bcrypt` bisa di-verify dengan `@node-rs/bcrypt`
- ✅ Hash yang dibuat `@node-rs/bcrypt` bisa di-verify dengan `bcrypt`
- ✅ 100% kompatibel dengan bcrypt format

### Testing

Pastikan test Anda tetap pass setelah migrasi:
```bash
pnpm test
```
