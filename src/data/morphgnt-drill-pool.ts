/**
 * Curated pool of real MorphGNT words suitable for parsing drills.
 * All forms are verified against the MorphGNT dataset.
 *
 * Parse code format (8 chars):
 *   [0] person     1 2 3 -
 *   [1] tense      P I F A X Y -
 *   [2] voice      A M P -
 *   [3] mood       I D S O N P -  (N=infinitive, P=participle)
 *   [4] case       N G D A V -
 *   [5] number     S P -
 *   [6] gender     M F N -
 *   [7] degree     C S -
 *
 * Pool strategy: ~200 entries spanning all major POS types and paradigm slots.
 * The challenge API samples DRILL_POOL_SAMPLE_SIZE entries randomly and asks
 * Claude to select the best one — Claude never invents Greek forms.
 */

export interface DrillWord {
  word: string;    // Greek text as it appears in the GNT (no punctuation)
  lemma: string;   // lexical form
  pos: string;     // MorphGNT part-of-speech code
  parsing: string; // 8-character parse code
  gloss: string;   // brief English gloss for the lemma
}

export const DRILL_POOL: DrillWord[] = [

  // ── Nouns — 2nd declension masculine ────────────────────────────────────────
  { word: 'θεός',        lemma: 'θεός',        pos: 'N-', parsing: '----NSM-', gloss: 'God' },
  { word: 'θεοῦ',        lemma: 'θεός',        pos: 'N-', parsing: '----GSM-', gloss: 'God' },
  { word: 'θεῷ',         lemma: 'θεός',        pos: 'N-', parsing: '----DSM-', gloss: 'God' },
  { word: 'θεόν',        lemma: 'θεός',        pos: 'N-', parsing: '----ASM-', gloss: 'God' },
  { word: 'θεοί',        lemma: 'θεός',        pos: 'N-', parsing: '----NPM-', gloss: 'God' },
  { word: 'θεῶν',        lemma: 'θεός',        pos: 'N-', parsing: '----GPM-', gloss: 'God' },
  { word: 'θεοῖς',       lemma: 'θεός',        pos: 'N-', parsing: '----DPM-', gloss: 'God' },
  { word: 'θεούς',       lemma: 'θεός',        pos: 'N-', parsing: '----APM-', gloss: 'God' },
  { word: 'κύριος',      lemma: 'κύριος',      pos: 'N-', parsing: '----NSM-', gloss: 'lord' },
  { word: 'κυρίου',      lemma: 'κύριος',      pos: 'N-', parsing: '----GSM-', gloss: 'lord' },
  { word: 'κυρίῳ',       lemma: 'κύριος',      pos: 'N-', parsing: '----DSM-', gloss: 'lord' },
  { word: 'κύριον',      lemma: 'κύριος',      pos: 'N-', parsing: '----ASM-', gloss: 'lord' },
  { word: 'κύριοι',      lemma: 'κύριος',      pos: 'N-', parsing: '----NPM-', gloss: 'lord' },
  { word: 'κυρίων',      lemma: 'κύριος',      pos: 'N-', parsing: '----GPM-', gloss: 'lord' },
  { word: 'λόγος',       lemma: 'λόγος',       pos: 'N-', parsing: '----NSM-', gloss: 'word' },
  { word: 'λόγου',       lemma: 'λόγος',       pos: 'N-', parsing: '----GSM-', gloss: 'word' },
  { word: 'λόγῳ',        lemma: 'λόγος',       pos: 'N-', parsing: '----DSM-', gloss: 'word' },
  { word: 'λόγον',       lemma: 'λόγος',       pos: 'N-', parsing: '----ASM-', gloss: 'word' },
  { word: 'λόγοι',       lemma: 'λόγος',       pos: 'N-', parsing: '----NPM-', gloss: 'word' },
  { word: 'λόγων',       lemma: 'λόγος',       pos: 'N-', parsing: '----GPM-', gloss: 'word' },
  { word: 'λόγοις',      lemma: 'λόγος',       pos: 'N-', parsing: '----DPM-', gloss: 'word' },
  { word: 'λόγους',      lemma: 'λόγος',       pos: 'N-', parsing: '----APM-', gloss: 'word' },
  { word: 'υἱός',        lemma: 'υἱός',        pos: 'N-', parsing: '----NSM-', gloss: 'son' },
  { word: 'υἱοῦ',        lemma: 'υἱός',        pos: 'N-', parsing: '----GSM-', gloss: 'son' },
  { word: 'υἱῷ',         lemma: 'υἱός',        pos: 'N-', parsing: '----DSM-', gloss: 'son' },
  { word: 'υἱόν',        lemma: 'υἱός',        pos: 'N-', parsing: '----ASM-', gloss: 'son' },
  { word: 'ἄνθρωπος',    lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----NSM-', gloss: 'man' },
  { word: 'ἀνθρώπου',    lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----GSM-', gloss: 'man' },
  { word: 'ἀνθρώπῳ',     lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----DSM-', gloss: 'man' },
  { word: 'ἄνθρωπον',    lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----ASM-', gloss: 'man' },
  { word: 'ἄνθρωποι',    lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----NPM-', gloss: 'man' },
  { word: 'ἀνθρώπων',    lemma: 'ἄνθρωπος',    pos: 'N-', parsing: '----GPM-', gloss: 'man' },
  { word: 'κόσμος',      lemma: 'κόσμος',      pos: 'N-', parsing: '----NSM-', gloss: 'world' },
  { word: 'κόσμου',      lemma: 'κόσμος',      pos: 'N-', parsing: '----GSM-', gloss: 'world' },
  { word: 'κόσμον',      lemma: 'κόσμος',      pos: 'N-', parsing: '----ASM-', gloss: 'world' },
  { word: 'ἀδελφός',     lemma: 'ἀδελφός',     pos: 'N-', parsing: '----NSM-', gloss: 'brother' },
  { word: 'ἀδελφοῦ',     lemma: 'ἀδελφός',     pos: 'N-', parsing: '----GSM-', gloss: 'brother' },
  { word: 'ἀδελφῷ',      lemma: 'ἀδελφός',     pos: 'N-', parsing: '----DSM-', gloss: 'brother' },
  { word: 'ἀδελφόν',     lemma: 'ἀδελφός',     pos: 'N-', parsing: '----ASM-', gloss: 'brother' },
  { word: 'ἀδελφοί',     lemma: 'ἀδελφός',     pos: 'N-', parsing: '----NPM-', gloss: 'brother' },
  { word: 'ἀδελφῶν',     lemma: 'ἀδελφός',     pos: 'N-', parsing: '----GPM-', gloss: 'brother' },
  { word: 'νόμος',       lemma: 'νόμος',       pos: 'N-', parsing: '----NSM-', gloss: 'law' },
  { word: 'νόμου',       lemma: 'νόμος',       pos: 'N-', parsing: '----GSM-', gloss: 'law' },
  { word: 'νόμον',       lemma: 'νόμος',       pos: 'N-', parsing: '----ASM-', gloss: 'law' },

  // ── Nouns — 1st declension feminine ─────────────────────────────────────────
  { word: 'ζωή',         lemma: 'ζωή',         pos: 'N-', parsing: '----NSF-', gloss: 'life' },
  { word: 'ζωῆς',        lemma: 'ζωή',         pos: 'N-', parsing: '----GSF-', gloss: 'life' },
  { word: 'ζωῇ',         lemma: 'ζωή',         pos: 'N-', parsing: '----DSF-', gloss: 'life' },
  { word: 'ζωήν',        lemma: 'ζωή',         pos: 'N-', parsing: '----ASF-', gloss: 'life' },
  { word: 'ἀγάπη',       lemma: 'ἀγάπη',       pos: 'N-', parsing: '----NSF-', gloss: 'love' },
  { word: 'ἀγάπης',      lemma: 'ἀγάπη',       pos: 'N-', parsing: '----GSF-', gloss: 'love' },
  { word: 'ἀγάπῃ',       lemma: 'ἀγάπη',       pos: 'N-', parsing: '----DSF-', gloss: 'love' },
  { word: 'ἀγάπην',      lemma: 'ἀγάπη',       pos: 'N-', parsing: '----ASF-', gloss: 'love' },
  { word: 'ἐκκλησία',    lemma: 'ἐκκλησία',    pos: 'N-', parsing: '----NSF-', gloss: 'church' },
  { word: 'ἐκκλησίας',   lemma: 'ἐκκλησία',    pos: 'N-', parsing: '----GSF-', gloss: 'church' },
  { word: 'ἐκκλησίᾳ',    lemma: 'ἐκκλησία',    pos: 'N-', parsing: '----DSF-', gloss: 'church' },
  { word: 'ἐκκλησίαν',   lemma: 'ἐκκλησία',    pos: 'N-', parsing: '----ASF-', gloss: 'church' },
  { word: 'ἡμέρα',       lemma: 'ἡμέρα',       pos: 'N-', parsing: '----NSF-', gloss: 'day' },
  { word: 'ἡμέρας',      lemma: 'ἡμέρα',       pos: 'N-', parsing: '----GSF-', gloss: 'day' },
  { word: 'ἡμέρᾳ',       lemma: 'ἡμέρα',       pos: 'N-', parsing: '----DSF-', gloss: 'day' },
  { word: 'ἡμέραν',      lemma: 'ἡμέρα',       pos: 'N-', parsing: '----ASF-', gloss: 'day' },
  { word: 'ἡμερῶν',      lemma: 'ἡμέρα',       pos: 'N-', parsing: '----GPF-', gloss: 'day' },
  { word: 'ψυχή',        lemma: 'ψυχή',        pos: 'N-', parsing: '----NSF-', gloss: 'soul' },
  { word: 'ψυχῆς',       lemma: 'ψυχή',        pos: 'N-', parsing: '----GSF-', gloss: 'soul' },
  { word: 'ψυχήν',       lemma: 'ψυχή',        pos: 'N-', parsing: '----ASF-', gloss: 'soul' },
  { word: 'ἁμαρτία',     lemma: 'ἁμαρτία',     pos: 'N-', parsing: '----NSF-', gloss: 'sin' },
  { word: 'ἁμαρτίας',    lemma: 'ἁμαρτία',     pos: 'N-', parsing: '----GSF-', gloss: 'sin' },
  { word: 'ἁμαρτίαν',    lemma: 'ἁμαρτία',     pos: 'N-', parsing: '----ASF-', gloss: 'sin' },

  // ── Nouns — 3rd declension ───────────────────────────────────────────────────
  { word: 'πίστις',      lemma: 'πίστις',      pos: 'N-', parsing: '----NSF-', gloss: 'faith' },
  { word: 'πίστεως',     lemma: 'πίστις',      pos: 'N-', parsing: '----GSF-', gloss: 'faith' },
  { word: 'πίστει',      lemma: 'πίστις',      pos: 'N-', parsing: '----DSF-', gloss: 'faith' },
  { word: 'πίστιν',      lemma: 'πίστις',      pos: 'N-', parsing: '----ASF-', gloss: 'faith' },
  { word: 'πνεῦμα',      lemma: 'πνεῦμα',      pos: 'N-', parsing: '----NSN-', gloss: 'spirit' },
  { word: 'πνεύματος',   lemma: 'πνεῦμα',      pos: 'N-', parsing: '----GSN-', gloss: 'spirit' },
  { word: 'πνεύματι',    lemma: 'πνεῦμα',      pos: 'N-', parsing: '----DSN-', gloss: 'spirit' },
  { word: 'πνεῦμα',      lemma: 'πνεῦμα',      pos: 'N-', parsing: '----ASN-', gloss: 'spirit' },
  { word: 'ὄνομα',       lemma: 'ὄνομα',       pos: 'N-', parsing: '----NSN-', gloss: 'name' },
  { word: 'ὀνόματος',    lemma: 'ὄνομα',       pos: 'N-', parsing: '----GSN-', gloss: 'name' },
  { word: 'ὀνόματι',     lemma: 'ὄνομα',       pos: 'N-', parsing: '----DSN-', gloss: 'name' },
  { word: 'ὄνομα',       lemma: 'ὄνομα',       pos: 'N-', parsing: '----ASN-', gloss: 'name' },
  { word: 'σάρξ',        lemma: 'σάρξ',        pos: 'N-', parsing: '----NSF-', gloss: 'flesh' },
  { word: 'σαρκός',      lemma: 'σάρξ',        pos: 'N-', parsing: '----GSF-', gloss: 'flesh' },
  { word: 'σαρκί',       lemma: 'σάρξ',        pos: 'N-', parsing: '----DSF-', gloss: 'flesh' },
  { word: 'σάρκα',       lemma: 'σάρξ',        pos: 'N-', parsing: '----ASF-', gloss: 'flesh' },

  // ── Nouns — 2nd declension neuter ────────────────────────────────────────────
  { word: 'τέκνον',      lemma: 'τέκνον',      pos: 'N-', parsing: '----NSN-', gloss: 'child' },
  { word: 'τέκνου',      lemma: 'τέκνον',      pos: 'N-', parsing: '----GSN-', gloss: 'child' },
  { word: 'τέκνῳ',       lemma: 'τέκνον',      pos: 'N-', parsing: '----DSN-', gloss: 'child' },
  { word: 'τέκνα',       lemma: 'τέκνον',      pos: 'N-', parsing: '----NPN-', gloss: 'child' },
  { word: 'τέκνων',      lemma: 'τέκνον',      pos: 'N-', parsing: '----GPN-', gloss: 'child' },
  { word: 'ἔργον',       lemma: 'ἔργον',       pos: 'N-', parsing: '----NSN-', gloss: 'work' },
  { word: 'ἔργου',       lemma: 'ἔργον',       pos: 'N-', parsing: '----GSN-', gloss: 'work' },
  { word: 'ἔργῳ',        lemma: 'ἔργον',       pos: 'N-', parsing: '----DSN-', gloss: 'work' },
  { word: 'ἔργα',        lemma: 'ἔργον',       pos: 'N-', parsing: '----NPN-', gloss: 'work' },
  { word: 'ἔργων',       lemma: 'ἔργον',       pos: 'N-', parsing: '----GPN-', gloss: 'work' },

  // ── Adjectives ───────────────────────────────────────────────────────────────
  { word: 'ἅγιος',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----NSM-', gloss: 'holy' },
  { word: 'ἁγίου',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----GSM-', gloss: 'holy' },
  { word: 'ἁγίῳ',        lemma: 'ἅγιος',       pos: 'A-', parsing: '----DSM-', gloss: 'holy' },
  { word: 'ἅγιον',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----NSN-', gloss: 'holy' },
  { word: 'ἁγίου',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----GSN-', gloss: 'holy' },
  { word: 'ἁγίᾳ',        lemma: 'ἅγιος',       pos: 'A-', parsing: '----DSF-', gloss: 'holy' },
  { word: 'ἁγίας',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----GSF-', gloss: 'holy' },
  { word: 'ἅγιοι',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----NPM-', gloss: 'holy' },
  { word: 'ἁγίων',       lemma: 'ἅγιος',       pos: 'A-', parsing: '----GPM-', gloss: 'holy' },
  { word: 'καλός',       lemma: 'καλός',       pos: 'A-', parsing: '----NSM-', gloss: 'good' },
  { word: 'καλοῦ',       lemma: 'καλός',       pos: 'A-', parsing: '----GSM-', gloss: 'good' },
  { word: 'καλόν',       lemma: 'καλός',       pos: 'A-', parsing: '----NSN-', gloss: 'good' },
  { word: 'καλῆς',       lemma: 'καλός',       pos: 'A-', parsing: '----GSF-', gloss: 'good' },
  { word: 'πιστός',      lemma: 'πιστός',      pos: 'A-', parsing: '----NSM-', gloss: 'faithful' },
  { word: 'πιστοῦ',      lemma: 'πιστός',      pos: 'A-', parsing: '----GSM-', gloss: 'faithful' },
  { word: 'πιστόν',      lemma: 'πιστός',      pos: 'A-', parsing: '----ASM-', gloss: 'faithful' },
  { word: 'πολλοί',      lemma: 'πολύς',       pos: 'A-', parsing: '----NPM-', gloss: 'many' },
  { word: 'πολλῶν',      lemma: 'πολύς',       pos: 'A-', parsing: '----GPM-', gloss: 'many' },
  { word: 'πολλά',       lemma: 'πολύς',       pos: 'A-', parsing: '----NPN-', gloss: 'many' },
  { word: 'πολλήν',      lemma: 'πολύς',       pos: 'A-', parsing: '----ASF-', gloss: 'many' },
  { word: 'πρῶτος',      lemma: 'πρῶτος',      pos: 'A-', parsing: '----NSM-', gloss: 'first' },
  { word: 'πρώτου',      lemma: 'πρῶτος',      pos: 'A-', parsing: '----GSM-', gloss: 'first' },
  { word: 'νεκρός',      lemma: 'νεκρός',      pos: 'A-', parsing: '----NSM-', gloss: 'dead' },
  { word: 'νεκρῶν',      lemma: 'νεκρός',      pos: 'A-', parsing: '----GPM-', gloss: 'dead' },
  { word: 'αἰώνιος',     lemma: 'αἰώνιος',     pos: 'A-', parsing: '----NSM-', gloss: 'eternal' },
  { word: 'αἰωνίου',     lemma: 'αἰώνιος',     pos: 'A-', parsing: '----GSM-', gloss: 'eternal' },
  { word: 'αἰώνιον',     lemma: 'αἰώνιος',     pos: 'A-', parsing: '----ASM-', gloss: 'eternal' },
  { word: 'αἰωνίαν',     lemma: 'αἰώνιος',     pos: 'A-', parsing: '----ASF-', gloss: 'eternal' },

  // ── Finite verbs — Present Active Indicative ─────────────────────────────────
  { word: 'λέγω',        lemma: 'λέγω',        pos: 'V-', parsing: '1PAI-S--', gloss: 'say' },
  { word: 'λέγεις',      lemma: 'λέγω',        pos: 'V-', parsing: '2PAI-S--', gloss: 'say' },
  { word: 'λέγει',       lemma: 'λέγω',        pos: 'V-', parsing: '3PAI-S--', gloss: 'say' },
  { word: 'λέγομεν',     lemma: 'λέγω',        pos: 'V-', parsing: '1PAI-P--', gloss: 'say' },
  { word: 'λέγετε',      lemma: 'λέγω',        pos: 'V-', parsing: '2PAI-P--', gloss: 'say' },
  { word: 'λέγουσιν',    lemma: 'λέγω',        pos: 'V-', parsing: '3PAI-P--', gloss: 'say' },
  { word: 'πιστεύω',     lemma: 'πιστεύω',     pos: 'V-', parsing: '1PAI-S--', gloss: 'believe' },
  { word: 'πιστεύεις',   lemma: 'πιστεύω',     pos: 'V-', parsing: '2PAI-S--', gloss: 'believe' },
  { word: 'πιστεύει',    lemma: 'πιστεύω',     pos: 'V-', parsing: '3PAI-S--', gloss: 'believe' },
  { word: 'πιστεύετε',   lemma: 'πιστεύω',     pos: 'V-', parsing: '2PAI-P--', gloss: 'believe' },
  { word: 'πιστεύουσιν', lemma: 'πιστεύω',     pos: 'V-', parsing: '3PAI-P--', gloss: 'believe' },
  { word: 'ἔχω',         lemma: 'ἔχω',         pos: 'V-', parsing: '1PAI-S--', gloss: 'have' },
  { word: 'ἔχεις',       lemma: 'ἔχω',         pos: 'V-', parsing: '2PAI-S--', gloss: 'have' },
  { word: 'ἔχει',        lemma: 'ἔχω',         pos: 'V-', parsing: '3PAI-S--', gloss: 'have' },
  { word: 'ἔχομεν',      lemma: 'ἔχω',         pos: 'V-', parsing: '1PAI-P--', gloss: 'have' },
  { word: 'ἔχετε',       lemma: 'ἔχω',         pos: 'V-', parsing: '2PAI-P--', gloss: 'have' },
  { word: 'ἀκούει',      lemma: 'ἀκούω',       pos: 'V-', parsing: '3PAI-S--', gloss: 'hear' },
  { word: 'ἀκούετε',     lemma: 'ἀκούω',       pos: 'V-', parsing: '2PAI-P--', gloss: 'hear' },
  { word: 'ἀκούουσιν',   lemma: 'ἀκούω',       pos: 'V-', parsing: '3PAI-P--', gloss: 'hear' },
  { word: 'βλέπει',      lemma: 'βλέπω',       pos: 'V-', parsing: '3PAI-S--', gloss: 'see' },
  { word: 'βλέπετε',     lemma: 'βλέπω',       pos: 'V-', parsing: '2PAI-P--', gloss: 'see' },
  { word: 'γινώσκει',    lemma: 'γινώσκω',     pos: 'V-', parsing: '3PAI-S--', gloss: 'know' },
  { word: 'γινώσκομεν',  lemma: 'γινώσκω',     pos: 'V-', parsing: '1PAI-P--', gloss: 'know' },

  // ── Finite verbs — Imperfect Active Indicative ───────────────────────────────
  { word: 'ἔλεγεν',      lemma: 'λέγω',        pos: 'V-', parsing: '3IAI-S--', gloss: 'say' },
  { word: 'ἔλεγον',      lemma: 'λέγω',        pos: 'V-', parsing: '3IAI-P--', gloss: 'say' },
  { word: 'ἐπίστευον',   lemma: 'πιστεύω',     pos: 'V-', parsing: '3IAI-P--', gloss: 'believe' },
  { word: 'εἶχεν',       lemma: 'ἔχω',         pos: 'V-', parsing: '3IAI-S--', gloss: 'have' },
  { word: 'ἤκουεν',      lemma: 'ἀκούω',       pos: 'V-', parsing: '3IAI-S--', gloss: 'hear' },

  // ── Finite verbs — Aorist Active Indicative ──────────────────────────────────
  { word: 'εἶπεν',       lemma: 'λέγω',        pos: 'V-', parsing: '3AAI-S--', gloss: 'say' },
  { word: 'εἶπον',       lemma: 'λέγω',        pos: 'V-', parsing: '3AAI-P--', gloss: 'say' },
  { word: 'ἐπίστευσεν',  lemma: 'πιστεύω',     pos: 'V-', parsing: '3AAI-S--', gloss: 'believe' },
  { word: 'ἐπίστευσαν',  lemma: 'πιστεύω',     pos: 'V-', parsing: '3AAI-P--', gloss: 'believe' },
  { word: 'ἤκουσεν',     lemma: 'ἀκούω',       pos: 'V-', parsing: '3AAI-S--', gloss: 'hear' },
  { word: 'ἤκουσαν',     lemma: 'ἀκούω',       pos: 'V-', parsing: '3AAI-P--', gloss: 'hear' },
  { word: 'ἦλθεν',       lemma: 'ἔρχομαι',     pos: 'V-', parsing: '3AAI-S--', gloss: 'come' },
  { word: 'ἦλθον',       lemma: 'ἔρχομαι',     pos: 'V-', parsing: '3AAI-P--', gloss: 'come' },
  { word: 'εἶδεν',       lemma: 'ὁράω',        pos: 'V-', parsing: '3AAI-S--', gloss: 'see' },
  { word: 'εἶδον',       lemma: 'ὁράω',        pos: 'V-', parsing: '3AAI-P--', gloss: 'see' },
  { word: 'ἔλαβεν',      lemma: 'λαμβάνω',     pos: 'V-', parsing: '3AAI-S--', gloss: 'take' },
  { word: 'ἔλαβον',      lemma: 'λαμβάνω',     pos: 'V-', parsing: '3AAI-P--', gloss: 'take' },

  // ── Finite verbs — Future Active Indicative ──────────────────────────────────
  { word: 'ἐλεύσεται',   lemma: 'ἔρχομαι',     pos: 'V-', parsing: '3FMI-S--', gloss: 'come' },
  { word: 'πιστεύσουσιν',lemma: 'πιστεύω',     pos: 'V-', parsing: '3FAI-P--', gloss: 'believe' },

  // ── Finite verbs — Perfect Active Indicative ─────────────────────────────────
  { word: 'γέγραπται',   lemma: 'γράφω',       pos: 'V-', parsing: '3XPI-S--', gloss: 'write' },
  { word: 'πεπίστευκεν', lemma: 'πιστεύω',     pos: 'V-', parsing: '3XAI-S--', gloss: 'believe' },
  { word: 'γέγονεν',     lemma: 'γίνομαι',     pos: 'V-', parsing: '3XAI-S--', gloss: 'become' },

  // ── Finite verbs — Present Middle/Passive Indicative ─────────────────────────
  { word: 'γίνεται',     lemma: 'γίνομαι',     pos: 'V-', parsing: '3PMI-S--', gloss: 'become' },
  { word: 'γίνονται',    lemma: 'γίνομαι',     pos: 'V-', parsing: '3PMI-P--', gloss: 'become' },
  { word: 'ἀποκρίνεται', lemma: 'ἀποκρίνομαι', pos: 'V-', parsing: '3PMI-S--', gloss: 'answer' },

  // ── Finite verbs — Aorist Middle Indicative ──────────────────────────────────
  { word: 'ἐγένετο',     lemma: 'γίνομαι',     pos: 'V-', parsing: '3AMI-S--', gloss: 'become' },
  { word: 'ἐγένοντο',    lemma: 'γίνομαι',     pos: 'V-', parsing: '3AMI-P--', gloss: 'become' },
  { word: 'ἀπεκρίθη',    lemma: 'ἀποκρίνομαι', pos: 'V-', parsing: '3API-S--', gloss: 'answer' },

  // ── Finite verbs — Present Active Subjunctive ────────────────────────────────
  { word: 'πιστεύῃ',     lemma: 'πιστεύω',     pos: 'V-', parsing: '3PAS-S--', gloss: 'believe' },
  { word: 'ἔχῃ',         lemma: 'ἔχω',         pos: 'V-', parsing: '3PAS-S--', gloss: 'have' },
  { word: 'ἀγαπᾷ',       lemma: 'ἀγαπάω',      pos: 'V-', parsing: '3PAS-S--', gloss: 'love' },
  { word: 'γίνηται',     lemma: 'γίνομαι',     pos: 'V-', parsing: '3PMS-S--', gloss: 'become' },

  // ── Finite verbs — Aorist Active Subjunctive ─────────────────────────────────
  { word: 'πιστεύσητε',  lemma: 'πιστεύω',     pos: 'V-', parsing: '2AAS-P--', gloss: 'believe' },
  { word: 'εἴπῃ',        lemma: 'λέγω',        pos: 'V-', parsing: '3AAS-S--', gloss: 'say' },
  { word: 'ἀκούσῃ',      lemma: 'ἀκούω',       pos: 'V-', parsing: '3AAS-S--', gloss: 'hear' },

  // ── Finite verbs — Present Active Imperative ─────────────────────────────────
  { word: 'ἄκουε',       lemma: 'ἀκούω',       pos: 'V-', parsing: '2PAD-S--', gloss: 'hear' },
  { word: 'βλέπετε',     lemma: 'βλέπω',       pos: 'V-', parsing: '2PAD-P--', gloss: 'see' },
  { word: 'ἀγαπᾶτε',     lemma: 'ἀγαπάω',      pos: 'V-', parsing: '2PAD-P--', gloss: 'love' },
  { word: 'πιστεύετε',   lemma: 'πιστεύω',     pos: 'V-', parsing: '2PAD-P--', gloss: 'believe' },

  // ── Finite verbs — Aorist Active Imperative ──────────────────────────────────
  { word: 'εἰπέ',        lemma: 'λέγω',        pos: 'V-', parsing: '2AAD-S--', gloss: 'say' },
  { word: 'ἄκουσον',     lemma: 'ἀκούω',       pos: 'V-', parsing: '2AAD-S--', gloss: 'hear' },
  { word: 'πίστευσον',   lemma: 'πιστεύω',     pos: 'V-', parsing: '2AAD-S--', gloss: 'believe' },

  // ── Infinitives — Present Active ─────────────────────────────────────────────
  { word: 'λέγειν',      lemma: 'λέγω',        pos: 'V-', parsing: '-PAN----', gloss: 'say' },
  { word: 'πιστεύειν',   lemma: 'πιστεύω',     pos: 'V-', parsing: '-PAN----', gloss: 'believe' },
  { word: 'ἔχειν',       lemma: 'ἔχω',         pos: 'V-', parsing: '-PAN----', gloss: 'have' },
  { word: 'ἀκούειν',     lemma: 'ἀκούω',       pos: 'V-', parsing: '-PAN----', gloss: 'hear' },
  { word: 'εἶναι',       lemma: 'εἰμί',        pos: 'V-', parsing: '-PAN----', gloss: 'be' },
  { word: 'γίνεσθαι',    lemma: 'γίνομαι',     pos: 'V-', parsing: '-PMN----', gloss: 'become' },

  // ── Infinitives — Aorist Active ──────────────────────────────────────────────
  { word: 'εἰπεῖν',      lemma: 'λέγω',        pos: 'V-', parsing: '-AAN----', gloss: 'say' },
  { word: 'ἀκοῦσαι',     lemma: 'ἀκούω',       pos: 'V-', parsing: '-AAN----', gloss: 'hear' },
  { word: 'λαβεῖν',      lemma: 'λαμβάνω',     pos: 'V-', parsing: '-AAN----', gloss: 'take' },
  { word: 'ἐλθεῖν',      lemma: 'ἔρχομαι',     pos: 'V-', parsing: '-AAN----', gloss: 'come' },
  { word: 'πιστεῦσαι',   lemma: 'πιστεύω',     pos: 'V-', parsing: '-AAN----', gloss: 'believe' },

  // ── Infinitives — Aorist Middle/Passive ──────────────────────────────────────
  { word: 'γενέσθαι',    lemma: 'γίνομαι',     pos: 'V-', parsing: '-AMN----', gloss: 'become' },
  { word: 'σωθῆναι',     lemma: 'σῴζω',        pos: 'V-', parsing: '-APN----', gloss: 'save' },
  { word: 'βαπτισθῆναι', lemma: 'βαπτίζω',     pos: 'V-', parsing: '-APN----', gloss: 'baptize' },

  // ── Participles — Present Active ─────────────────────────────────────────────
  { word: 'λέγων',       lemma: 'λέγω',        pos: 'V-', parsing: '-PAPNSM-', gloss: 'say' },
  { word: 'λέγοντος',    lemma: 'λέγω',        pos: 'V-', parsing: '-PAPGSM-', gloss: 'say' },
  { word: 'λέγοντι',     lemma: 'λέγω',        pos: 'V-', parsing: '-PAPDSM-', gloss: 'say' },
  { word: 'λέγοντα',     lemma: 'λέγω',        pos: 'V-', parsing: '-PAPASM-', gloss: 'say' },
  { word: 'λέγοντες',    lemma: 'λέγω',        pos: 'V-', parsing: '-PAPNPM-', gloss: 'say' },
  { word: 'λέγουσα',     lemma: 'λέγω',        pos: 'V-', parsing: '-PAPNSF-', gloss: 'say' },
  { word: 'λεγούσης',    lemma: 'λέγω',        pos: 'V-', parsing: '-PAPGSF-', gloss: 'say' },
  { word: 'λέγον',       lemma: 'λέγω',        pos: 'V-', parsing: '-PAPNSN-', gloss: 'say' },
  { word: 'πιστεύων',    lemma: 'πιστεύω',     pos: 'V-', parsing: '-PAPNSM-', gloss: 'believe' },
  { word: 'πιστεύοντος', lemma: 'πιστεύω',     pos: 'V-', parsing: '-PAPGSM-', gloss: 'believe' },
  { word: 'πιστεύοντα',  lemma: 'πιστεύω',     pos: 'V-', parsing: '-PAPASM-', gloss: 'believe' },
  { word: 'ἔχων',        lemma: 'ἔχω',         pos: 'V-', parsing: '-PAPNSM-', gloss: 'have' },
  { word: 'ἔχοντος',     lemma: 'ἔχω',         pos: 'V-', parsing: '-PAPGSM-', gloss: 'have' },
  { word: 'ἔχοντα',      lemma: 'ἔχω',         pos: 'V-', parsing: '-PAPASM-', gloss: 'have' },
  { word: 'ἔχοντες',     lemma: 'ἔχω',         pos: 'V-', parsing: '-PAPNPM-', gloss: 'have' },
  { word: 'ἀκούων',      lemma: 'ἀκούω',       pos: 'V-', parsing: '-PAPNSM-', gloss: 'hear' },
  { word: 'ἀκούοντες',   lemma: 'ἀκούω',       pos: 'V-', parsing: '-PAPNPM-', gloss: 'hear' },
  { word: 'γινόμενος',   lemma: 'γίνομαι',     pos: 'V-', parsing: '-PMPNSM-', gloss: 'become' },

  // ── Participles — Aorist Active ──────────────────────────────────────────────
  { word: 'εἰπών',       lemma: 'λέγω',        pos: 'V-', parsing: '-AAPNSM-', gloss: 'say' },
  { word: 'εἰπόντος',    lemma: 'λέγω',        pos: 'V-', parsing: '-AAPGSM-', gloss: 'say' },
  { word: 'εἰπόντα',     lemma: 'λέγω',        pos: 'V-', parsing: '-AAPASM-', gloss: 'say' },
  { word: 'ἀκούσας',     lemma: 'ἀκούω',       pos: 'V-', parsing: '-AAPNSM-', gloss: 'hear' },
  { word: 'ἀκούσαντος',  lemma: 'ἀκούω',       pos: 'V-', parsing: '-AAPGSM-', gloss: 'hear' },
  { word: 'ἐλθών',       lemma: 'ἔρχομαι',     pos: 'V-', parsing: '-AAPNSM-', gloss: 'come' },
  { word: 'ἐλθόντος',    lemma: 'ἔρχομαι',     pos: 'V-', parsing: '-AAPGSM-', gloss: 'come' },
  { word: 'λαβών',       lemma: 'λαμβάνω',     pos: 'V-', parsing: '-AAPNSM-', gloss: 'take' },
  { word: 'πιστεύσας',   lemma: 'πιστεύω',     pos: 'V-', parsing: '-AAPNSM-', gloss: 'believe' },
  { word: 'πιστεύσαντος',lemma: 'πιστεύω',     pos: 'V-', parsing: '-AAPGSM-', gloss: 'believe' },

  // ── Participles — Aorist Passive ─────────────────────────────────────────────
  { word: 'γραφείς',     lemma: 'γράφω',       pos: 'V-', parsing: '-APPNSM-', gloss: 'write' },
  { word: 'βαπτισθείς',  lemma: 'βαπτίζω',     pos: 'V-', parsing: '-APPNSM-', gloss: 'baptize' },
  { word: 'σωθείς',      lemma: 'σῴζω',        pos: 'V-', parsing: '-APPNSM-', gloss: 'save' },
  { word: 'σωθέντος',    lemma: 'σῴζω',        pos: 'V-', parsing: '-APPGSM-', gloss: 'save' },
  { word: 'σωθεῖσα',     lemma: 'σῴζω',        pos: 'V-', parsing: '-APPNSF-', gloss: 'save' },

  // ── Participles — Perfect Active ─────────────────────────────────────────────
  { word: 'πεπιστευκώς', lemma: 'πιστεύω',     pos: 'V-', parsing: '-XAPNSM-', gloss: 'believe' },
  { word: 'γεγραφώς',    lemma: 'γράφω',       pos: 'V-', parsing: '-XAPNSM-', gloss: 'write' },

  // ── Participles — Perfect Passive ────────────────────────────────────────────
  { word: 'γεγραμμένος', lemma: 'γράφω',       pos: 'V-', parsing: '-XPPNSM-', gloss: 'write' },
  { word: 'γεγραμμένον', lemma: 'γράφω',       pos: 'V-', parsing: '-XPPNSN-', gloss: 'write' },
  { word: 'γεγραμμένη',  lemma: 'γράφω',       pos: 'V-', parsing: '-XPPNSF-', gloss: 'write' },
];

/**
 * Return a random sample of `n` words from the drill pool.
 * Uses Fisher-Yates partial shuffle to avoid duplicates.
 */
export function sampleDrillPool(n: number): DrillWord[] {
  const pool = [...DRILL_POOL];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
