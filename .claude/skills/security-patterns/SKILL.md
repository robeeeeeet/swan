---
name: security-patterns
description: Webアプリケーションセキュリティパターン集。OWASP Top 10対策、XSS/CSRF/Injection防止、認証・認可実装、セキュリティヘッダー、健康データ保護（GDPR）、セキュアコーディング。セキュリティレビュー・実装時に使用。
allowed-tools: Read, Grep, Glob
---

# セキュリティパターン集（Swan PWA プロジェクト用）

このスキルは、禁煙・減煙PWAアプリ「Swan」におけるセキュリティ実装のベストプラクティスとパターン集です。**健康データを扱うアプリ**として、特にプライバシー保護に重点を置いています。

## 目次

1. [OWASP Top 10 対策](#1-owasp-top-10-対策)
2. [XSS 防止パターン](#2-xss-防止パターン)
3. [CSRF 防止パターン](#3-csrf-防止パターン)
4. [認証・認可実装](#4-認証認可実装)
5. [セキュリティヘッダー](#5-セキュリティヘッダー)
6. [健康データ保護（GDPR/プライバシー）](#6-健康データ保護gdprプライバシー)
7. [PWA 特有のセキュリティ](#7-pwa-特有のセキュリティ)
8. [セキュアコーディングチェックリスト](#8-セキュアコーディングチェックリスト)

---

## 1. OWASP Top 10 対策

### A01: Broken Access Control（アクセス制御の不備）

#### 問題パターン

```typescript
// ❌ 危険: ユーザーIDを直接使用（IDOR脆弱性）
app.get('/api/users/:userId/records', async (req, res) => {
  const records = await db.getRecords(req.params.userId);
  res.json(records);
});
```

#### 安全なパターン

```typescript
// ✅ 安全: セッションからユーザーIDを取得
app.get('/api/users/me/records', async (req, res) => {
  const userId = req.session.userId; // 認証済みユーザー
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const records = await db.getRecords(userId);
  res.json(records);
});

// ✅ 安全: リソース所有権を検証
app.get('/api/records/:recordId', async (req, res) => {
  const record = await db.getRecord(req.params.recordId);

  // 所有権検証
  if (record.userId !== req.session.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(record);
});
```

#### UUIDの使用

```typescript
// ✅ 推測困難なIDを使用
import { randomUUID } from 'crypto';

const newRecord = {
  id: randomUUID(), // 例: '550e8400-e29b-41d4-a716-446655440000'
  userId: currentUserId,
  // ...
};
```

### A02: Cryptographic Failures（暗号化の失敗）

#### 安全なパスワードハッシュ

```typescript
// lib/auth/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // 2^12 = 4096 iterations

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// より高セキュリティが必要な場合: Argon2
import argon2 from 'argon2';

export async function hashPasswordArgon2(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}
```

#### 機密データの暗号化

```typescript
// lib/crypto/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // IV + Tag + Encrypted data
  return iv.toString('hex') + tag.toString('hex') + encrypted;
}

export function decrypt(ciphertext: string, key: Buffer): string {
  const iv = Buffer.from(ciphertext.slice(0, IV_LENGTH * 2), 'hex');
  const tag = Buffer.from(ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
  const encrypted = ciphertext.slice((IV_LENGTH + TAG_LENGTH) * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### A03: Injection（インジェクション）

#### SQL Injection 防止

```typescript
// ❌ 危険: 文字列連結
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 安全: パラメータ化クエリ（Prisma）
const user = await prisma.user.findUnique({
  where: { email },
});

// ✅ 安全: パラメータ化クエリ（raw SQL）
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

#### NoSQL Injection 防止

```typescript
// ❌ 危険: ユーザー入力をそのまま使用
const user = await db.collection('users').findOne({
  email: req.body.email, // { $gt: '' } のようなオブジェクトが渡される可能性
});

// ✅ 安全: 型を検証
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = LoginSchema.parse(req.body);
const user = await db.collection('users').findOne({
  email: validated.email,
});
```

#### Command Injection 防止

```typescript
// ❌ 危険: ユーザー入力をコマンドに使用
const { exec } = require('child_process');
exec(`convert ${userFilename} output.png`); // ; rm -rf / が注入される可能性

// ✅ 安全: execFileを使用（引数を分離）
const { execFile } = require('child_process');
execFile('convert', [userFilename, 'output.png']);

// ✅ より安全: ホワイトリスト検証
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.gif'];
const ext = path.extname(userFilename).toLowerCase();
if (!ALLOWED_EXTENSIONS.includes(ext)) {
  throw new Error('Invalid file type');
}
```

### A05: Security Misconfiguration（セキュリティ設定ミス）

#### 本番環境の設定

```typescript
// next.config.js
module.exports = {
  // 本番環境ではソースマップを無効化
  productionBrowserSourceMaps: false,

  // PoweredByヘッダーを削除
  poweredByHeader: false,

  // 厳格なモード
  reactStrictMode: true,
};
```

#### 環境変数の管理

```typescript
// ❌ 危険: クライアントに秘密鍵を公開
const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY; // NEXT_PUBLIC_は公開される

// ✅ 安全: サーバーサイドのみ
// pages/api/external.ts
const apiKey = process.env.SECRET_API_KEY; // NEXT_PUBLIC_なし

// ✅ 安全: 環境変数の検証
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  VAPID_PRIVATE_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
```

### A06: Vulnerable Components（脆弱なコンポーネント）

#### 定期的な脆弱性チェック

```bash
# npm audit で脆弱性チェック
npm audit

# 自動修正
npm audit fix

# 強制修正（破壊的変更を含む可能性）
npm audit fix --force

# GitHub Dependabot の設定
# .github/dependabot.yml
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
```

### A07: Authentication Failures（認証の失敗）

#### ブルートフォース対策

```typescript
// lib/auth/rateLimit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const loginLimiter = new RateLimiterMemory({
  points: 5, // 5回まで
  duration: 60 * 15, // 15分間
  blockDuration: 60 * 60, // ブロック時間: 1時間
});

export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  try {
    await loginLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

// API Route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (!(await checkLoginRateLimit(ip))) {
    return Response.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // ログイン処理...
}
```

#### アカウントロックアウト

```typescript
// lib/auth/lockout.ts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30分

export async function recordFailedAttempt(userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: { increment: 1 },
      lastFailedLogin: new Date(),
    },
  });

  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + LOCKOUT_DURATION),
      },
    });
  }
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });

  if (!user?.lockedUntil) return false;
  return user.lockedUntil > new Date();
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}
```

---

## 2. XSS 防止パターン

### React での安全なレンダリング

```tsx
// ✅ 安全: Reactは自動的にエスケープ
const UserGreeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}</h1>; // <script>は&lt;script&gt;になる
};

// ❌ 危険: dangerouslySetInnerHTMLの使用
const UnsafeContent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ✅ 安全: サニタイズライブラリを使用
import DOMPurify from 'dompurify';

const SafeContent = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

### URL の検証

```typescript
// lib/security/urlValidator.ts
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 許可されたプロトコルのみ
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  // javascript: プロトコルを防止
  if (url.toLowerCase().startsWith('javascript:')) {
    return null;
  }

  // data: プロトコルを防止
  if (url.toLowerCase().startsWith('data:')) {
    return null;
  }

  if (!isValidUrl(url)) {
    return null;
  }

  return url;
}

// 使用例
const SafeLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const safeHref = sanitizeUrl(href);

  if (!safeHref) {
    return <span>{children}</span>;
  }

  return (
    <a href={safeHref} rel="noopener noreferrer">
      {children}
    </a>
  );
};
```

### イベントハンドラーの安全性

```tsx
// ❌ 危険: 文字列からイベントハンドラーを生成
const onClick = new Function(userInput); // eval同等

// ✅ 安全: 事前定義された関数のみ使用
const ACTIONS = {
  save: () => saveData(),
  delete: () => deleteData(),
  cancel: () => cancelAction(),
} as const;

type ActionType = keyof typeof ACTIONS;

const ActionButton = ({ action }: { action: ActionType }) => {
  const handler = ACTIONS[action];
  return <button onClick={handler}>Execute</button>;
};
```

---

## 3. CSRF 防止パターン

### SameSite Cookie 設定

```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers';

export function setSessionCookie(token: string): void {
  cookies().set('session', token, {
    httpOnly: true,      // JavaScriptからアクセス不可
    secure: process.env.NODE_ENV === 'production', // HTTPS必須
    sameSite: 'lax',     // 同一サイトのみ送信（ナビゲーション時は許可）
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: '/',
  });
}

// 厳格な設定（API用）
export function setApiCookie(token: string): void {
  cookies().set('api_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict', // 完全に同一サイトのみ
    maxAge: 60 * 60,    // 1時間
    path: '/api',
  });
}
```

### CSRF トークン実装

```typescript
// lib/security/csrf.ts
import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(): string {
  const token = generateCsrfToken();

  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return token;
}

export function validateCsrfToken(request: Request): boolean {
  const cookieToken = cookies().get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // タイミング攻撃を防ぐための比較
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

// ミドルウェアでの使用
export function csrfMiddleware(handler: Function) {
  return async (request: Request) => {
    // GET, HEAD, OPTIONSはスキップ
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }

    if (!validateCsrfToken(request)) {
      return Response.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return handler(request);
  };
}
```

### クライアントサイドでのCSRFトークン送信

```typescript
// lib/api/client.ts
export async function securePost<T>(url: string, data: unknown): Promise<T> {
  // CSRFトークンを取得
  const csrfToken = document.querySelector<HTMLMetaElement>(
    'meta[name="csrf-token"]'
  )?.content;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || '',
    },
    credentials: 'same-origin', // Cookieを送信
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
```

---

## 4. 認証・認可実装

### JWT 実装パターン

```typescript
// lib/auth/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ISSUER = 'swan-app';
const AUDIENCE = 'swan-users';

interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export async function createAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime('15m') // アクセストークン: 15分
    .sign(JWT_SECRET);
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime('7d') // リフレッシュトークン: 7日
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
```

### トークンローテーション

```typescript
// lib/auth/tokenRotation.ts
import { createAccessToken, createRefreshToken, verifyToken } from './jwt';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// リフレッシュトークンをDBに保存
async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const hashedToken = await hashToken(token);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

// リフレッシュトークンの検証
async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const hashedToken = await hashToken(token);
  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash: hashedToken,
      expiresAt: { gt: new Date() },
      revoked: false,
    },
  });
  return !!stored;
}

// トークンのリフレッシュ（ローテーション付き）
export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  const payload = await verifyToken(refreshToken);
  if (!payload?.userId) return null;

  // 既存トークンを検証
  const isValid = await validateRefreshToken(payload.userId, refreshToken);
  if (!isValid) {
    // トークンが無効 = 潜在的な盗難
    // 全リフレッシュトークンを無効化
    await prisma.refreshToken.updateMany({
      where: { userId: payload.userId },
      data: { revoked: true },
    });
    return null;
  }

  // 古いトークンを無効化
  await prisma.refreshToken.updateMany({
    where: { userId: payload.userId, tokenHash: await hashToken(refreshToken) },
    data: { revoked: true },
  });

  // 新しいトークンペアを生成
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return null;

  const newAccessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefreshToken = await createRefreshToken(user.id);

  await storeRefreshToken(user.id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
```

### 認可ミドルウェア

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // リクエストにユーザー情報を追加
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ロールベースアクセス制御
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const role = request.headers.get('x-user-role');

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}
```

---

## 5. セキュリティヘッダー

### Next.js でのセキュリティヘッダー設定

```typescript
// next.config.js
const securityHeaders = [
  // XSSフィルター（レガシーブラウザ用）
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // MIMEタイプスニッフィング防止
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // クリックジャッキング防止
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Referrer情報の制御
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // HTTPS強制（HSTS）
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // 権限ポリシー
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Content Security Policy (CSP)

```typescript
// lib/security/csp.ts
export function generateCSP(): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Next.jsのインラインスクリプト用（本番では避けたい）
      "'unsafe-eval'",   // 開発環境用（本番では削除）
      'https://www.googletagmanager.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS用
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:', // 外部画像を許可
    ],
    'connect-src': [
      "'self'",
      'https://api.swan-app.example.com',
      'wss://api.swan-app.example.com', // WebSocket
    ],
    'frame-ancestors': ["'none'"], // iframeでの埋め込み禁止
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

// next.config.js での使用
const ContentSecurityPolicy = generateCSP();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // ... 他のヘッダー
];
```

### Nonce ベースの CSP（より安全）

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);

  return response;
}
```

---

## 6. 健康データ保護（GDPR/プライバシー）

### Swan アプリでの健康データ考慮事項

喫煙記録は**個人の健康情報**として扱われます：

| データ種類 | 機密性 | 保護措置 |
|-----------|-------|---------|
| 喫煙本数 | 高 | 暗号化、アクセス制御 |
| 喫煙タイミング | 高 | 匿名化可能 |
| 位置情報 | 高 | オプトイン、最小収集 |
| 対処法の使用 | 中 | 集計のみ共有 |
| 目標設定 | 中 | ユーザー制御 |

### データ最小化原則

```typescript
// ✅ 良い例: 必要最小限のデータのみ収集
interface SmokeRecord {
  id: string;
  userId: string;
  timestamp: number;
  tag?: string;        // オプション
  // location?: ...    // ❌ 位置情報は収集しない（必要でない限り）
}

// ✅ 良い例: 収集理由の明示
const DataCollectionPurpose = {
  smokeCount: '禁煙進捗の追跡と目標達成の支援',
  timestamp: '喫煙パターンの分析と「魔の時間帯」の特定',
  tag: '喫煙トリガーの理解と対処法の提案',
} as const;
```

### ユーザーの権利実装

```typescript
// lib/privacy/userRights.ts

// データアクセス権（GDPR第15条）
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const [user, smokeRecords, copingRecords, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.smokeRecord.findMany({ where: { userId } }),
    prisma.copingRecord.findMany({ where: { userId } }),
    prisma.userSetting.findMany({ where: { userId } }),
  ]);

  return {
    exportDate: new Date().toISOString(),
    user: {
      email: user?.email,
      createdAt: user?.createdAt,
    },
    smokeRecords: smokeRecords.map(r => ({
      timestamp: r.timestamp,
      tag: r.tag,
    })),
    copingRecords: copingRecords.map(r => ({
      timestamp: r.timestamp,
      strategy: r.strategy,
      success: r.success,
    })),
    settings,
  };
}

// データ削除権（GDPR第17条 - 忘れられる権利）
export async function deleteUserData(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.smokeRecord.deleteMany({ where: { userId } }),
    prisma.copingRecord.deleteMany({ where: { userId } }),
    prisma.userSetting.deleteMany({ where: { userId } }),
    prisma.pushSubscription.deleteMany({ where: { userId } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  // IndexedDBのクリアを促すフラグを設定
  await redis.set(`user:${userId}:deleted`, 'true', 'EX', 86400);
}

// データポータビリティ（GDPR第20条）
export async function exportDataAsJson(userId: string): Promise<string> {
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2);
}
```

### 同意管理

```typescript
// lib/privacy/consent.ts
interface ConsentRecord {
  userId: string;
  type: 'analytics' | 'marketing' | 'notifications';
  granted: boolean;
  timestamp: number;
  version: string; // プライバシーポリシーのバージョン
}

export async function recordConsent(consent: ConsentRecord): Promise<void> {
  await prisma.consent.create({
    data: {
      ...consent,
      ipAddress: null, // IPは保存しない
    },
  });
}

export async function getConsent(userId: string, type: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: { userId, type },
    orderBy: { timestamp: 'desc' },
  });
  return consent?.granted ?? false;
}

// 同意UIコンポーネント
export const ConsentBanner: FC = () => {
  const [consents, setConsents] = useState({
    necessary: true, // 必須は常にtrue
    analytics: false,
    notifications: false,
  });

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 shadow-lg">
      <h3 className="font-bold mb-2">プライバシー設定</h3>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" checked disabled className="mr-2" />
          <span>必須Cookie（アプリの動作に必要）</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={consents.analytics}
            onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
            className="mr-2"
          />
          <span>分析（使用状況の改善に使用）</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={consents.notifications}
            onChange={(e) => setConsents({ ...consents, notifications: e.target.checked })}
            className="mr-2"
          />
          <span>通知（禁煙サポートの通知）</span>
        </label>
      </div>
      <button
        onClick={() => saveConsents(consents)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        設定を保存
      </button>
    </div>
  );
};
```

### 通知内容のプライバシー

```typescript
// lib/notifications/privacy.ts

// ❌ 悪い例: ロック画面で見られる可能性
const badNotification = {
  title: '🚬 喫煙記録',
  body: '今日3本目の喫煙を記録しました',
};

// ✅ 良い例: プライベートな内容は隠す
const goodNotification = {
  title: 'Swan',
  body: '記録を更新しました', // 具体的な内容は隠す
};

// ✅ さらに良い例: ユーザーが選択可能
interface NotificationPrivacySettings {
  showDetailOnLockScreen: boolean;
  useGenericTitle: boolean;
}

export function createPrivateNotification(
  content: { title: string; body: string },
  settings: NotificationPrivacySettings
): NotificationPayload {
  if (!settings.showDetailOnLockScreen) {
    return {
      title: settings.useGenericTitle ? 'Swan' : content.title,
      body: '新しい更新があります',
      data: { actualContent: content }, // アプリ内で表示
    };
  }
  return content;
}
```

---

## 7. PWA 特有のセキュリティ

### Service Worker セキュリティ

```javascript
// public/sw.js

// ✅ キャッシュされるコンテンツの検証
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 外部オリジンは慎重に扱う
  if (url.origin !== self.location.origin) {
    // 許可されたオリジンのみキャッシュ
    const allowedOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    if (!allowedOrigins.includes(url.origin)) {
      return; // キャッシュしない
    }
  }

  // キャッシュ戦略を適用...
});

// ✅ 機密データはキャッシュしない
const NEVER_CACHE_PATHS = [
  '/api/auth/',
  '/api/user/',
  '/api/export/',
];

function shouldCache(url: URL): boolean {
  return !NEVER_CACHE_PATHS.some(path => url.pathname.startsWith(path));
}
```

### IndexedDB セキュリティ

```typescript
// lib/db/security.ts

// ⚠️ IndexedDBは暗号化されていない
// デバイスのロックがセキュリティの第一線

// ✅ 機密データの暗号化
import { encrypt, decrypt } from '../crypto/encryption';

export async function saveSecureData<T>(
  key: string,
  data: T,
  encryptionKey: CryptoKey
): Promise<void> {
  const serialized = JSON.stringify(data);
  const encrypted = await encrypt(serialized, encryptionKey);

  const db = await getDB();
  await db.put('secure-store', { key, value: encrypted });
}

export async function getSecureData<T>(
  key: string,
  encryptionKey: CryptoKey
): Promise<T | null> {
  const db = await getDB();
  const stored = await db.get('secure-store', key);

  if (!stored) return null;

  const decrypted = await decrypt(stored.value, encryptionKey);
  return JSON.parse(decrypted);
}

// ✅ 長期間非アクティブ時のデータクリア
export async function clearSensitiveDataIfInactive(): Promise<void> {
  const lastActivity = localStorage.getItem('lastActivity');
  const inactivityThreshold = 7 * 24 * 60 * 60 * 1000; // 7日

  if (lastActivity && Date.now() - parseInt(lastActivity) > inactivityThreshold) {
    await clearAllLocalData();
    // 再ログインを要求
    window.location.href = '/login?reason=inactivity';
  }
}
```

### manifest.json セキュリティ

```json
{
  "name": "Swan - 禁煙サポート",
  "short_name": "Swan",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [...],

  // ⚠️ scopeを必要最小限に
  // ❌ "scope": "https://example.com/" // 広すぎる
  // ✅ "scope": "/" // アプリのルートのみ

  // ✅ 関連アプリの指定（フィッシング対策）
  "related_applications": [],
  "prefer_related_applications": false
}
```

---

## 8. セキュアコーディングチェックリスト

### 認証・認可

- [ ] パスワードはbcrypt/Argon2でハッシュ化
- [ ] JWTは短い有効期限（15分以下）
- [ ] リフレッシュトークンはローテーション実装
- [ ] ログイン試行回数制限（レートリミット）
- [ ] アカウントロックアウト実装
- [ ] セッションの適切な無効化
- [ ] 「ログアウト」で全トークン無効化

### 入力検証

- [ ] 全入力をサーバーサイドで検証
- [ ] Zodなどのスキーマバリデーション使用
- [ ] ファイルアップロードの種類・サイズ制限
- [ ] URLのプロトコル検証（javascript:防止）

### 出力エスケープ

- [ ] HTMLはReactの自動エスケープを活用
- [ ] dangerouslySetInnerHTMLは使用しない（必要時はDOMPurify）
- [ ] URLパラメータのエンコード
- [ ] JSONレスポンスのContent-Type設定

### 通信セキュリティ

- [ ] HTTPS必須（HSTS設定）
- [ ] API通信の認証
- [ ] CORS設定の最小化
- [ ] Cookieの適切な属性設定

### データ保護

- [ ] 機密データの暗号化保存
- [ ] ログに個人情報を出力しない
- [ ] エラーメッセージに内部情報を含めない
- [ ] DBクエリのパラメータ化

### 依存関係

- [ ] npm auditを定期実行
- [ ] Dependabotの設定
- [ ] サードパーティライブラリの最小化
- [ ] SRI（Subresource Integrity）の使用

### PWA特有

- [ ] Service Workerのスコープ制限
- [ ] キャッシュ対象の適切な選定
- [ ] IndexedDBの機密データ暗号化
- [ ] 通知内容のプライバシー配慮

### プライバシー

- [ ] データ最小化原則
- [ ] ユーザー同意の取得・記録
- [ ] データエクスポート機能
- [ ] アカウント削除機能
- [ ] プライバシーポリシーの明示

---

## クイックリファレンス

### 危険なパターン検出コマンド

```bash
# XSS脆弱性の可能性
grep -r "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" .
grep -r "innerHTML" --include="*.ts" --include="*.js" .

# eval系の使用
grep -r "eval\|Function(" --include="*.ts" --include="*.js" .

# ハードコードされた秘密
grep -r "password\|secret\|api_key" --include="*.ts" --include="*.js" . | grep -v "test\|spec\|\.d\.ts"

# SQLインジェクションの可能性
grep -r "\$\{.*\}" --include="*.ts" . | grep -i "select\|insert\|update\|delete"

# 安全でないランダム生成
grep -r "Math.random" --include="*.ts" --include="*.js" .
```

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
