---
name: performance-patterns
description: Webパフォーマンス最適化パターン集。Core Web Vitals改善、React最適化（memo、useMemo、useCallback）、バンドル最適化、画像最適化、Lighthouse改善、ランタイムプロファイリング。パフォーマンステスト・最適化時に使用。
allowed-tools: Read, Grep, Bash, Glob
---

# パフォーマンスパターン集（Swan PWA プロジェクト用）

このスキルは、禁煙・減煙PWAアプリ「Swan」におけるパフォーマンス最適化のベストプラクティスとパターン集です。

## 目次

1. [Core Web Vitals 改善](#1-core-web-vitals-改善)
2. [React パフォーマンス最適化](#2-react-パフォーマンス最適化)
3. [バンドル最適化](#3-バンドル最適化)
4. [画像・メディア最適化](#4-画像メディア最適化)
5. [ネットワーク最適化](#5-ネットワーク最適化)
6. [ランタイムパフォーマンス](#6-ランタイムパフォーマンス)
7. [計測・モニタリング](#7-計測モニタリング)
8. [Next.js 固有の最適化](#8-nextjs-固有の最適化)

---

## 1. Core Web Vitals 改善

### LCP (Largest Contentful Paint) - 目標: 2.5秒以下

#### 問題の特定

```bash
# Lighthouse でLCP要素を特定
npx lighthouse http://localhost:3000 --only-categories=performance --output=json | jq '.audits["largest-contentful-paint-element"]'
```

#### 改善パターン

```typescript
// ❌ 悪い例: LCP画像が遅延ロード
<img src="/hero.jpg" loading="lazy" />

// ✅ 良い例: LCP画像は即座にロード + priority
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // LCP要素には必須
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

```typescript
// ✅ クリティカルCSSのインライン化
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
};
```

```typescript
// ✅ フォントの最適化
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOUTを許容してLCP改善
  preload: true,
});
```

```html
<!-- ✅ 重要リソースのプリロード -->
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/api/initial-data" as="fetch" crossorigin />
```

### FID / INP (First Input Delay / Interaction to Next Paint) - 目標: 100ms以下

#### 問題の特定

```typescript
// 長いタスクを検出
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry);
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

#### 改善パターン

```typescript
// ❌ 悪い例: メインスレッドをブロック
function processLargeData(data: Data[]) {
  return data.map(item => heavyCalculation(item));
}

// ✅ 良い例: タスクを分割
async function processLargeDataChunked(data: Data[]): Promise<Result[]> {
  const results: Result[] = [];
  const CHUNK_SIZE = 100;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const chunkResults = chunk.map(item => heavyCalculation(item));
    results.push(...chunkResults);

    // 他のタスクに処理を譲る
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

// ✅ 良い例: Web Workerで重い処理
// workers/heavyCalculation.ts
self.onmessage = (e: MessageEvent<Data[]>) => {
  const results = e.data.map(item => heavyCalculation(item));
  self.postMessage(results);
};

// 使用側
const worker = new Worker(new URL('../workers/heavyCalculation.ts', import.meta.url));
worker.postMessage(data);
worker.onmessage = (e) => setResults(e.data);
```

```typescript
// ✅ イベントハンドラーの最適化
// ❌ 悪い例: 毎回重い処理
<input onChange={(e) => {
  const filtered = hugeArray.filter(item => item.includes(e.target.value));
  setResults(filtered);
}} />

// ✅ 良い例: デバウンス
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((value: string) => {
  const filtered = hugeArray.filter(item => item.includes(value));
  setResults(filtered);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

### CLS (Cumulative Layout Shift) - 目標: 0.1以下

#### 問題の特定

```typescript
// CLSを計測
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (entry.hadRecentInput) continue;
    console.log('Layout shift:', entry.value, entry.sources);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

#### 改善パターン

```tsx
// ❌ 悪い例: サイズ指定なし
<img src="/photo.jpg" />

// ✅ 良い例: 明示的なサイズ指定
<img src="/photo.jpg" width={400} height={300} />

// ✅ Next.js Imageは自動的にサイズ予約
<Image src="/photo.jpg" width={400} height={300} alt="Photo" />
```

```tsx
// ❌ 悪い例: 動的コンテンツでレイアウトシフト
{isLoading ? null : <Banner />}

// ✅ 良い例: スケルトンでスペース予約
{isLoading ? <BannerSkeleton /> : <Banner />}

// Skeleton コンポーネント
const BannerSkeleton = () => (
  <div className="h-[200px] w-full bg-gray-200 animate-pulse rounded-lg" />
);
```

```css
/* ✅ アスペクト比の予約 */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* ✅ フォントのフォールバック設定 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  /* フォールバックフォントとの差を最小化 */
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 20%;
}
```

---

## 2. React パフォーマンス最適化

### React.memo によるメモ化

```tsx
// ❌ 悪い例: 親の再レンダリングで子も再レンダリング
const ChildComponent = ({ data }: { data: Data }) => {
  return <div>{data.name}</div>;
};

// ✅ 良い例: propsが変わらなければ再レンダリングをスキップ
const ChildComponent = React.memo(({ data }: { data: Data }) => {
  return <div>{data.name}</div>;
});

// カスタム比較関数（深い比較が必要な場合）
const ChildComponent = React.memo(
  ({ data }: { data: Data }) => <div>{data.name}</div>,
  (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
);
```

### useMemo で計算結果をキャッシュ

```tsx
// ❌ 悪い例: 毎レンダリングで再計算
const SmokeStats = ({ records }: { records: SmokeRecord[] }) => {
  // 毎回フィルタリング
  const todayRecords = records.filter(r => isToday(r.timestamp));
  const weeklyAverage = calculateWeeklyAverage(records);

  return (
    <div>
      <p>今日: {todayRecords.length}本</p>
      <p>週平均: {weeklyAverage}本</p>
    </div>
  );
};

// ✅ 良い例: 依存配列が変わった時だけ再計算
const SmokeStats = ({ records }: { records: SmokeRecord[] }) => {
  const todayRecords = useMemo(
    () => records.filter(r => isToday(r.timestamp)),
    [records]
  );

  const weeklyAverage = useMemo(
    () => calculateWeeklyAverage(records),
    [records]
  );

  return (
    <div>
      <p>今日: {todayRecords.length}本</p>
      <p>週平均: {weeklyAverage}本</p>
    </div>
  );
};
```

### useCallback で関数参照を固定

```tsx
// ❌ 悪い例: 毎回新しい関数を生成
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // 毎レンダリングで新しい関数
  const handleClick = () => {
    console.log(count);
  };

  return <ChildComponent onClick={handleClick} />;
};

// ✅ 良い例: 依存配列が変わった時だけ新しい関数
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);

  return <MemoizedChild onClick={handleClick} />;
};

const MemoizedChild = React.memo(ChildComponent);
```

### 状態の最適化

```tsx
// ❌ 悪い例: 大きなオブジェクトを1つのstateに
const [formData, setFormData] = useState({
  name: '',
  email: '',
  settings: { /* 大量の設定 */ },
  history: [ /* 大量の履歴 */ ],
});

// nameを更新すると全体が再レンダリング
setFormData({ ...formData, name: 'new name' });

// ✅ 良い例: 関連するデータごとにstateを分割
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [settings, setSettings] = useState({ /* ... */ });
const [history, setHistory] = useState([ /* ... */ ]);

// または useReducer を使用
const [state, dispatch] = useReducer(formReducer, initialState);
```

### 仮想化（Virtualization）

```tsx
// ❌ 悪い例: 大量のアイテムを全てレンダリング
const HistoryList = ({ records }: { records: SmokeRecord[] }) => {
  return (
    <ul>
      {records.map(record => (
        <HistoryItem key={record.id} record={record} />
      ))}
    </ul>
  );
};

// ✅ 良い例: 可視領域のみレンダリング
import { FixedSizeList } from 'react-window';

const HistoryList = ({ records }: { records: SmokeRecord[] }) => {
  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={records.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <div style={style}>
          <HistoryItem record={records[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};

// 動的な高さの場合
import { VariableSizeList } from 'react-window';

const getItemSize = (index: number) => {
  return records[index].hasNote ? 120 : 80;
};

<VariableSizeList
  height={600}
  width="100%"
  itemCount={records.length}
  itemSize={getItemSize}
>
  {/* ... */}
</VariableSizeList>
```

### 遅延ロード（Lazy Loading）

```tsx
// ✅ コンポーネントの遅延ロード
import dynamic from 'next/dynamic';

// 初期バンドルから除外
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // クライアントのみ
});

// 条件付きロード
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <Spinner />,
});

function Dashboard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      <MainContent />
      {isAdmin && <AdminPanel />} {/* 管理者のみロード */}
    </div>
  );
}
```

---

## 3. バンドル最適化

### バンドル分析

```bash
# Next.js バンドル分析
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});

# 実行
ANALYZE=true npm run build
```

### Tree Shaking の最適化

```typescript
// ❌ 悪い例: 全体をインポート
import _ from 'lodash'; // 全体がバンドルされる
_.debounce(fn, 300);

// ✅ 良い例: 必要な関数のみインポート
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✅ さらに良い: 軽量な代替ライブラリ
import { debounce } from 'lodash-es'; // ES modules版
// または
import debounce from 'just-debounce-it'; // 単機能ライブラリ
```

### 重い依存関係の置換

| 重いライブラリ | サイズ | 軽量な代替 | サイズ |
|--------------|-------|----------|-------|
| moment.js | 66KB | day.js | 2KB |
| lodash | 71KB | lodash-es (個別) | 1-5KB |
| date-fns (全体) | 75KB | date-fns (個別) | 1-3KB |
| uuid | 3KB | crypto.randomUUID() | 0KB |

```typescript
// ✅ moment.js → day.js
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';

dayjs.extend(relativeTime);
dayjs.locale('ja');

dayjs().format('YYYY年MM月DD日');
dayjs().fromNow(); // "3時間前"
```

### コード分割

```typescript
// next.config.js
module.exports = {
  // 自動的にページごとに分割される（Next.js）

  // Webpackの設定でさらに細かく制御
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // ベンダーコードを分離
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          // 共通コンポーネントを分離
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};
```

### 未使用コードの検出

```bash
# 未使用のexportを検出
npx ts-prune

# 未使用の依存関係を検出
npx depcheck

# 未使用のCSSを検出（PurgeCSSはTailwindに内蔵）
```

---

## 4. 画像・メディア最適化

### Next.js Image 最適化

```tsx
import Image from 'next/image';

// ✅ 基本的な使用法
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Above the fold の画像
/>

// ✅ レスポンシブ画像
<Image
  src="/photo.jpg"
  alt="Photo"
  fill // 親要素にフィット
  sizes="(max-width: 768px) 100vw, 50vw"
  style={{ objectFit: 'cover' }}
/>

// ✅ プレースホルダー
<Image
  src="/photo.jpg"
  alt="Photo"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### next.config.js の画像設定

```javascript
module.exports = {
  images: {
    // 最新フォーマットを優先
    formats: ['image/avif', 'image/webp'],

    // レスポンシブ画像のサイズ
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // 外部画像ドメインの許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],

    // 画像の最小化
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日
  },
};
```

### 画像の遅延ロード

```tsx
// Next.js Imageはデフォルトで遅延ロード
// priorityを指定しない限り、viewport外の画像は遅延ロード

// カスタム遅延ロード
import { useInView } from 'react-intersection-observer';

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px', // 200px手前でロード開始
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Image src={src} alt={alt} width={400} height={300} />
      ) : (
        <div className="w-[400px] h-[300px] bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

### アイコンの最適化

```tsx
// ❌ 悪い例: アイコンライブラリ全体をインポート
import { FaHome, FaUser } from 'react-icons/fa';

// ✅ 良い例: 個別インポート
import FaHome from 'react-icons/fa/FaHome';
import FaUser from 'react-icons/fa/FaUser';

// ✅ さらに良い: SVGスプライト or インラインSVG
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width={24} height={24}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
```

---

## 5. ネットワーク最適化

### リソースヒント

```html
<!-- DNS プリフェッチ -->
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- プリコネクト（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- プリロード（重要なリソース） -->
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin />

<!-- プリフェッチ（次のページで使うリソース） -->
<link rel="prefetch" href="/next-page-bundle.js" />
```

### HTTP/2 プッシュ（Vercel/Next.js）

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</fonts/custom.woff2>; rel=preload; as=font; crossorigin',
          },
        ],
      },
    ];
  },
};
```

### API レスポンスの最適化

```typescript
// ✅ 必要なフィールドのみ返す
// ❌ 悪い例
app.get('/api/records', async (req, res) => {
  const records = await prisma.smokeRecord.findMany({
    include: { user: true, tags: true, notes: true }, // 全部返す
  });
  res.json(records);
});

// ✅ 良い例
app.get('/api/records', async (req, res) => {
  const records = await prisma.smokeRecord.findMany({
    select: {
      id: true,
      timestamp: true,
      tag: true,
      // userやnotesは必要な時だけ
    },
  });
  res.json(records);
});
```

### キャッシュ戦略

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      // 静的アセット: 長期キャッシュ
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API: 短期キャッシュ
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};
```

---

## 6. ランタイムパフォーマンス

### requestAnimationFrame の活用

```typescript
// ❌ 悪い例: 直接DOMを更新
window.addEventListener('scroll', () => {
  element.style.transform = `translateY(${window.scrollY}px)`;
});

// ✅ 良い例: requestAnimationFrameでバッチ処理
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      element.style.transform = `translateY(${window.scrollY}px)`;
      ticking = false;
    });
    ticking = true;
  }
});
```

### Intersection Observer

```typescript
// ❌ 悪い例: scrollイベントで可視性チェック
window.addEventListener('scroll', () => {
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    loadContent();
  }
});

// ✅ 良い例: Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadContent();
        observer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '200px' }
);

observer.observe(element);
```

### メモリリーク防止

```typescript
// ✅ クリーンアップを忘れずに
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler); // クリーンアップ
  };
}, []);

// ✅ AbortController でfetchをキャンセル
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

  return () => controller.abort();
}, []);
```

---

## 7. 計測・モニタリング

### Lighthouse CLI

```bash
# 基本的な計測
npx lighthouse http://localhost:3000 --output=html --output-path=./report.html

# モバイル設定
npx lighthouse http://localhost:3000 \
  --preset=perf \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4

# JSON出力でCI連携
npx lighthouse http://localhost:3000 \
  --output=json \
  --output-path=./lighthouse-results.json
```

### Web Vitals の計測

```typescript
// lib/analytics/webVitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

type MetricHandler = (metric: { name: string; value: number; id: string }) => void;

export function reportWebVitals(onReport: MetricHandler): void {
  onCLS(onReport);
  onFID(onReport);
  onLCP(onReport);
  onFCP(onReport);
  onTTFB(onReport);
}

// 使用例（Google Analytics）
reportWebVitals(({ name, value, id }) => {
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    non_interaction: true,
  });
});
```

### Performance API

```typescript
// ページロード時間の計測
window.addEventListener('load', () => {
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

  console.log({
    // DNS解決
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    // TCP接続
    tcp: navigation.connectEnd - navigation.connectStart,
    // リクエスト〜レスポンス
    request: navigation.responseEnd - navigation.requestStart,
    // DOM解析
    domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
    // 全体のロード時間
    total: navigation.loadEventEnd - navigation.startTime,
  });
});

// カスタムマーキング
performance.mark('feature-start');
// 処理
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

const [measure] = performance.getEntriesByName('feature-duration');
console.log(`Feature took ${measure.duration}ms`);
```

### React DevTools Profiler

```tsx
// 開発環境でのプロファイリング
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
  });
};

<Profiler id="Dashboard" onRender={onRender}>
  <Dashboard />
</Profiler>
```

---

## 8. Next.js 固有の最適化

### next.config.js 最適化設定

```javascript
// next.config.js
module.exports = {
  // SWC Minifier（高速）
  swcMinify: true,

  // 本番ビルドでソースマップを無効化
  productionBrowserSourceMaps: false,

  // Gzip圧縮
  compress: true,

  // Powered-by ヘッダー削除（微小なサイズ削減）
  poweredByHeader: false,

  // 実験的機能
  experimental: {
    // CSS最適化
    optimizeCss: true,
    // パッケージの外部化（サーバーサイド）
    serverComponentsExternalPackages: ['sharp'],
  },

  // Webpack最適化
  webpack: (config, { dev, isServer }) => {
    // 本番ビルドのみ
    if (!dev && !isServer) {
      // モジュール連結
      config.optimization.concatenateModules = true;
    }
    return config;
  },
};
```

### Server Components の活用

```tsx
// ✅ Server Component（デフォルト）
// app/dashboard/page.tsx
async function DashboardPage() {
  // サーバーで実行、クライアントにJSを送らない
  const data = await fetchDashboardData();

  return (
    <div>
      <h1>ダッシュボード</h1>
      <StaticContent data={data} />
      {/* インタラクティブな部分のみClient Component */}
      <InteractiveCounter />
    </div>
  );
}

// ✅ Client Component（必要な部分のみ）
// components/InteractiveCounter.tsx
'use client';

import { useState } from 'react';

export function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Streaming SSR

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* 即座に表示 */}
      <header>Dashboard Header</header>

      {/* データ取得完了まで Skeleton 表示 */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </div>
  );
}

// 非同期コンポーネント
async function Stats() {
  const stats = await fetchStats(); // 遅いAPI
  return <StatsDisplay stats={stats} />;
}
```

### Route Segment Config

```typescript
// app/dashboard/page.tsx

// 静的生成を強制
export const dynamic = 'force-static';

// 再検証間隔（ISR）
export const revalidate = 60; // 60秒

// ランタイム指定
export const runtime = 'edge'; // Edge Runtime

// 動的パラメータの生成
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

---

## パフォーマンスチェックリスト

### Core Web Vitals
- [ ] LCP: 2.5秒以下
- [ ] FID/INP: 100ms以下
- [ ] CLS: 0.1以下

### バンドル
- [ ] 初期JS: 200KB以下（gzip後）
- [ ] 総JS: 500KB以下
- [ ] Tree shakingが効いている
- [ ] 未使用コードが削除されている

### 画像
- [ ] Next.js Image を使用
- [ ] WebP/AVIF フォーマット
- [ ] 適切なサイズ指定
- [ ] 遅延ロード設定

### React
- [ ] 不要な再レンダリングがない
- [ ] 重い計算はuseMemoでキャッシュ
- [ ] 長いリストは仮想化
- [ ] 適切なコード分割

### ネットワーク
- [ ] リソースヒントの設定
- [ ] キャッシュヘッダーの設定
- [ ] APIレスポンスの最適化

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
