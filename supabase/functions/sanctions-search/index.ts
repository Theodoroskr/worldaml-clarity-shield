import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Jaro-Winkler similarity ─────────────────────────────────────────────────
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length, len2 = s2.length;
  const matchDist = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
}

function jaroWinkler(s1: string, s2: string, p = 0.1): number {
  const jaro = jaroSimilarity(s1, s2);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
    if (s1[i] === s2[i]) prefix++; else break;
  }
  return jaro + prefix * p * (1 - jaro);
}

// ─── Static sanctions dataset (representative open-source data) ───────────────
// In production, this would be compiled from OFAC SDN XML, EU consolidated list,
// UN Security Council list, and HMT asset freeze list.
// For MVP we include a representative structured dataset with real list metadata.
const SANCTIONS_DATA = [
  // OFAC SDN entries (representative)
  { id: "OFAC-001", name: "AL-QAIDA", aliases: ["Al Qaeda", "Al Qa'ida", "القاعدة"], entity_type: "organization", nationality: "AF", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2001-10-12", programs: ["SDGT"] },
  { id: "OFAC-002", name: "HAMAS", aliases: ["Harakat al-Muqawama al-Islamiyya", "Islamic Resistance Movement"], entity_type: "organization", nationality: "PS", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "1995-01-23", programs: ["SDGT"] },
  { id: "OFAC-003", name: "HEZBOLLAH", aliases: ["Hizbullah", "Hizballah", "حزب الله"], entity_type: "organization", nationality: "LB", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "1995-01-23", programs: ["SDGT"] },
  { id: "OFAC-004", name: "ISLAMIC STATE OF IRAQ AND THE LEVANT", aliases: ["ISIS", "ISIL", "Daesh", "داعش"], entity_type: "organization", nationality: "SY", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2014-05-15", programs: ["SDGT"] },
  { id: "OFAC-005", name: "ROSNEFT OIL COMPANY", aliases: ["OJSC Rosneft", "PAO NK Rosneft"], entity_type: "company", nationality: "RU", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2022-02-24", programs: ["RUSSIA-EO14024"] },
  { id: "OFAC-006", name: "SBERBANK", aliases: ["Sberbank of Russia", "Savings Bank of the Russian Federation"], entity_type: "company", nationality: "RU", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2022-04-06", programs: ["RUSSIA-EO14024"] },
  { id: "OFAC-007", name: "GAZPROM", aliases: ["PAO Gazprom", "Gazprom PJSC"], entity_type: "company", nationality: "RU", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2022-03-11", programs: ["RUSSIA-EO14024"] },
  { id: "OFAC-008", name: "NORTH KOREA (DPRK)", aliases: ["Democratic People's Republic of Korea"], entity_type: "country", nationality: "KP", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2008-06-26", programs: ["DPRK"] },
  { id: "OFAC-009", name: "IRAN", aliases: ["Islamic Republic of Iran", "جمهوری اسلامی ایران"], entity_type: "country", nationality: "IR", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "1979-11-14", programs: ["IRAN"] },
  { id: "OFAC-010", name: "WAGNER GROUP", aliases: ["PMC Wagner", "Groupe Wagner", "ЧВК Вагнер"], entity_type: "organization", nationality: "RU", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2023-01-26", programs: ["RUSSIA-EO14024"] },
  // EU Consolidated List entries
  { id: "EU-001", name: "LUKASHENKO ALEXANDER", aliases: ["Lukashenka Alyaksandr", "Лукашенко Александр"], entity_type: "individual", nationality: "BY", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2020-10-02", programs: ["Belarus"] },
  { id: "EU-002", name: "PUTIN VLADIMIR VLADIMIROVICH", aliases: ["Путин Владимир Владимирович"], entity_type: "individual", nationality: "RU", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2022-03-28", programs: ["Russia"] },
  { id: "EU-003", name: "LAVROV SERGEI VIKTOROVICH", aliases: ["Lavrov Sergey", "Лавров Сергей Викторович"], entity_type: "individual", nationality: "RU", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2022-02-28", programs: ["Russia"] },
  { id: "EU-004", name: "VTB BANK", aliases: ["Bank VTB PAO", "ВТБ Банк"], entity_type: "company", nationality: "RU", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2022-03-01", programs: ["Russia"] },
  { id: "EU-005", name: "MEDVEDEV DMITRY ANATOLYEVICH", aliases: ["Медведев Дмитрий Анатольевич"], entity_type: "individual", nationality: "RU", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2022-03-28", programs: ["Russia"] },
  { id: "EU-006", name: "MYANMAR ECONOMIC CORPORATION", aliases: ["MEC", "မြန်မာ့စီးပွားရေးကော်ပိုရေးရှင်း"], entity_type: "company", nationality: "MM", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2021-04-19", programs: ["Myanmar"] },
  // UN Security Council entries
  { id: "UN-001", name: "AL-NUSRA FRONT", aliases: ["Jabhat al-Nusra", "Al-Nusrah Front", "جبهة النصرة"], entity_type: "organization", nationality: "SY", list_source: "UN Security Council", list_updated: "2025-01-08", designation_date: "2013-05-30", programs: ["1267/1989/2253 ISIL/Al-Qaida"] },
  { id: "UN-002", name: "LASHKAR-E-TAYYIBA", aliases: ["Lashkar-i-Tayyiba", "Army of the Righteous", "لشکر طیبہ"], entity_type: "organization", nationality: "PK", list_source: "UN Security Council", list_updated: "2025-01-08", designation_date: "2005-05-02", programs: ["1267/1989/2253 ISIL/Al-Qaida"] },
  { id: "UN-003", name: "JAISH-E-MOHAMMED", aliases: ["JEM", "Army of Mohammed", "جیش محمد"], entity_type: "organization", nationality: "PK", list_source: "UN Security Council", list_updated: "2025-01-08", designation_date: "2001-10-17", programs: ["1267/1989/2253 ISIL/Al-Qaida"] },
  { id: "UN-004", name: "BOKO HARAM", aliases: ["Jamā'at Ahl as-Sunnah lid-Da'wah wa'l-Jihād", "JAS", "ISWAP"], entity_type: "organization", nationality: "NG", list_source: "UN Security Council", list_updated: "2025-01-08", designation_date: "2014-05-22", programs: ["1267/1989/2253 ISIL/Al-Qaida"] },
  // HMT Asset Freeze List entries
  { id: "HMT-001", name: "RUSSIAN FEDERATION", aliases: ["Russia"], entity_type: "country", nationality: "RU", list_source: "HMT Asset Freeze", list_updated: "2025-01-12", designation_date: "2022-02-24", programs: ["Russia"] },
  { id: "HMT-002", name: "BELARUS", aliases: ["Republic of Belarus", "Рэспубліка Беларусь"], entity_type: "country", nationality: "BY", list_source: "HMT Asset Freeze", list_updated: "2025-01-12", designation_date: "2020-10-06", programs: ["Belarus"] },
  { id: "HMT-003", name: "ALPHA BANK", aliases: ["Alpha Bank Russia", "АО Альфа-Банк"], entity_type: "company", nationality: "RU", list_source: "HMT Asset Freeze", list_updated: "2025-01-12", designation_date: "2022-03-24", programs: ["Russia"] },
  { id: "HMT-004", name: "SHOIGU SERGEI KUZHUGETOVICH", aliases: ["Шойгу Сергей Кужугетович", "Sergei Shoigu"], entity_type: "individual", nationality: "RU", list_source: "HMT Asset Freeze", list_updated: "2025-01-12", designation_date: "2022-02-24", programs: ["Russia"] },
  { id: "HMT-005", name: "GERASIMOV VALERY VASILYEVICH", aliases: ["Герасимов Валерий Васильевич", "Valery Gerasimov"], entity_type: "individual", nationality: "RU", list_source: "HMT Asset Freeze", list_updated: "2025-01-12", designation_date: "2022-02-24", programs: ["Russia"] },
  // Additional diverse entries
  { id: "OFAC-011", name: "MADURO NICOLAS", aliases: ["Nicolás Maduro Moros", "Maduro Moros Nicolas"], entity_type: "individual", nationality: "VE", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2019-01-28", programs: ["VENEZUELA"] },
  { id: "OFAC-012", name: "AL-SHABAAB", aliases: ["Harakaat Shabaab al-Mujahideen", "Harakat al-Shabaab al-Mujahideen"], entity_type: "organization", nationality: "SO", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "2008-02-26", programs: ["SDGT"] },
  { id: "OFAC-013", name: "TALIBAN", aliases: ["Islamic Emirate of Afghanistan", "امارت اسلامی افغانستان"], entity_type: "organization", nationality: "AF", list_source: "OFAC SDN", list_updated: "2025-01-15", designation_date: "1999-07-06", programs: ["SDGT", "Taliban"] },
  { id: "EU-007", name: "MYANMAR ECONOMIC HOLDINGS LIMITED", aliases: ["MEHL", "မြန်မာ့စီးပွားရေးလုပ်ငန်းများ"], entity_type: "company", nationality: "MM", list_source: "EU Consolidated List", list_updated: "2025-01-10", designation_date: "2021-04-19", programs: ["Myanmar"] },
  { id: "UN-005", name: "ISLAMIC STATE IN GREATER SAHARA", aliases: ["ISGS", "État islamique au Grand Sahara"], entity_type: "organization", nationality: "ML", list_source: "UN Security Council", list_updated: "2025-01-08", designation_date: "2020-06-12", programs: ["1267/1989/2253 ISIL/Al-Qaida"] },
];

// ─── Scoring helper ───────────────────────────────────────────────────────────
function scoreEntry(query: string, entry: typeof SANCTIONS_DATA[0]): { score: number; matchedOn: string } {
  const q = query.toLowerCase().trim();
  const candidates = [entry.name, ...entry.aliases].map(n => n.toLowerCase());
  let best = 0;
  let matchedOn = entry.name;
  for (const candidate of candidates) {
    // Exact
    if (candidate === q) return { score: 1.0, matchedOn: candidate };
    // Contains
    if (candidate.includes(q) || q.includes(candidate)) {
      const s = Math.min(q.length, candidate.length) / Math.max(q.length, candidate.length);
      if (s > best) { best = Math.max(s, 0.9); matchedOn = candidate; }
    }
    const jw = jaroWinkler(q, candidate);
    if (jw > best) { best = jw; matchedOn = candidate; }
    // Word-level: check if any word in query matches any word in candidate
    const qWords = q.split(/\s+/);
    const cWords = candidate.split(/\s+/);
    for (const qw of qWords) {
      for (const cw of cWords) {
        if (qw.length < 3) continue;
        const ws = jaroWinkler(qw, cw);
        if (ws > 0.92 && ws * 0.85 > best) { best = ws * 0.85; matchedOn = candidate; }
      }
    }
  }
  return { score: best, matchedOn };
}

function getConfidence(score: number): "Exact" | "High" | "Possible" {
  if (score >= 0.98) return "Exact";
  if (score >= 0.88) return "High";
  return "Possible";
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { name, country, type: entityType, session_id } = await req.json();
    if (!name || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Name must be at least 2 characters" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const sessionId = session_id || crypto.randomUUID();

    // Get user from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id ?? null;
    }

    // Check quota
    let remaining = 1;
    if (userId) {
      const { count } = await supabase
        .from('sanctions_searches')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      const used = count ?? 0;
      remaining = Math.max(0, 5 - used);
      if (remaining === 0) {
        return new Response(JSON.stringify({ error: "quota_exceeded", remaining: 0 }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Anonymous: check session searches (just count, no strict block at edge fn — frontend handles display gate)
      const { count } = await supabase
        .from('sanctions_searches')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .is('user_id', null);
      remaining = Math.max(0, 1 - (count ?? 0));
    }

    // Fuzzy match
    const THRESHOLD = 0.78;
    const results = SANCTIONS_DATA
      .filter(entry => {
        if (country && entry.nationality && entry.nationality !== country) return true; // still include, just lower priority
        if (entityType && entityType !== 'all' && entry.entity_type !== entityType) return false;
        return true;
      })
      .map(entry => {
        const { score, matchedOn } = scoreEntry(name, entry);
        return { ...entry, match_score: score, matched_on: matchedOn };
      })
      .filter(e => e.match_score >= THRESHOLD)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        name: e.name,
        aliases: e.aliases,
        entity_type: e.entity_type,
        nationality: e.nationality,
        list_source: e.list_source,
        list_updated: e.list_updated,
        designation_date: e.designation_date,
        programs: e.programs,
        match_score: Math.round(e.match_score * 100) / 100,
        matched_on: e.matched_on,
        confidence: getConfidence(e.match_score),
      }));

    // Log search
    await supabase.from('sanctions_searches').insert({
      session_id: sessionId,
      user_id: userId,
      query_name: name.trim(),
      query_country: country || null,
      query_type: entityType || 'individual',
      results_count: results.length,
    });

    return new Response(JSON.stringify({
      results,
      session_id: sessionId,
      remaining: userId ? Math.max(0, remaining - 1) : remaining,
      total_searched: SANCTIONS_DATA.length,
      disclaimer: "Open-source coverage only. Data may be delayed. Not legal advice.",
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
