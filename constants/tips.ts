/**
 * 禁煙対策Tips定義
 * 30種類のカテゴリー別アドバイス
 * 時間帯・曜日に応じたフィルタリング対応
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

/**
 * 時間帯種別
 * - morning: 5:00-9:00（朝）
 * - daytime: 9:00-17:00（日中・仕事時間）
 * - evening: 17:00-21:00（夕方）
 * - night: 21:00-5:00（夜）
 */
export type TimeSlot = 'morning' | 'daytime' | 'evening' | 'night';

/**
 * 曜日種別
 * - weekday: 平日
 * - weekend: 休日
 * - any: いつでも
 */
export type DayType = 'weekday' | 'weekend' | 'any';

export interface Tip {
  id: number;
  category: TipCategory;
  action: string;
  description: string;
  /** 利用可能な時間帯（空配列 = 全時間帯OK） */
  timeSlots: TimeSlot[];
  /** 利用可能な曜日種別（空配列 = いつでもOK） */
  dayTypes: DayType[];
}

/**
 * 禁煙対策Tips一覧
 * カテゴリー別に整理された30種類のアドバイス
 * timeSlots/dayTypes が空配列の場合はいつでも利用可能
 */
export const TIPS: Tip[] = [
  {
    id: 1,
    category: '感覚刺激',
    action: '冷水を飲む',
    description: '冷たい水が喉を通る感覚でリフレッシュし、衝動を落ち着かせる。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 2,
    category: '感覚刺激',
    action: '歯を磨く',
    description: '口の中をスッキリさせ、タバコの味を入れたくない心理を作る。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 3,
    category: '呼吸法',
    action: '深呼吸（15秒法）',
    description: '鼻から深く吸い、口からゆっくり長く吐く。副交感神経を優位にする。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 4,
    category: '代替行動',
    action: 'シュガーレスガムを噛む',
    description: '顎を動かすことで脳への血流を促し、口寂しさを紛らわす。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 5,
    category: '感覚刺激',
    action: '顔を洗う',
    description: '冷たい水で顔を洗うことで、交感神経を刺激し意識を切り替える。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 6,
    category: '代替行動',
    action: '硬い野菜をかじる',
    description: '人参やセロリなど、歯ごたえのあるものを食べてストレスを発散する。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 7,
    category: '代替行動',
    action: 'ストローで空気を吸う',
    description: '喫煙の「吸って吐く」動作を擬似的に行い、脳を騙す。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 8,
    category: '心理・認知',
    action: '5分間タイマーセット',
    description: '「一生吸わない」ではなく「あと5分だけ待つ」と先延ばしにする。衝動のピークは3分で過ぎる。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 9,
    category: '運動',
    action: '軽いストレッチ',
    description: '背伸びや肩回しを行い、筋肉の緊張（イライラ）をほぐす。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 10,
    category: '環境調整',
    action: '場所を変える',
    description: '吸いたくなった場所（部屋や喫煙所付近）から物理的に移動する。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 11,
    category: '代替行動',
    action: '強烈なミントタブレット',
    description: 'フリスクやミンティアなどの強い刺激で口内感覚を上書きする。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 12,
    category: '代替行動',
    action: 'テトリス等の単純ゲーム',
    description: '視覚的・空間的な作業に集中することで、渇望のイメージを脳から追い出す。',
    timeSlots: ['morning', 'evening', 'night'], // 仕事中は避ける
    dayTypes: [],
  },
  {
    id: 13,
    category: '心理・認知',
    action: '禁煙アプリを見る',
    description: '経過時間や節約できた金額を確認し、達成感を報酬として脳に与える。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 14,
    category: '感覚刺激',
    action: '氷を口に含む',
    description: '冷たい刺激に集中させることで、吸いたい感覚を麻痺させる。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 15,
    category: '代替行動',
    action: 'ツボ押し（手・耳）',
    description: '「神門（耳の上部）」や「合谷（手の親指と人差指の間）」を押してリラックスする。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 16,
    category: '食事・栄養',
    action: 'ビタミンCを摂る',
    description: '柑橘類やジュースでビタミン補給。喫煙欲求を減らす効果が期待される。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 17,
    category: '心理・認知',
    action: '「なぜ辞めたか」を読む',
    description: '禁煙開始時に書いた「禁煙の理由リスト」を読み返し、初心を思い出す。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 18,
    category: '代替行動',
    action: '歌を歌う（ハミング）',
    description: '声を出すことで喉の感覚を使い、ストレスを発散する。',
    timeSlots: ['morning', 'evening', 'night'], // 職場では難しい
    dayTypes: [],
  },
  {
    id: 19,
    category: '環境調整',
    action: '掃除・片付け',
    description: '特に灰皿があった場所や、ヤニ汚れの掃除をして「吸わない環境」を強化する。',
    timeSlots: ['evening', 'night'], // 夕方・夜向き
    dayTypes: [],
  },
  {
    id: 20,
    category: '感覚刺激',
    action: 'アロマや香水を嗅ぐ',
    description: 'ラベンダーやミントなど、タバコとは対極の良い香りで脳をリラックスさせる。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 21,
    category: '運動',
    action: 'スクワット10回',
    description: '大きな筋肉を使うことで血流を一気に変え、ドーパミンを出す。',
    timeSlots: [], // いつでもOK（短時間なので）
    dayTypes: [],
  },
  {
    id: 22,
    category: '代替行動',
    action: '爪楊枝やシナモンスティック',
    description: '口にくわえて指先で遊ぶことで、手持ち無沙汰を解消する。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 23,
    category: '心理・認知',
    action: '節約金額の計算',
    description: '浮いたタバコ代で買いたいもの（旅行、ガジェット等）の画像を検索する。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 24,
    category: 'コミュニケーション',
    action: 'サポーターに連絡',
    description: '「今吸いたい！」と家族や友人に宣言し、会話で気を逸らす。',
    timeSlots: ['morning', 'daytime', 'evening'], // 深夜は避ける
    dayTypes: [],
  },
  {
    id: 25,
    category: '感覚刺激',
    action: '熱いシャワーを浴びる',
    description: '皮膚感覚を刺激し、リフレッシュ効果を得る。',
    timeSlots: ['morning', 'night'], // 朝か夜のみ
    dayTypes: [], // 休日は終日OK（後でロジックで対応）
  },
  {
    id: 26,
    category: '食事・栄養',
    action: '緑茶やハーブティー',
    description: '温かい飲み物をゆっくり飲むことで心を落ち着かせる（カフェインレス推奨）。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 27,
    category: '心理・認知',
    action: '深呼吸しながら「衝動サーフィン」',
    description: '吸いたい気持ちを「波」としてイメージし、波が来て去っていく様子を客観視する。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 28,
    category: '代替行動',
    action: 'ハンドグリップを握る',
    description: '手元の筋肉に力を入れることで、イライラを物理的に逃がす。',
    timeSlots: [], // いつでもOK
    dayTypes: [],
  },
  {
    id: 29,
    category: '環境調整',
    action: '歯のホワイトニング予約',
    description: '「せっかく白くするのだから汚したくない」という損得勘定を働かせる。',
    timeSlots: ['daytime', 'evening'], // 営業時間内
    dayTypes: ['weekday'], // 平日のみ（歯医者の営業日）
  },
  {
    id: 30,
    category: '急速休息',
    action: '仮眠をとる（パワーナップ）',
    description: 'どうしても辛い場合は15分寝て、脳の状態をリセットする。',
    timeSlots: ['daytime', 'evening', 'night'], // 朝は仮眠不要
    dayTypes: [],
  },
];

/**
 * 現在の時間帯を取得
 */
export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'daytime';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * 現在の曜日種別を取得
 */
export function getCurrentDayType(): DayType {
  const day = new Date().getDay();
  // 0 = 日曜日, 6 = 土曜日
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

/**
 * Tipが現在の時間帯・曜日で利用可能かチェック
 */
export function isTipAvailable(
  tip: Tip,
  timeSlot: TimeSlot = getCurrentTimeSlot(),
  dayType: DayType = getCurrentDayType()
): boolean {
  // timeSlots が空なら時間帯制限なし
  const timeOk = tip.timeSlots.length === 0 || tip.timeSlots.includes(timeSlot);

  // dayTypes が空なら曜日制限なし
  // 'any' が含まれていたらいつでもOK
  const dayOk =
    tip.dayTypes.length === 0 ||
    tip.dayTypes.includes('any') ||
    tip.dayTypes.includes(dayType);

  // 休日は時間帯制限を緩和（家にいるため）
  if (dayType === 'weekend') {
    return dayOk; // 休日は時間帯無視
  }

  return timeOk && dayOk;
}

/**
 * 現在利用可能なTipsを取得
 */
export function getAvailableTips(
  timeSlot?: TimeSlot,
  dayType?: DayType
): Tip[] {
  const ts = timeSlot ?? getCurrentTimeSlot();
  const dt = dayType ?? getCurrentDayType();
  return TIPS.filter((tip) => isTipAvailable(tip, ts, dt));
}

/**
 * ランダムなTipを取得（時間帯フィルタリングなし - 後方互換用）
 */
export function getRandomTip(): Tip {
  const index = Math.floor(Math.random() * TIPS.length);
  return TIPS[index];
}

/**
 * 現在の時間帯に適したランダムなTipを取得
 */
export function getRandomAvailableTip(
  timeSlot?: TimeSlot,
  dayType?: DayType
): Tip {
  const available = getAvailableTips(timeSlot, dayType);
  // 利用可能なTipsがない場合は全体からランダム選択
  if (available.length === 0) {
    return getRandomTip();
  }
  const index = Math.floor(Math.random() * available.length);
  return available[index];
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

/**
 * IDでTipを取得
 */
export function getTipById(id: number): Tip | undefined {
  return TIPS.find((tip) => tip.id === id);
}
