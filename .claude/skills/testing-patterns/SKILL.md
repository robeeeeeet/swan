---
name: testing-patterns
description: E2Eテスト・ユニットテストのパターン集。Playwright API、Page Object Model、テストデータ管理、モック戦略、CI/CD統合、アクセシビリティテスト、ビジュアルリグレッション。テスト作成・実行時に使用。
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# テストパターン集（Swan PWA プロジェクト用）

このスキルは、禁煙・減煙PWAアプリ「Swan」におけるテスト実装のベストプラクティスとパターン集です。

## 目次

1. [Playwright 基本パターン](#1-playwright-基本パターン)
2. [Page Object Model](#2-page-object-model)
3. [テストデータ管理](#3-テストデータ管理)
4. [モック・スタブ戦略](#4-モックスタブ戦略)
5. [アクセシビリティテスト](#5-アクセシビリティテスト)
6. [ビジュアルリグレッションテスト](#6-ビジュアルリグレッションテスト)
7. [CI/CD 統合](#7-cicd-統合)
8. [テスト設計原則](#8-テスト設計原則)

---

## 1. Playwright 基本パターン

### プロジェクト設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // デスクトップブラウザ
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // モバイルデバイス
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // 開発サーバーを自動起動
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 基本的なテスト構造

```typescript
// tests/smoke-record.spec.ts
import { test, expect } from '@playwright/test';

test.describe('喫煙記録機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前の共通セットアップ
    await page.goto('/');
    // ローカルストレージをクリア
    await page.evaluate(() => localStorage.clear());
  });

  test.afterEach(async ({ page }, testInfo) => {
    // テスト失敗時のデバッグ情報収集
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `test-results/failure-${testInfo.title}.png`,
        fullPage: true,
      });
    }
  });

  test('吸ったボタンでカウントが増加する', async ({ page }) => {
    // Arrange: 初期状態確認
    const counter = page.getByTestId('smoke-counter');
    await expect(counter).toHaveText('0');

    // Act: ボタンクリック
    await page.getByTestId('button-smoked').click();

    // Assert: カウント増加
    await expect(counter).toHaveText('1');
  });

  test('記録がローカルストレージに保存される', async ({ page }) => {
    await page.getByTestId('button-smoked').click();

    // ローカルストレージを検証
    const stored = await page.evaluate(() => {
      return localStorage.getItem('smokeRecords');
    });

    expect(stored).not.toBeNull();
    const records = JSON.parse(stored!);
    expect(records).toHaveLength(1);
  });
});
```

### ロケーター戦略

```typescript
// 推奨順序（上が最も推奨）
test('ロケーター戦略の例', async ({ page }) => {
  // 1. data-testid（最も安定）
  await page.getByTestId('submit-button').click();

  // 2. ロール + アクセシブルネーム
  await page.getByRole('button', { name: '送信' }).click();

  // 3. ラベル（フォーム要素）
  await page.getByLabel('メールアドレス').fill('test@example.com');

  // 4. プレースホルダー
  await page.getByPlaceholder('検索...').fill('キーワード');

  // 5. テキスト（動的に変わる可能性あり、非推奨）
  await page.getByText('ログイン').click();

  // ❌ 避けるべき: CSSセレクタ、XPath
  // await page.locator('.btn-primary').click();
  // await page.locator('//button[@class="submit"]').click();
});
```

### 待機戦略

```typescript
test('適切な待機パターン', async ({ page }) => {
  // ✅ 自動待機（推奨）
  await page.getByTestId('button').click(); // クリック可能になるまで自動待機

  // ✅ 要素の状態を待機
  await expect(page.getByTestId('loading')).toBeHidden();
  await expect(page.getByTestId('result')).toBeVisible();

  // ✅ ネットワークリクエスト完了を待機
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/records') && resp.status() === 200),
    page.getByTestId('save-button').click(),
  ]);

  // ✅ カスタム条件を待機
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid="counter"]')?.textContent !== '0';
  });

  // ❌ 避けるべき: 固定時間待機
  // await page.waitForTimeout(3000);
});
```

---

## 2. Page Object Model

### 基本構造

```typescript
// tests/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 共通要素
  get header(): Locator {
    return this.page.getByRole('banner');
  }

  get navigation(): Locator {
    return this.page.getByRole('navigation');
  }

  get offlineIndicator(): Locator {
    return this.page.getByTestId('offline-indicator');
  }

  // 共通アクション
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async isOffline(): Promise<boolean> {
    return this.offlineIndicator.isVisible();
  }
}
```

### ダッシュボードページ

```typescript
// tests/pages/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  // ロケーター
  get smokeCounter(): Locator {
    return this.page.getByTestId('smoke-counter');
  }

  get buttonSmoked(): Locator {
    return this.page.getByTestId('button-smoked');
  }

  get buttonCraving(): Locator {
    return this.page.getByTestId('button-craving');
  }

  get buttonResisted(): Locator {
    return this.page.getByTestId('button-resisted');
  }

  get todayCount(): Locator {
    return this.page.getByTestId('today-count');
  }

  get celebrationModal(): Locator {
    return this.page.getByTestId('celebration-modal');
  }

  get tagModal(): Locator {
    return this.page.getByTestId('tag-modal');
  }

  // アクション
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async recordSmoke(): Promise<void> {
    await this.buttonSmoked.click();
  }

  async recordCraving(): Promise<void> {
    await this.buttonCraving.click();
  }

  async recordResisted(): Promise<void> {
    await this.buttonResisted.click();
  }

  async selectTag(tagName: string): Promise<void> {
    await this.page.getByTestId(`tag-${tagName}`).click();
    await this.page.getByTestId('button-save-tag').click();
  }

  async getTodayCount(): Promise<number> {
    const text = await this.todayCount.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  // アサーション
  async expectCountToBe(count: number): Promise<void> {
    await expect(this.smokeCounter).toHaveText(String(count));
  }

  async expectCelebrationVisible(): Promise<void> {
    await expect(this.celebrationModal).toBeVisible();
  }

  async expectTagModalVisible(): Promise<void> {
    await expect(this.tagModal).toBeVisible();
  }
}
```

### コンポーネントオブジェクト

```typescript
// tests/components/NotificationPrompt.ts
import { Page, Locator, expect } from '@playwright/test';

export class NotificationPromptComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get container(): Locator {
    return this.page.getByTestId('notification-prompt');
  }

  get enableButton(): Locator {
    return this.page.getByTestId('enable-notifications');
  }

  get dismissButton(): Locator {
    return this.page.getByTestId('dismiss-prompt');
  }

  async isVisible(): Promise<boolean> {
    return this.container.isVisible();
  }

  async enable(): Promise<void> {
    await this.enableButton.click();
  }

  async dismiss(): Promise<void> {
    await this.dismissButton.click();
  }

  async expectHidden(): Promise<void> {
    await expect(this.container).toBeHidden();
  }
}
```

### テストでの使用

```typescript
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { NotificationPromptComponent } from './components/NotificationPrompt';

test.describe('ダッシュボード', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('喫煙記録の完全フロー', async ({ page }) => {
    // 初期状態
    await dashboard.expectCountToBe(0);

    // 記録
    await dashboard.recordSmoke();

    // タグ選択
    await dashboard.expectTagModalVisible();
    await dashboard.selectTag('work-stress');

    // カウント確認
    await dashboard.expectCountToBe(1);
  });

  test('我慢成功で祝福メッセージ', async ({ page }) => {
    await dashboard.recordResisted();
    await dashboard.expectCelebrationVisible();
  });

  test('通知プロンプトを閉じる', async ({ page }) => {
    const notificationPrompt = new NotificationPromptComponent(page);

    if (await notificationPrompt.isVisible()) {
      await notificationPrompt.dismiss();
      await notificationPrompt.expectHidden();
    }
  });
});
```

---

## 3. テストデータ管理

### Fixtures（フィクスチャ）

```typescript
// tests/fixtures/index.ts
import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { SettingsPage } from '../pages/SettingsPage';

// カスタムフィクスチャの型定義
type Fixtures = {
  dashboardPage: DashboardPage;
  settingsPage: SettingsPage;
  authenticatedPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboard = new DashboardPage(page);
    await use(dashboard);
  },

  settingsPage: async ({ page }, use) => {
    const settings = new SettingsPage(page);
    await use(settings);
  },

  // 認証済み状態のフィクスチャ
  authenticatedPage: async ({ page }, use) => {
    // ログイン処理
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('TestPassword123!');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('/dashboard');

    const dashboard = new DashboardPage(page);
    await use(dashboard);
  },
});

export { expect } from '@playwright/test';
```

### テストデータファクトリ

```typescript
// tests/factories/smokeRecord.ts
interface SmokeRecord {
  id: string;
  timestamp: number;
  tag?: string;
  synced: boolean;
}

export function createSmokeRecord(overrides: Partial<SmokeRecord> = {}): SmokeRecord {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    tag: undefined,
    synced: false,
    ...overrides,
  };
}

export function createSmokeRecords(count: number): SmokeRecord[] {
  return Array.from({ length: count }, (_, i) =>
    createSmokeRecord({
      timestamp: Date.now() - i * 60 * 60 * 1000, // 1時間間隔
    })
  );
}

// tests/factories/user.ts
interface User {
  id: string;
  email: string;
  dailyGoal: number;
  notificationsEnabled: boolean;
}

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    email: `test-${Date.now()}@example.com`,
    dailyGoal: 10,
    notificationsEnabled: false,
    ...overrides,
  };
}
```

### データシーディング

```typescript
// tests/helpers/seedData.ts
import { Page } from '@playwright/test';
import { createSmokeRecords } from '../factories/smokeRecord';

export async function seedLocalStorage(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript((data) => {
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, data);
}

export async function seedSmokeRecords(page: Page, count: number): Promise<void> {
  const records = createSmokeRecords(count);
  await seedLocalStorage(page, { smokeRecords: records });
}

// テストでの使用
test('履歴に既存データがある状態', async ({ page }) => {
  await seedSmokeRecords(page, 5);
  await page.goto('/history');

  const historyItems = page.getByTestId('history-item');
  await expect(historyItems).toHaveCount(5);
});
```

---

## 4. モック・スタブ戦略

### API モック

```typescript
// tests/mocks/api.ts
import { Page, Route } from '@playwright/test';

export async function mockApiSuccess(page: Page): Promise<void> {
  await page.route('**/api/smoke-records', async (route: Route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', timestamp: Date.now(), tag: 'stress' },
        ]),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'new-id' }),
      });
    }
  });
}

export async function mockApiError(page: Page, statusCode: number = 500): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });
}

export async function mockApiDelay(page: Page, delayMs: number = 3000): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await route.continue();
  });
}

// テストでの使用
test('API エラー時のエラー表示', async ({ page }) => {
  await mockApiError(page, 500);
  await page.goto('/dashboard');

  await page.getByTestId('button-smoked').click();

  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(page.getByTestId('error-message')).toContainText('エラーが発生しました');
});
```

### 時間のモック

```typescript
// tests/helpers/time.ts
import { Page } from '@playwright/test';

export async function mockDate(page: Page, date: Date): Promise<void> {
  await page.addInitScript((timestamp) => {
    const OriginalDate = Date;

    // @ts-ignore
    window.Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(timestamp);
        } else {
          // @ts-ignore
          super(...args);
        }
      }

      static now() {
        return timestamp;
      }
    };
  }, date.getTime());
}

// テストでの使用
test('日付変更時にカウントがリセット', async ({ page }) => {
  // 昨日の日付でデータをシード
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await seedLocalStorage(page, {
    smokeRecords: [{ id: '1', timestamp: yesterday.getTime() }],
    lastResetDate: yesterday.toISOString().split('T')[0],
  });

  await page.goto('/dashboard');

  // 今日のカウントは0であるべき
  await expect(page.getByTestId('today-count')).toHaveText('0本');
});
```

### 通知のモック

```typescript
// tests/helpers/notifications.ts
import { Page } from '@playwright/test';

export async function mockNotificationPermission(
  page: Page,
  permission: 'granted' | 'denied' | 'default'
): Promise<void> {
  await page.addInitScript((perm) => {
    // @ts-ignore
    window.Notification = {
      permission: perm,
      requestPermission: async () => perm,
    };
  }, permission);
}

export async function grantNotificationPermission(page: Page): Promise<void> {
  const context = page.context();
  await context.grantPermissions(['notifications']);
}

// テストでの使用
test('通知が許可済みの場合、プロンプトを表示しない', async ({ page }) => {
  await mockNotificationPermission(page, 'granted');
  await page.goto('/dashboard');

  await expect(page.getByTestId('notification-prompt')).toBeHidden();
});
```

### オフラインモード

```typescript
test('オフライン時の動作', async ({ page, context }) => {
  await page.goto('/dashboard');

  // オンラインで記録
  await page.getByTestId('button-smoked').click();
  await expect(page.getByTestId('smoke-counter')).toHaveText('1');

  // オフラインに切り替え
  await context.setOffline(true);

  // オフラインインジケーター表示
  await expect(page.getByTestId('offline-indicator')).toBeVisible();

  // オフラインでも記録可能
  await page.getByTestId('button-smoked').click();
  await expect(page.getByTestId('smoke-counter')).toHaveText('2');

  // 同期待ちアイコン表示
  await expect(page.getByTestId('sync-pending')).toBeVisible();

  // オンラインに復帰
  await context.setOffline(false);

  // 自動同期
  await expect(page.getByTestId('sync-pending')).toBeHidden();
});
```

---

## 5. アクセシビリティテスト

### axe-core 統合

```typescript
// tests/helpers/a11y.ts
import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkA11y(
  page: Page,
  options?: { exclude?: string[] }
): Promise<void> {
  const builder = new AxeBuilder({ page });

  if (options?.exclude) {
    builder.exclude(options.exclude);
  }

  const results = await builder.analyze();

  // 違反がある場合、詳細を出力
  if (results.violations.length > 0) {
    console.log('Accessibility violations:', JSON.stringify(results.violations, null, 2));
  }

  expect(results.violations).toEqual([]);
}

// 特定ルールのみチェック
export async function checkA11yRules(
  page: Page,
  rules: string[]
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withRules(rules)
    .analyze();

  expect(results.violations).toEqual([]);
}
```

### アクセシビリティテストスイート

```typescript
// tests/a11y.spec.ts
import { test, expect } from '@playwright/test';
import { checkA11y } from './helpers/a11y';

test.describe('アクセシビリティ', () => {
  const pages = [
    { name: 'ダッシュボード', path: '/' },
    { name: '履歴', path: '/history' },
    { name: '設定', path: '/settings' },
    { name: 'ログイン', path: '/login' },
  ];

  for (const { name, path } of pages) {
    test(`${name}ページのa11yチェック`, async ({ page }) => {
      await page.goto(path);
      await checkA11y(page);
    });
  }

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(firstFocused).toBeTruthy();

    // すべてのインタラクティブ要素にフォーカス可能
    const interactiveElements = await page.locator('button, a, input, select, textarea').count();

    for (let i = 0; i < interactiveElements; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'BODY']).toContain(focused);
    }
  });

  test('フォーカストラップ（モーダル）', async ({ page }) => {
    await page.goto('/');

    // モーダルを開く
    await page.getByTestId('button-smoked').click();
    await expect(page.getByTestId('tag-modal')).toBeVisible();

    // Tabでモーダル内を循環
    const modalFocusableCount = await page
      .getByTestId('tag-modal')
      .locator('button, input, a')
      .count();

    for (let i = 0; i < modalFocusableCount + 1; i++) {
      await page.keyboard.press('Tab');
    }

    // フォーカスがモーダル内に留まっている
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.closest('[data-testid="tag-modal"]') !== null;
    });
    expect(focusedElement).toBe(true);

    // Escapeで閉じる
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('tag-modal')).toBeHidden();
  });

  test('スクリーンリーダー対応', async ({ page }) => {
    await page.goto('/');

    // 重要な要素にaria-labelがある
    const buttons = page.locator('button[aria-label]');
    expect(await buttons.count()).toBeGreaterThan(0);

    // ランドマークが適切に設定されている
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    // 画像にaltテキストがある
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
```

---

## 6. ビジュアルリグレッションテスト

### スクリーンショット比較

```typescript
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ビジュアルリグレッション', () => {
  test('ダッシュボードの外観', async ({ page }) => {
    await page.goto('/');

    // ページ全体のスクリーンショット
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled', // アニメーションを無効化
    });
  });

  test('コンポーネントの外観', async ({ page }) => {
    await page.goto('/');

    // 特定コンポーネントのスクリーンショット
    const smokeButton = page.getByTestId('button-smoked');
    await expect(smokeButton).toHaveScreenshot('smoke-button.png');

    // ホバー状態
    await smokeButton.hover();
    await expect(smokeButton).toHaveScreenshot('smoke-button-hover.png');
  });

  test('モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
    });
  });

  test('ダークモード', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
    });
  });
});
```

### カスタムスクリーンショット設定

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100, // 許容する差分ピクセル数
      maxDiffPixelRatio: 0.01, // 許容する差分比率
      threshold: 0.2, // ピクセル比較の閾値
      animations: 'disabled',
    },
  },
  // スクリーンショットディレクトリ
  snapshotDir: './tests/snapshots',
});
```

---

## 7. CI/CD 統合

### GitHub Actions 設定

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-screenshots
          path: test-results/
          retention-days: 7

  # ビジュアルリグレッションテスト（別ジョブ）
  visual-regression:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Run visual tests
        run: npx playwright test --project=chromium tests/visual.spec.ts

      - name: Upload visual diff
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff
          path: tests/snapshots/
          retention-days: 7
```

### テスト結果のSlack通知

```yaml
# .github/workflows/playwright.yml（追加）
      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Playwright tests failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Playwright Tests Failed*\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref_name }}\nCommit: ${{ github.sha }}"
                  }
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "text": "View Run" },
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 8. テスト設計原則

### AAA パターン

```typescript
test('AAA パターンの例', async ({ page }) => {
  // Arrange: テストの準備
  await page.goto('/');
  const counter = page.getByTestId('smoke-counter');
  await expect(counter).toHaveText('0');

  // Act: テスト対象の操作
  await page.getByTestId('button-smoked').click();

  // Assert: 結果の検証
  await expect(counter).toHaveText('1');
});
```

### テストの独立性

```typescript
// ✅ 良い例: 各テストが独立
test.describe('独立したテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にクリーンな状態に
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('テスト1', async ({ page }) => {
    // このテストの結果は他に影響しない
  });

  test('テスト2', async ({ page }) => {
    // テスト1の結果に依存しない
  });
});

// ❌ 悪い例: テスト間の依存
test.describe.serial('依存したテスト', () => {
  test('ステップ1: ログイン', async ({ page }) => {
    // ログイン処理
  });

  test('ステップ2: 記録', async ({ page }) => {
    // ステップ1のログイン状態に依存 ❌
  });
});
```

### テストの命名規則

```typescript
// 推奨: [対象]_[状況]_[期待結果]
test('喫煙ボタン_クリック時_カウントが1増加する', async ({ page }) => {});
test('オフライン時_記録ボタンクリック_ローカルに保存される', async ({ page }) => {});
test('通知拒否済み_設定画面_再許可ボタンが表示される', async ({ page }) => {});

// または日本語で自然に
test('吸ったボタンをクリックするとカウントが増える', async ({ page }) => {});
test('オフライン時でも記録できる', async ({ page }) => {});
```

### テストピラミッド

```
         /\
        /  \        E2E テスト（少数）
       /----\       - 重要なユーザーフロー
      /      \      - クリティカルパス
     /--------\
    /          \    統合テスト（中程度）
   /------------\   - API統合
  /              \  - コンポーネント連携
 /----------------\
/                  \ ユニットテスト（多数）
                     - 個別関数
                     - ユーティリティ
                     - Hooks
```

---

## チェックリスト

### テスト作成時
- [ ] data-testid を使用してセレクタを安定化
- [ ] Page Object Model でページを構造化
- [ ] テストデータはファクトリで生成
- [ ] API はモックして独立性を確保
- [ ] 各テストは独立して実行可能

### テスト実行時
- [ ] ローカルで全テストがパス
- [ ] CI/CD パイプラインに統合
- [ ] 失敗時のスクリーンショット保存
- [ ] テストレポートの生成

### カバレッジ
- [ ] ハッピーパス（正常系）
- [ ] エラーケース（異常系）
- [ ] エッジケース（境界値）
- [ ] モバイル表示
- [ ] オフライン動作
- [ ] アクセシビリティ

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
