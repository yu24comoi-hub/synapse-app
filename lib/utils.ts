const DOMAIN_MAP: Record<string, string> = {
  "news.yahoo.co.jp": "Yahoo! ニュース",
  "topics.smt.docomo.ne.jp": "dメニューニュース",
  "nhk.or.jp": "NHK",
  "www3.nhk.or.jp": "NHK",
  "nikkei.com": "日本経済新聞",
  "asahi.com": "朝日新聞",
  "mainichi.jp": "毎日新聞",
  "yomiuri.co.jp": "読売新聞",
  "sankei.com": "産経新聞",
  "toyokeizai.net": "東洋経済オンライン",
  "businessinsider.jp": "Business Insider Japan",
  "diamond.jp": "ダイヤモンド・オンライン",
  "president.jp": "プレジデント",
  "forbesjapan.com": "Forbes Japan",
  "techcrunch.com": "TechCrunch",
  "wired.jp": "WIRED Japan",
  "itmedia.co.jp": "ITmedia",
  "atmarkit.itmedia.co.jp": "ITmedia",
  "gigazine.net": "GIGAZINE",
  "zenn.dev": "Zenn",
  "qiita.com": "Qiita",
  "note.com": "note",
  "medium.com": "Medium",
  "wikipedia.org": "Wikipedia",
  "gendai.media": "現代ビジネス",
  "bunshun.jp": "文春オンライン",
  "nikkan-gendai.com": "日刊ゲンダイ",
};

export function getSourceName(url?: string): string {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return DOMAIN_MAP[hostname] || hostname;
  } catch {
    return "";
  }
}
