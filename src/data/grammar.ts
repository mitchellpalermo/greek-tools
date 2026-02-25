/**
 * Grammar reference data for Koine Greek.
 * Covers noun declensions, verb conjugations, pronouns, prepositions, and accent rules.
 * All paradigms use λύω (verb) or representative GNT nouns as models.
 */

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export const CASES = ['nom', 'gen', 'dat', 'acc', 'voc'] as const;
export type CaseKey = (typeof CASES)[number];

export const NUMBERS = ['sg', 'pl'] as const;
export type NumKey = (typeof NUMBERS)[number];

export const GENDERS = ['m', 'f', 'n'] as const;
export type GenderKey = (typeof GENDERS)[number];

export const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
export type PersonNum = (typeof PERSONS)[number];

export type PrepCase = 'gen' | 'dat' | 'acc';

// ---------------------------------------------------------------------------
// Display labels and descriptions
// ---------------------------------------------------------------------------

export const CASE_LABELS: Record<CaseKey, string> = {
  nom: 'Nom',
  gen: 'Gen',
  dat: 'Dat',
  acc: 'Acc',
  voc: 'Voc',
};

export const CASE_DESCRIPTIONS: Record<CaseKey, string> = {
  nom: 'Nominative — subject of the verb',
  gen: 'Genitive — possession, source, or description (of)',
  dat: 'Dative — indirect object; by, with, or in',
  acc: 'Accusative — direct object; motion toward',
  voc: 'Vocative — direct address',
};

export const NUM_LABELS: Record<NumKey, string> = {
  sg: 'Singular',
  pl: 'Plural',
};

export const GENDER_LABELS: Record<GenderKey, string> = {
  m: 'Masc.',
  f: 'Fem.',
  n: 'Neut.',
};

export const PERSON_LABELS: Record<PersonNum, string> = {
  '1sg': '1st sg',
  '2sg': '2nd sg',
  '3sg': '3rd sg',
  '1pl': '1st pl',
  '2pl': '2nd pl',
  '3pl': '3rd pl',
};

export const PERSON_FULL_LABELS: Record<PersonNum, string> = {
  '1sg': '1st Person Singular',
  '2sg': '2nd Person Singular',
  '3sg': '3rd Person Singular',
  '1pl': '1st Person Plural',
  '2pl': '2nd Person Plural',
  '3pl': '3rd Person Plural',
};

// ---------------------------------------------------------------------------
// Noun types
// ---------------------------------------------------------------------------

/** A single inflected noun form paired with its grammatical ending. */
export interface NounForm {
  /** The complete inflected form, e.g. "ἡμέρας" */
  full: string;
  /** The ending alone, e.g. "ας" — used in endings-only mode */
  ending: string;
}

export interface NounParadigm {
  id: string;
  /** Display name, e.g. "1st Declension Feminine — ἡμέρα" */
  name: string;
  declension: '1st' | '2nd' | '3rd';
  gender: 'masculine' | 'feminine' | 'neuter';
  forms: Record<CaseKey, Record<NumKey, NounForm>>;
}

export interface AdjParadigm {
  id: string;
  name: string;
  type: '2-1-2' | '3-1-3';
  /** forms[case][number][gender] — full inflected form */
  forms: Record<CaseKey, Record<NumKey, Record<GenderKey, string>>>;
}

// ---------------------------------------------------------------------------
// Verb types
// ---------------------------------------------------------------------------

export interface VerbParadigm {
  id: string;
  /** e.g. "Present Active Indicative" */
  label: string;
  group: 'indicative' | 'subjunctive' | 'imperative';
  /** Keyed by person-number; undefined = form does not exist (e.g. 1sg imperative) */
  forms: Partial<Record<PersonNum, string>>;
}

export interface InfinitivePair {
  label: string;
  form: string;
}

export interface ParticipleRow {
  label: string;
  m: string;
  f: string;
  n: string;
}

// ---------------------------------------------------------------------------
// Pronoun types
// ---------------------------------------------------------------------------

/** First and second person personal pronouns (no gender variation). */
export interface PersonalPronoun12 {
  id: string;
  name: string;
  kind: '1st' | '2nd';
  /** forms[number][case] — some cases may have two forms (emphatic / unemphatic) */
  forms: Record<NumKey, Partial<Record<CaseKey, string>>>;
}

/** Pronouns that decline for gender (3rd person, demonstrative, relative, interrogative). */
export interface GenderedPronoun {
  id: string;
  name: string;
  kind: '3rd-personal' | 'demonstrative' | 'relative' | 'interrogative';
  /** forms[case][number][gender] */
  forms: Partial<Record<CaseKey, Record<NumKey, Record<GenderKey, string>>>>;
}

// ---------------------------------------------------------------------------
// Preposition types
// ---------------------------------------------------------------------------

export interface PrepEntry {
  greek: string;
  cases: PrepCase[];
  glosses: Partial<Record<PrepCase, string>>;
}

// ---------------------------------------------------------------------------
// Accent rule types
// ---------------------------------------------------------------------------

export interface AccentSection {
  title: string;
  rules: string[];
}

// ===========================================================================
// DATA
// ===========================================================================

// ---------------------------------------------------------------------------
// Nouns
// ---------------------------------------------------------------------------

export const nounParadigms: NounParadigm[] = [
  {
    id: '1f-alpha-pure',
    name: '1st Decl. Feminine — ἡμέρα (α-pure)',
    declension: '1st',
    gender: 'feminine',
    forms: {
      nom: { sg: { full: 'ἡμέρα',  ending: 'α'   }, pl: { full: 'ἡμέραι',  ending: 'αι'  } },
      gen: { sg: { full: 'ἡμέρας', ending: 'ας'  }, pl: { full: 'ἡμερῶν', ending: 'ων'  } },
      dat: { sg: { full: 'ἡμέρᾳ', ending: 'ᾳ'   }, pl: { full: 'ἡμέραις', ending: 'αις' } },
      acc: { sg: { full: 'ἡμέραν', ending: 'αν'  }, pl: { full: 'ἡμέρας',  ending: 'ας'  } },
      voc: { sg: { full: 'ἡμέρα',  ending: 'α'   }, pl: { full: 'ἡμέραι',  ending: 'αι'  } },
    },
  },
  {
    id: '1f-alpha-impure',
    name: '1st Decl. Feminine — δόξα (α-impure)',
    declension: '1st',
    gender: 'feminine',
    forms: {
      nom: { sg: { full: 'δόξα',  ending: 'α'   }, pl: { full: 'δόξαι',  ending: 'αι'  } },
      gen: { sg: { full: 'δόξης', ending: 'ης'  }, pl: { full: 'δοξῶν', ending: 'ων'  } },
      dat: { sg: { full: 'δόξῃ',  ending: 'ῃ'   }, pl: { full: 'δόξαις', ending: 'αις' } },
      acc: { sg: { full: 'δόξαν', ending: 'αν'  }, pl: { full: 'δόξας',  ending: 'ας'  } },
      voc: { sg: { full: 'δόξα',  ending: 'α'   }, pl: { full: 'δόξαι',  ending: 'αι'  } },
    },
  },
  {
    id: '1m-as',
    name: '1st Decl. Masculine — νεανίας',
    declension: '1st',
    gender: 'masculine',
    forms: {
      nom: { sg: { full: 'νεανίας',  ending: 'ας' }, pl: { full: 'νεανίαι',  ending: 'αι'  } },
      gen: { sg: { full: 'νεανίου',  ending: 'ου' }, pl: { full: 'νεανιῶν', ending: 'ων'  } },
      dat: { sg: { full: 'νεανίᾳ',  ending: 'ᾳ'  }, pl: { full: 'νεανίαις', ending: 'αις' } },
      acc: { sg: { full: 'νεανίαν',  ending: 'αν' }, pl: { full: 'νεανίας',  ending: 'ας'  } },
      voc: { sg: { full: 'νεανία',   ending: 'α'  }, pl: { full: 'νεανίαι',  ending: 'αι'  } },
    },
  },
  {
    id: '2m-os',
    name: '2nd Decl. Masculine — λόγος',
    declension: '2nd',
    gender: 'masculine',
    forms: {
      nom: { sg: { full: 'λόγος', ending: 'ος'  }, pl: { full: 'λόγοι',  ending: 'οι'  } },
      gen: { sg: { full: 'λόγου', ending: 'ου'  }, pl: { full: 'λόγων',  ending: 'ων'  } },
      dat: { sg: { full: 'λόγῳ',  ending: 'ῳ'   }, pl: { full: 'λόγοις', ending: 'οις' } },
      acc: { sg: { full: 'λόγον', ending: 'ον'  }, pl: { full: 'λόγους', ending: 'ους' } },
      voc: { sg: { full: 'λόγε',  ending: 'ε'   }, pl: { full: 'λόγοι',  ending: 'οι'  } },
    },
  },
  {
    id: '2n-on',
    name: '2nd Decl. Neuter — ἔργον',
    declension: '2nd',
    gender: 'neuter',
    forms: {
      nom: { sg: { full: 'ἔργον', ending: 'ον' }, pl: { full: 'ἔργα',   ending: 'α'   } },
      gen: { sg: { full: 'ἔργου', ending: 'ου' }, pl: { full: 'ἔργων',  ending: 'ων'  } },
      dat: { sg: { full: 'ἔργῳ',  ending: 'ῳ'  }, pl: { full: 'ἔργοις', ending: 'οις' } },
      acc: { sg: { full: 'ἔργον', ending: 'ον' }, pl: { full: 'ἔργα',   ending: 'α'   } },
      voc: { sg: { full: 'ἔργον', ending: 'ον' }, pl: { full: 'ἔργα',   ending: 'α'   } },
    },
  },
  {
    id: '3-mute',
    name: '3rd Decl. Mute Stem — σάρξ (κ-stem)',
    declension: '3rd',
    gender: 'feminine',
    forms: {
      nom: { sg: { full: 'σάρξ',     ending: 'ξ'     }, pl: { full: 'σάρκες',    ending: 'ες'     } },
      gen: { sg: { full: 'σαρκός',   ending: 'ός'    }, pl: { full: 'σαρκῶν',   ending: 'ῶν'     } },
      dat: { sg: { full: 'σαρκί',    ending: 'ί'     }, pl: { full: 'σαρξί(ν)', ending: 'σί(ν)'  } },
      acc: { sg: { full: 'σάρκα',    ending: 'α'     }, pl: { full: 'σάρκας',   ending: 'ας'     } },
      voc: { sg: { full: 'σάρξ',     ending: 'ξ'     }, pl: { full: 'σάρκες',   ending: 'ες'     } },
    },
  },
  {
    id: '3-i-stem',
    name: '3rd Decl. i-Stem — πίστις',
    declension: '3rd',
    gender: 'feminine',
    forms: {
      nom: { sg: { full: 'πίστις',    ending: 'ις'    }, pl: { full: 'πίστεις',    ending: 'εις'    } },
      gen: { sg: { full: 'πίστεως',   ending: 'εως'   }, pl: { full: 'πίστεων',   ending: 'εων'    } },
      dat: { sg: { full: 'πίστει',    ending: 'ει'    }, pl: { full: 'πίστεσι(ν)', ending: 'εσι(ν)' } },
      acc: { sg: { full: 'πίστιν',    ending: 'ιν'    }, pl: { full: 'πίστεις',   ending: 'εις'    } },
      voc: { sg: { full: 'πίστι',     ending: 'ι'     }, pl: { full: 'πίστεις',   ending: 'εις'    } },
    },
  },
  {
    id: '3-u-stem',
    name: '3rd Decl. υ-Stem — βασιλεύς',
    declension: '3rd',
    gender: 'masculine',
    forms: {
      nom: { sg: { full: 'βασιλεύς',    ending: 'ς'     }, pl: { full: 'βασιλεῖς',    ending: 'εῖς'    } },
      gen: { sg: { full: 'βασιλέως',    ending: 'ως'    }, pl: { full: 'βασιλέων',   ending: 'ων'     } },
      dat: { sg: { full: 'βασιλεῖ',     ending: 'ῖ'     }, pl: { full: 'βασιλεῦσι(ν)', ending: 'σι(ν)' } },
      acc: { sg: { full: 'βασιλέα',     ending: 'α'     }, pl: { full: 'βασιλεῖς',   ending: 'εῖς'    } },
      voc: { sg: { full: 'βασιλεῦ',     ending: 'ῦ'     }, pl: { full: 'βασιλεῖς',   ending: 'εῖς'    } },
    },
  },
  {
    id: '3-s-stem',
    name: '3rd Decl. Neuter s-Stem — γένος',
    declension: '3rd',
    gender: 'neuter',
    forms: {
      nom: { sg: { full: 'γένος',  ending: 'ος'  }, pl: { full: 'γένη',     ending: 'η'      } },
      gen: { sg: { full: 'γένους', ending: 'ους' }, pl: { full: 'γενῶν',   ending: 'ῶν'     } },
      dat: { sg: { full: 'γένει',  ending: 'ει'  }, pl: { full: 'γένεσι(ν)', ending: 'εσι(ν)' } },
      acc: { sg: { full: 'γένος',  ending: 'ος'  }, pl: { full: 'γένη',     ending: 'η'      } },
      voc: { sg: { full: 'γένος',  ending: 'ος'  }, pl: { full: 'γένη',     ending: 'η'      } },
    },
  },
];

// ---------------------------------------------------------------------------
// Adjectives
// ---------------------------------------------------------------------------

export const adjParadigms: AdjParadigm[] = [
  {
    id: 'adj-2-1-2',
    name: '2-1-2 Adjective — ἀγαθός, -ή, -όν',
    type: '2-1-2',
    forms: {
      nom: {
        sg: { m: 'ἀγαθός', f: 'ἀγαθή',  n: 'ἀγαθόν' },
        pl: { m: 'ἀγαθοί', f: 'ἀγαθαί', n: 'ἀγαθά'  },
      },
      gen: {
        sg: { m: 'ἀγαθοῦ', f: 'ἀγαθῆς', n: 'ἀγαθοῦ' },
        pl: { m: 'ἀγαθῶν', f: 'ἀγαθῶν', n: 'ἀγαθῶν' },
      },
      dat: {
        sg: { m: 'ἀγαθῷ',  f: 'ἀγαθῇ',  n: 'ἀγαθῷ'  },
        pl: { m: 'ἀγαθοῖς', f: 'ἀγαθαῖς', n: 'ἀγαθοῖς' },
      },
      acc: {
        sg: { m: 'ἀγαθόν', f: 'ἀγαθήν', n: 'ἀγαθόν' },
        pl: { m: 'ἀγαθούς', f: 'ἀγαθάς', n: 'ἀγαθά'  },
      },
      voc: {
        sg: { m: 'ἀγαθέ',  f: 'ἀγαθή',  n: 'ἀγαθόν' },
        pl: { m: 'ἀγαθοί', f: 'ἀγαθαί', n: 'ἀγαθά'  },
      },
    },
  },
  {
    id: 'adj-3-1-3',
    name: '3-1-3 Adjective — πᾶς, πᾶσα, πᾶν',
    type: '3-1-3',
    forms: {
      nom: {
        sg: { m: 'πᾶς',    f: 'πᾶσα',  n: 'πᾶν'    },
        pl: { m: 'πάντες', f: 'πᾶσαι', n: 'πάντα'  },
      },
      gen: {
        sg: { m: 'παντός', f: 'πάσης', n: 'παντός' },
        pl: { m: 'πάντων', f: 'πασῶν', n: 'πάντων' },
      },
      dat: {
        sg: { m: 'παντί',    f: 'πάσῃ',   n: 'παντί'    },
        pl: { m: 'πᾶσι(ν)', f: 'πάσαις', n: 'πᾶσι(ν)' },
      },
      acc: {
        sg: { m: 'πάντα',  f: 'πᾶσαν', n: 'πᾶν'   },
        pl: { m: 'πάντας', f: 'πάσας',  n: 'πάντα' },
      },
      voc: {
        sg: { m: 'πᾶς',    f: 'πᾶσα',  n: 'πᾶν'   },
        pl: { m: 'πάντες', f: 'πᾶσαι', n: 'πάντα' },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Verbs — λύω paradigms
// ---------------------------------------------------------------------------

export const verbParadigms: VerbParadigm[] = [
  // Indicative
  {
    id: 'pres-act-ind',
    label: 'Present Active Indicative',
    group: 'indicative',
    forms: { '1sg': 'λύω', '2sg': 'λύεις', '3sg': 'λύει', '1pl': 'λύομεν', '2pl': 'λύετε', '3pl': 'λύουσι(ν)' },
  },
  {
    id: 'pres-mid-ind',
    label: 'Present Middle/Passive Indicative',
    group: 'indicative',
    forms: { '1sg': 'λύομαι', '2sg': 'λύῃ', '3sg': 'λύεται', '1pl': 'λυόμεθα', '2pl': 'λύεσθε', '3pl': 'λύονται' },
  },
  {
    id: 'impf-act-ind',
    label: 'Imperfect Active Indicative',
    group: 'indicative',
    forms: { '1sg': 'ἔλυον', '2sg': 'ἔλυες', '3sg': 'ἔλυε(ν)', '1pl': 'ἐλύομεν', '2pl': 'ἐλύετε', '3pl': 'ἔλυον' },
  },
  {
    id: 'impf-mid-ind',
    label: 'Imperfect Middle/Passive Indicative',
    group: 'indicative',
    forms: { '1sg': 'ἐλυόμην', '2sg': 'ἐλύου', '3sg': 'ἐλύετο', '1pl': 'ἐλυόμεθα', '2pl': 'ἐλύεσθε', '3pl': 'ἐλύοντο' },
  },
  {
    id: 'fut-act-ind',
    label: 'Future Active Indicative',
    group: 'indicative',
    forms: { '1sg': 'λύσω', '2sg': 'λύσεις', '3sg': 'λύσει', '1pl': 'λύσομεν', '2pl': 'λύσετε', '3pl': 'λύσουσι(ν)' },
  },
  {
    id: 'fut-mid-ind',
    label: 'Future Middle Indicative',
    group: 'indicative',
    forms: { '1sg': 'λύσομαι', '2sg': 'λύσῃ', '3sg': 'λύσεται', '1pl': 'λυσόμεθα', '2pl': 'λύσεσθε', '3pl': 'λύσονται' },
  },
  {
    id: 'aor-act-ind',
    label: 'Aorist Active Indicative',
    group: 'indicative',
    forms: { '1sg': 'ἔλυσα', '2sg': 'ἔλυσας', '3sg': 'ἔλυσε(ν)', '1pl': 'ἐλύσαμεν', '2pl': 'ἐλύσατε', '3pl': 'ἔλυσαν' },
  },
  {
    id: 'aor-mid-ind',
    label: 'Aorist Middle Indicative',
    group: 'indicative',
    forms: { '1sg': 'ἐλυσάμην', '2sg': 'ἐλύσω', '3sg': 'ἐλύσατο', '1pl': 'ἐλυσάμεθα', '2pl': 'ἐλύσασθε', '3pl': 'ἐλύσαντο' },
  },
  {
    id: 'aor-pass-ind',
    label: 'Aorist Passive Indicative',
    group: 'indicative',
    forms: { '1sg': 'ἐλύθην', '2sg': 'ἐλύθης', '3sg': 'ἐλύθη', '1pl': 'ἐλύθημεν', '2pl': 'ἐλύθητε', '3pl': 'ἐλύθησαν' },
  },
  {
    id: 'perf-act-ind',
    label: 'Perfect Active Indicative',
    group: 'indicative',
    forms: { '1sg': 'λέλυκα', '2sg': 'λέλυκας', '3sg': 'λέλυκε(ν)', '1pl': 'λελύκαμεν', '2pl': 'λελύκατε', '3pl': 'λελύκασι(ν)' },
  },
  // Subjunctive
  {
    id: 'pres-act-subj',
    label: 'Present Active Subjunctive',
    group: 'subjunctive',
    forms: { '1sg': 'λύω', '2sg': 'λύῃς', '3sg': 'λύῃ', '1pl': 'λύωμεν', '2pl': 'λύητε', '3pl': 'λύωσι(ν)' },
  },
  {
    id: 'pres-pass-subj',
    label: 'Present Passive Subjunctive',
    group: 'subjunctive',
    forms: { '1sg': 'λύωμαι', '2sg': 'λύῃ', '3sg': 'λύηται', '1pl': 'λυώμεθα', '2pl': 'λύησθε', '3pl': 'λύωνται' },
  },
  {
    id: 'aor-act-subj',
    label: 'Aorist Active Subjunctive',
    group: 'subjunctive',
    forms: { '1sg': 'λύσω', '2sg': 'λύσῃς', '3sg': 'λύσῃ', '1pl': 'λύσωμεν', '2pl': 'λύσητε', '3pl': 'λύσωσι(ν)' },
  },
  {
    id: 'aor-pass-subj',
    label: 'Aorist Passive Subjunctive',
    group: 'subjunctive',
    forms: { '1sg': 'λυθῶ', '2sg': 'λυθῇς', '3sg': 'λυθῇ', '1pl': 'λυθῶμεν', '2pl': 'λυθῆτε', '3pl': 'λυθῶσι(ν)' },
  },
  // Imperative — no 1st person forms
  {
    id: 'pres-act-imp',
    label: 'Present Active Imperative',
    group: 'imperative',
    forms: { '2sg': 'λῦε', '3sg': 'λυέτω', '2pl': 'λύετε', '3pl': 'λυόντων' },
  },
  {
    id: 'pres-pass-imp',
    label: 'Present Middle/Passive Imperative',
    group: 'imperative',
    forms: { '2sg': 'λύου', '3sg': 'λυέσθω', '2pl': 'λύεσθε', '3pl': 'λυέσθωσαν' },
  },
  {
    id: 'aor-act-imp',
    label: 'Aorist Active Imperative',
    group: 'imperative',
    forms: { '2sg': 'λῦσον', '3sg': 'λυσάτω', '2pl': 'λύσατε', '3pl': 'λυσάντων' },
  },
  {
    id: 'aor-pass-imp',
    label: 'Aorist Passive Imperative',
    group: 'imperative',
    forms: { '2sg': 'λύθητι', '3sg': 'λυθήτω', '2pl': 'λύθητε', '3pl': 'λυθήτωσαν' },
  },
];

export const infinitiveForms: InfinitivePair[] = [
  { label: 'Present Active',        form: 'λύειν'     },
  { label: 'Present Mid./Pass.',    form: 'λύεσθαι'   },
  { label: 'Future Active',         form: 'λύσειν'    },
  { label: 'Future Middle',         form: 'λύσεσθαι'  },
  { label: 'Aorist Active',         form: 'λῦσαι'     },
  { label: 'Aorist Middle',         form: 'λύσασθαι'  },
  { label: 'Aorist Passive',        form: 'λυθῆναι'   },
  { label: 'Perfect Active',        form: 'λελυκέναι' },
];

export const participleRows: ParticipleRow[] = [
  { label: 'Present Active',     m: 'λύων',      f: 'λύουσα',   n: 'λῦον'    },
  { label: 'Present Mid./Pass.', m: 'λυόμενος',  f: 'λυομένη',  n: 'λυόμενον' },
  { label: 'Aorist Active',      m: 'λύσας',     f: 'λύσασα',   n: 'λῦσαν'   },
  { label: 'Aorist Middle',      m: 'λυσάμενος', f: 'λυσαμένη', n: 'λυσάμενον' },
  { label: 'Aorist Passive',     m: 'λυθείς',    f: 'λυθεῖσα',  n: 'λυθέν'   },
  { label: 'Perfect Active',     m: 'λελυκώς',   f: 'λελυκυῖα', n: 'λελυκός' },
];

// ---------------------------------------------------------------------------
// Pronouns
// ---------------------------------------------------------------------------

export const personalPronouns12: PersonalPronoun12[] = [
  {
    id: 'ego',
    name: 'ἐγώ — 1st Person',
    kind: '1st',
    forms: {
      sg: { nom: 'ἐγώ',        gen: 'ἐμοῦ / μου', dat: 'ἐμοί / μοι', acc: 'ἐμέ / με' },
      pl: { nom: 'ἡμεῖς',      gen: 'ἡμῶν',       dat: 'ἡμῖν',       acc: 'ἡμᾶς'      },
    },
  },
  {
    id: 'su',
    name: 'σύ — 2nd Person',
    kind: '2nd',
    forms: {
      sg: { nom: 'σύ',         gen: 'σοῦ / σου', dat: 'σοί / σοι', acc: 'σέ / σε' },
      pl: { nom: 'ὑμεῖς',      gen: 'ὑμῶν',       dat: 'ὑμῖν',       acc: 'ὑμᾶς'    },
    },
  },
];

export const genderedPronouns: GenderedPronoun[] = [
  {
    id: 'autos',
    name: 'αὐτός — 3rd Person / Intensive',
    kind: '3rd-personal',
    forms: {
      nom: { sg: { m: 'αὐτός', f: 'αὐτή',  n: 'αὐτό'  }, pl: { m: 'αὐτοί',  f: 'αὐταί',  n: 'αὐτά'  } },
      gen: { sg: { m: 'αὐτοῦ', f: 'αὐτῆς', n: 'αὐτοῦ' }, pl: { m: 'αὐτῶν',  f: 'αὐτῶν',  n: 'αὐτῶν' } },
      dat: { sg: { m: 'αὐτῷ',  f: 'αὐτῇ',  n: 'αὐτῷ'  }, pl: { m: 'αὐτοῖς', f: 'αὐταῖς', n: 'αὐτοῖς' } },
      acc: { sg: { m: 'αὐτόν', f: 'αὐτήν', n: 'αὐτό'  }, pl: { m: 'αὐτούς', f: 'αὐτάς',  n: 'αὐτά'  } },
    },
  },
  {
    id: 'outos',
    name: 'οὗτος — Near Demonstrative (this)',
    kind: 'demonstrative',
    forms: {
      nom: { sg: { m: 'οὗτος', f: 'αὕτη',   n: 'τοῦτο'  }, pl: { m: 'οὗτοι',  f: 'αὗται',   n: 'ταῦτα'  } },
      gen: { sg: { m: 'τούτου', f: 'ταύτης', n: 'τούτου' }, pl: { m: 'τούτων', f: 'τούτων',  n: 'τούτων' } },
      dat: { sg: { m: 'τούτῳ', f: 'ταύτῃ',  n: 'τούτῳ'  }, pl: { m: 'τούτοις', f: 'ταύταις', n: 'τούτοις' } },
      acc: { sg: { m: 'τοῦτον', f: 'ταύτην', n: 'τοῦτο' }, pl: { m: 'τούτους', f: 'ταύτας',  n: 'ταῦτα'  } },
    },
  },
  {
    id: 'ekeinos',
    name: 'ἐκεῖνος — Far Demonstrative (that)',
    kind: 'demonstrative',
    forms: {
      nom: { sg: { m: 'ἐκεῖνος', f: 'ἐκείνη',  n: 'ἐκεῖνο'  }, pl: { m: 'ἐκεῖνοι', f: 'ἐκεῖναι', n: 'ἐκεῖνα'  } },
      gen: { sg: { m: 'ἐκείνου', f: 'ἐκείνης', n: 'ἐκείνου' }, pl: { m: 'ἐκείνων', f: 'ἐκείνων', n: 'ἐκείνων' } },
      dat: { sg: { m: 'ἐκείνῳ',  f: 'ἐκείνῃ',  n: 'ἐκείνῳ'  }, pl: { m: 'ἐκείνοις', f: 'ἐκείναις', n: 'ἐκείνοις' } },
      acc: { sg: { m: 'ἐκεῖνον', f: 'ἐκείνην', n: 'ἐκεῖνο'  }, pl: { m: 'ἐκείνους', f: 'ἐκείνας', n: 'ἐκεῖνα'  } },
    },
  },
  {
    id: 'hos',
    name: 'ὅς — Relative Pronoun (who, which, that)',
    kind: 'relative',
    forms: {
      nom: { sg: { m: 'ὅς', f: 'ἥ',  n: 'ὅ'  }, pl: { m: 'οἵ', f: 'αἵ', n: 'ἅ'  } },
      gen: { sg: { m: 'οὗ', f: 'ἧς', n: 'οὗ' }, pl: { m: 'ὧν', f: 'ὧν', n: 'ὧν' } },
      dat: { sg: { m: 'ᾧ',  f: 'ᾗ',  n: 'ᾧ'  }, pl: { m: 'οἷς', f: 'αἷς', n: 'οἷς' } },
      acc: { sg: { m: 'ὅν', f: 'ἥν', n: 'ὅ'  }, pl: { m: 'οὕς', f: 'ἅς', n: 'ἅ'  } },
    },
  },
  {
    id: 'tis',
    name: 'τίς / τις — Interrogative / Indefinite',
    kind: 'interrogative',
    forms: {
      nom: { sg: { m: 'τίς / τις',  f: 'τίς / τις',  n: 'τί / τι'    }, pl: { m: 'τίνες / τινές',  f: 'τίνες / τινές',  n: 'τίνα / τινά'  } },
      gen: { sg: { m: 'τίνος / τινός', f: 'τίνος / τινός', n: 'τίνος / τινός' }, pl: { m: 'τίνων / τινῶν', f: 'τίνων / τινῶν', n: 'τίνων / τινῶν' } },
      dat: { sg: { m: 'τίνι / τινί',   f: 'τίνι / τινί',   n: 'τίνι / τινί'   }, pl: { m: 'τίσι(ν)',       f: 'τίσι(ν)',       n: 'τίσι(ν)'       } },
      acc: { sg: { m: 'τίνα / τινά',   f: 'τίνα / τινά',   n: 'τί / τι'       }, pl: { m: 'τίνας / τινάς', f: 'τίνας / τινάς', n: 'τίνα / τινά'   } },
    },
  },
];

// ---------------------------------------------------------------------------
// Prepositions
// ---------------------------------------------------------------------------

export const prepositions: PrepEntry[] = [
  // Genitive only
  { greek: 'ἀντί',   cases: ['gen'],         glosses: { gen: 'instead of, in place of' } },
  { greek: 'ἀπό',    cases: ['gen'],         glosses: { gen: 'from, away from' } },
  { greek: 'ἐκ / ἐξ', cases: ['gen'],       glosses: { gen: 'from, out of' } },
  { greek: 'πρό',    cases: ['gen'],         glosses: { gen: 'before, in front of' } },
  // Dative only
  { greek: 'ἐν',     cases: ['dat'],         glosses: { dat: 'in, by, among, with' } },
  { greek: 'σύν',    cases: ['dat'],         glosses: { dat: 'with, together with' } },
  // Accusative only
  { greek: 'ἀνά',    cases: ['acc'],         glosses: { acc: 'up, each, in turn' } },
  { greek: 'εἰς',    cases: ['acc'],         glosses: { acc: 'into, to, for, in order to' } },
  // Genitive or accusative
  { greek: 'διά',    cases: ['gen', 'acc'],  glosses: { gen: 'through', acc: 'because of, on account of' } },
  { greek: 'κατά',   cases: ['gen', 'acc'],  glosses: { gen: 'against, down from', acc: 'according to, throughout, during' } },
  { greek: 'μετά',   cases: ['gen', 'acc'],  glosses: { gen: 'with', acc: 'after, behind' } },
  { greek: 'περί',   cases: ['gen', 'acc'],  glosses: { gen: 'concerning, about', acc: 'around, about' } },
  { greek: 'ὑπέρ',   cases: ['gen', 'acc'],  glosses: { gen: 'on behalf of, for', acc: 'above, over, more than' } },
  { greek: 'ὑπό',    cases: ['gen', 'acc'],  glosses: { gen: 'by (agent)', acc: 'under' } },
  // Genitive, dative, or accusative
  { greek: 'ἐπί',    cases: ['gen', 'dat', 'acc'], glosses: { gen: 'on, over, at the time of', dat: 'on the basis of, at', acc: 'on, to, against' } },
  { greek: 'παρά',   cases: ['gen', 'dat', 'acc'], glosses: { gen: 'from beside, from', dat: 'beside, with, in the presence of', acc: 'alongside, contrary to' } },
  { greek: 'πρός',   cases: ['gen', 'dat', 'acc'], glosses: { gen: 'for the benefit of', dat: 'near, at', acc: 'to, toward, with' } },
];

// ---------------------------------------------------------------------------
// Accent rules
// ---------------------------------------------------------------------------

export const accentSections: AccentSection[] = [
  {
    title: 'The Three Accents',
    rules: [
      'Acute (ά) — can stand on any of the last three syllables (antepenult, penult, or ultima).',
      'Circumflex (ᾶ) — can stand only on the last two syllables (penult or ultima), and only on a long vowel or diphthong.',
      'Grave (ὰ) — replaces an acute on the ultima when another word follows immediately in the sentence.',
    ],
  },
  {
    title: 'Syllable Terminology',
    rules: [
      'Ultima — the last syllable.',
      'Penult — the second-to-last syllable.',
      'Antepenult — the third-to-last syllable.',
      'A syllable is long if it contains a long vowel (η, ω) or a diphthong.',
    ],
  },
  {
    title: 'Recessive Accent (Verbs)',
    rules: [
      'Finite verb forms take a recessive accent — it moves as far toward the beginning of the word as the rules allow.',
      'If the ultima is short, the accent falls on the antepenult (acute): λύ-ο-μεν.',
      'If the ultima is long, the accent falls on the penult (acute): λυ-ό-με-θα.',
    ],
  },
  {
    title: 'Persistent Accent (Nouns)',
    rules: [
      'Nouns try to keep the accent on the same syllable as the lexical form (nominative singular).',
      'The accent shifts only when forced by the accent rules (e.g., long ultima forces antepenult accent back to penult).',
      'Genitive and dative plurals of 1st and 2nd declension nouns always receive a circumflex on the ultima: ἡμερῶν, λόγων.',
    ],
  },
  {
    title: 'Penult Rule',
    rules: [
      'If the penult is long and the ultima is short, the penult takes a circumflex: δοῦλος.',
      'If the penult is long and the ultima is long, the penult takes an acute: δούλου.',
      'If the penult is short, it can only take an acute.',
    ],
  },
  {
    title: 'Proclitics & Enclitics',
    rules: [
      'Proclitics are words that attach to the following word and normally have no accent: ὁ, ἡ, οἱ, αἱ, εἰ, ὡς, εἰς, ἐκ/ἐξ, ἐν, οὐ/οὐκ/οὐχ.',
      'Enclitics attach to the preceding word: μου, μοι, με, σου, σοι, σε, τις, τι, εἰμί (most forms), φημί (some forms).',
      'When an enclitic follows an oxytone (acute on ultima), the grave is replaced by the acute: καρπός τις → καρπός τις (accent retained).',
    ],
  },
  {
    title: 'Common Accent Shifts to Know',
    rules: [
      'Oxytone nouns (acute on ultima) change to grave before another word: λόγος is λογός in isolation but λογὸς before the next word.',
      '1st declension genitive plural always has circumflex on ultima: γλωσσῶν, ἡμερῶν.',
      'Monosyllabic 3rd declension nouns accent the ultima in genitive and dative: σαρκός, σαρκί.',
    ],
  },
];
