/**
 * 禁煙対策Tips定義
 * 30種類のカテゴリー別アドバイス
 */

export type TipCategory =
  | '感覚刺激'
  | '呼吸法'
  | '代替行動'
  | '心理・認知'
  | '運動'
  | '環境調整'
  | '食事・栄養'
  | 'コミュニケーション'
  | '急速休息';

export interface Tip {
  id: number;
  category: TipCategory;
  action: string;
  description: string;
}

/**
 * 禁煙対策Tips一覧
 * カテゴリー別に整理された30種類のアドバイス
 */
export const TIPS: Tip[] = [
  {
    id: 1,
    category: '感覚刺激',
    action: '冷水を飲む',
    description: '冷たい水が喉を通る感覚でリフレッシュし、衝動を落ち着かせる。',
  },
  {
    id: 2,
    category: '感覚刺激',
    action: '歯を磨く',
    description: '口の中をスッキリさせ、タバコの味を入れたくない心理を作る。',
  },
  {
    id: 3,
    category: '呼吸法',
    action: '深呼吸（15秒法）',
    description: '鼻から深く吸い、口からゆっくり長く吐く。副交感神経を優位にする。',
  },
  {
    id: 4,
    category: '代替行動',
    action: 'シュガーレスガムを噛む',
    description: '顎を動かすことで脳への血流を促し、口寂しさを紛らわす。',
  },
  {
    id: 5,
    category: '感覚刺激',
    action: '顔を洗う',
    description: '冷たい水で顔を洗うことで、交感神経を刺激し意識を切り替える。',
  },
  {
    id: 6,
    category: '代替行動',
    action: '硬い野菜をかじる',
    description: '人参やセロリなど、歯ごたえのあるものを食べてストレスを発散する。',
  },
  {
    id: 7,
    category: '代替行動',
    action: 'ストローで空気を吸う',
    description: '喫煙の「吸って吐く」動作を擬似的に行い、脳を騙す。',
  },
  {
    id: 8,
    category: '心理・認知',
    action: '5分間タイマーセット',
    description: '「一生吸わない」ではなく「あと5分だけ待つ」と先延ばしにする。衝動のピークは3分で過ぎる。',
  },
  {
    id: 9,
    category: '運動',
    action: '軽いストレッチ',
    description: '背伸びや肩回しを行い、筋肉の緊張（イライラ）をほぐす。',
  },
  {
    id: 10,
    category: '環境調整',
    action: '場所を変える',
    description: '吸いたくなった場所（部屋や喫煙所付近）から物理的に移動する。',
  },
  {
    id: 11,
    category: '代替行動',
    action: '強烈なミントタブレット',
    description: 'フリスクやミンティアなどの強い刺激で口内感覚を上書きする。',
  },
  {
    id: 12,
    category: '代替行動',
    action: 'テトリス等の単純ゲーム',
    description: '視覚的・空間的な作業に集中することで、渇望のイメージを脳から追い出す。',
  },
  {
    id: 13,
    category: '心理・認知',
    action: '禁煙アプリを見る',
    description: '経過時間や節約できた金額を確認し、達成感を報酬として脳に与える。',
  },
  {
    id: 14,
    category: '感覚刺激',
    action: '氷を口に含む',
    description: '冷たい刺激に集中させることで、吸いたい感覚を麻痺させる。',
  },
  {
    id: 15,
    category: '代替行動',
    action: 'ツボ押し（手・耳）',
    description: '「神門（耳の上部）」や「合谷（手の親指と人差指の間）」を押してリラックスする。',
  },
  {
    id: 16,
    category: '食事・栄養',
    action: 'ビタミンCを摂る',
    description: '柑橘類やジュースでビタミン補給。喫煙欲求を減らす効果が期待される。',
  },
  {
    id: 17,
    category: '心理・認知',
    action: '「なぜ辞めたか」を読む',
    description: '禁煙開始時に書いた「禁煙の理由リスト」を読み返し、初心を思い出す。',
  },
  {
    id: 18,
    category: '代替行動',
    action: '歌を歌う（ハミング）',
    description: '声を出すことで喉の感覚を使い、ストレスを発散する。',
  },
  {
    id: 19,
    category: '環境調整',
    action: '掃除・片付け',
    description: '特に灰皿があった場所や、ヤニ汚れの掃除をして「吸わない環境」を強化する。',
  },
  {
    id: 20,
    category: '感覚刺激',
    action: 'アロマや香水を嗅ぐ',
    description: 'ラベンダーやミントなど、タバコとは対極の良い香りで脳をリラックスさせる。',
  },
  {
    id: 21,
    category: '運動',
    action: 'スクワット10回',
    description: '大きな筋肉を使うことで血流を一気に変え、ドーパミンを出す。',
  },
  {
    id: 22,
    category: '代替行動',
    action: '爪楊枝やシナモンスティック',
    description: '口にくわえて指先で遊ぶことで、手持ち無沙汰を解消する。',
  },
  {
    id: 23,
    category: '心理・認知',
    action: '節約金額の計算',
    description: '浮いたタバコ代で買いたいもの（旅行、ガジェット等）の画像を検索する。',
  },
  {
    id: 24,
    category: 'コミュニケーション',
    action: 'サポーターに連絡',
    description: '「今吸いたい！」と家族や友人に宣言し、会話で気を逸らす。',
  },
  {
    id: 25,
    category: '感覚刺激',
    action: '熱いシャワーを浴びる',
    description: '皮膚感覚を刺激し、リフレッシュ効果を得る。',
  },
  {
    id: 26,
    category: '食事・栄養',
    action: '緑茶やハーブティー',
    description: '温かい飲み物をゆっくり飲むことで心を落ち着かせる（カフェインレス推奨）。',
  },
  {
    id: 27,
    category: '心理・認知',
    action: '深呼吸しながら「衝動サーフィン」',
    description: '吸いたい気持ちを「波」としてイメージし、波が来て去っていく様子を客観視する。',
  },
  {
    id: 28,
    category: '代替行動',
    action: 'ハンドグリップを握る',
    description: '手元の筋肉に力を入れることで、イライラを物理的に逃がす。',
  },
  {
    id: 29,
    category: '環境調整',
    action: '歯のホワイトニング予約',
    description: '「せっかく白くするのだから汚したくない」という損得勘定を働かせる。',
  },
  {
    id: 30,
    category: '急速休息',
    action: '仮眠をとる（パワーナップ）',
    description: 'どうしても辛い場合は15分寝て、脳の状態をリセットする。',
  },
];

/**
 * ランダムなTipを取得
 */
export function getRandomTip(): Tip {
  const index = Math.floor(Math.random() * TIPS.length);
  return TIPS[index];
}

/**
 * カテゴリー別にTipsを取得
 */
export function getTipsByCategory(category: TipCategory): Tip[] {
  return TIPS.filter((tip) => tip.category === category);
}

/**
 * 全カテゴリーのリストを取得
 */
export function getAllCategories(): TipCategory[] {
  return [...new Set(TIPS.map((tip) => tip.category))];
}
