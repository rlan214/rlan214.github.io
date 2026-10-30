/* Service worker: caches the app shell and all Tagalog audio clips.
   Bump CACHE_VERSION whenever you replace an MP3 or change index.html. */
const CACHE_VERSION = "v5";
const CACHE = "tagalog-adventure-" + CACHE_VERSION;

const AUDIO = ["kumusta", "magandang_umaga", "salamat", "paalam", "oo", "hindi", "nanay", "tatay", "kuya", "ate", "lola", "lolo", "isa", "dalawa", "tatlo", "apat", "lima", "anim", "pito", "walo", "siyam", "sampu", "aso", "pusa", "ibon", "isda", "baboy", "manok", "kanin", "tubig", "gulay", "prutas", "itlog", "tinapay", "gatas", "kape", "pula", "asul", "dilaw", "berde", "puti", "itim", "kumusta_ka", "mabuti_ako", "salamat_po", "walang_anuman", "ano_pangalan", "mahal_kita", "gutom_na_ako", "kain_na_tayo", "magandang_gabi", "ingat_ka", "ulo", "buhok", "mata", "ilong", "bibig", "tainga", "kamay", "paa", "tiyan", "ngipin", "bahay", "pinto", "bintana", "kama", "mesa", "upuan", "kusina", "banyo", "kuwarto", "ilaw", "lunes", "martes", "miyerkules", "huwebes", "biyernes", "sabado", "linggo", "ngayon", "bukas", "kahapon", "masaya", "malungkot", "galit", "takot", "pagod", "gutom", "uhaw", "antok", "busog", "nahihiya", "paaralan", "guro", "estudyante", "libro", "lapis", "papel", "kuwaderno", "aralin", "klase", "damit", "sapatos", "medyas", "sumbrero", "pantalon", "palda", "kamiseta", "tsinelas", "sinturon", "guwantes", "araw", "buwan", "bituin", "ulan", "hangin", "ulap", "puno", "bulaklak", "dagat", "bundok", "kain", "inom", "tulog", "laro", "basa", "sulat", "lakad", "takbo", "kanta", "sayaw", "ano_ito", "saan_ka_pupunta", "sino_ito", "bakit", "magkano_ito", "kailan", "anong_oras_na", "kumusta_ang_araw_mo", "opo", "hindi_po", "pakiusap", "pasensya_na", "paumanhin_po", "salamat_sa_tulong", "magandang_umaga_po", "magandang_hapon", "paalam_na", "hanggang_bukas", "tara_na", "halika_dito", "maghugas_ng_kamay", "umupo_ka", "tumayo_ka", "makinig_ka", "tingnan_mo", "buksan_ang_pinto", "isara_ang_bintana", "mag_ingat_ka", "masaya_ako", "pagod_na_ako", "inaantok_na_ako", "uhaw_ako", "gusto_ko_ng_tubig", "ayoko", "kumain_ka_na_ba", "mahal_ko_ang_nanay_ko", "nasaan_si_tatay", "nasa_bahay_si_lola", "ito_ang_aking_aso", "mayroon_akong_kapatid", "ang_bahay_ay_malaki", "kutsara", "tinidor", "kutsilyo", "plato", "baso", "mangkok", "tasa", "sandok", "pitsel", "masarap", "busog_na_ako", "gusto_ko_ng_kanin", "pakiabot_ang_tubig", "salamat_sa_pagkain", "gusto_ko_pa", "ayaw_ko_na", "walis", "basura", "labada", "sabon", "timba", "basahan", "plantsa", "linis", "magwalis_ka", "itapon_ang_basura", "hugasan_ang_plato", "ayusin_ang_kama", "tulungan_kita", "tapos_na_ako", "kaliwa", "kanan", "taas", "baba", "harap", "likod", "malapit", "malayo", "gitna", "dito", "doon", "lumiko_sa_kaliwa", "lumiko_sa_kanan", "dumeretso_ka", "huminto_ka", "nasaan_ang_banyo", "suka", "patis", "bagoong", "toyo", "asin", "asukal", "paminta", "sili", "kalamansi", "mansanas", "saging", "mangga", "pinya", "ubas", "pakwan", "dalandan", "papaya", "niyog", "peras", "malaki", "maliit", "mainit", "malamig", "maganda", "mabilis", "mabagal", "matamis", "maasim", "maalat", "bago", "luma", "gusto_ko_ng_tinapay", "gusto_ko_ng_mansanas", "gusto_ko_ng_saging", "gusto_ko_ng_gatas", "gusto_ko_ng_itlog", "gusto_ko_ng_mangga", "ito_ang_aso", "ito_ang_pusa", "ito_ang_bahay", "ito_ang_libro", "ito_ang_lapis", "ito_ang_bulaklak", "nasaan_ang_kutsara", "nasaan_ang_plato", "nasaan_ang_baso", "nasaan_ang_libro", "nasaan_ang_lapis", "nasaan_ang_sapatos", "may_aso_ako", "may_pusa_ako", "may_lapis_ako", "may_libro_ako", "may_sumbrero_ako", "may_kuwaderno_ako", "ayaw_ko_ng_gulay", "ayaw_ko_ng_sili", "ayaw_ko_ng_kape", "ayaw_ko_ng_gatas", "ayaw_ko_ng_bagoong", "ayaw_ko_ng_isda", "pula_ang_mansanas", "dilaw_ang_saging", "berde_ang_gulay", "asul_ang_dagat", "puti_ang_ulap", "dilaw_ang_araw", "malaki_ang_aso", "maliit_ang_pusa", "mainit_ang_kape", "malamig_ang_tubig", "matamis_ang_mangga", "maasim_ang_kalamansi", "maalat_ang_patis", "maganda_ang_bulaklak"];
const SNACKS = ["snack_pandesal", "snack_halo_halo", "snack_turon", "snack_lumpia", "snack_bibingka", "snack_taho", "snack_ube", "snack_buko", "snack_mangga", "snack_leche_flan", "snack_puto", "snack_siopao", "snack_banana_cue", "snack_fishball", "snack_sorbetes", "snack_polvoron", "snack_chicharon", "snack_mais", "snack_kwek_kwek", "snack_ensaymada", "snack_mamon", "snack_pastillas", "snack_kropek", "snack_sago", "snack_pichi_pichi", "snack_suman", "snack_biko", "snack_kutsinta", "snack_maruya", "snack_calamansi", "snack_ginataan", "snack_maja_blanca", "snack_pan_de_coco", "snack_halaya", "snack_sapin_sapin", "snack_pinipig", "snack_bukayo", "snack_yema", "snack_cassava_cake", "snack_tupig", "snack_lugaw"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Each add is wrapped so one missing clip doesn't fail the whole install.
    await cache.add("./").catch(() => {});
    await Promise.all(
      AUDIO.flatMap((f) => [f, "en_" + f]).concat(SNACKS).map((f) => cache.add("audio/" + f + ".mp3").catch(() => {}))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith("tagalog-adventure-") && k !== CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Safari requests audio with Range headers and needs a 206 back.
async function rangeResponse(request, response) {
  const range = request.headers.get("range");
  if (!range) return response;
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  if (!m) return response;
  const buf = await response.arrayBuffer();
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": "bytes " + start + "-" + end + "/" + buf.byteLength,
      "Content-Length": String(end - start + 1)
    }
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Audio: cache-first, fetch the full file once and keep it.
  if (url.pathname.includes("/audio/")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      let res = await cache.match(url.pathname);
      if (!res) {
        try {
          const net = await fetch(url.pathname);
          if (!net.ok) return net;
          await cache.put(url.pathname, net.clone());
          res = net;
        } catch (e) {
          return new Response("", { status: 504 });
        }
      }
      return rangeResponse(req, res.clone());
    })());
    return;
  }

  // Everything else (the page itself): network-first, cache as offline fallback.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await fetch(req);
      if (net.ok) cache.put(req, net.clone());
      return net;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: true });
      return hit || (await cache.match("./")) || new Response("Offline", { status: 503 });
    }
  })());
});
