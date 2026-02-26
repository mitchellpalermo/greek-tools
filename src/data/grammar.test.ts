import { describe, it, expect } from 'vitest';
import {
  CASES, NUMBERS, GENDERS, PERSONS,
  CASE_LABELS, CASE_DESCRIPTIONS,
  NUM_LABELS, GENDER_LABELS, PERSON_LABELS, PERSON_FULL_LABELS,
  nounParadigms,
  adjParadigms,
  verbParadigms,
  infinitiveForms,
  participleRows,
  personalPronouns12,
  genderedPronouns,
  prepositions,
  accentSections,
} from './grammar';

// ─── grammatical constants ─────────────────────────────────────────────────

describe('grammatical constants', () => {
  it('CASES has all five Greek cases', () => {
    expect(CASES).toEqual(['nom', 'gen', 'dat', 'acc', 'voc']);
  });

  it('NUMBERS has singular and plural', () => {
    expect(NUMBERS).toEqual(['sg', 'pl']);
  });

  it('GENDERS has masculine, feminine, and neuter', () => {
    expect(GENDERS).toEqual(['m', 'f', 'n']);
  });

  it('PERSONS has all six person-number combinations', () => {
    expect(PERSONS).toHaveLength(6);
    expect(PERSONS).toContain('1sg');
    expect(PERSONS).toContain('3pl');
  });
});

// ─── label maps ────────────────────────────────────────────────────────────

describe('label maps', () => {
  it('CASE_LABELS has a label for every case', () => {
    CASES.forEach((c) => {
      expect(CASE_LABELS[c]).toBeTruthy();
    });
  });

  it('CASE_DESCRIPTIONS has a description for every case', () => {
    CASES.forEach((c) => {
      expect(CASE_DESCRIPTIONS[c]).toBeTruthy();
    });
  });

  it('NUM_LABELS has a label for each number', () => {
    NUMBERS.forEach((n) => {
      expect(NUM_LABELS[n]).toBeTruthy();
    });
  });

  it('GENDER_LABELS has a label for each gender', () => {
    GENDERS.forEach((g) => {
      expect(GENDER_LABELS[g]).toBeTruthy();
    });
  });

  it('PERSON_LABELS has a label for each person-number', () => {
    PERSONS.forEach((p) => {
      expect(PERSON_LABELS[p]).toBeTruthy();
    });
  });

  it('PERSON_FULL_LABELS has a full label for each person-number', () => {
    PERSONS.forEach((p) => {
      expect(PERSON_FULL_LABELS[p]).toBeTruthy();
    });
  });
});

// ─── noun paradigms ────────────────────────────────────────────────────────

describe('nounParadigms', () => {
  it('is a non-empty array', () => {
    expect(nounParadigms.length).toBeGreaterThan(0);
  });

  it('every paradigm has a unique id', () => {
    const ids = nounParadigms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every paradigm has a name, declension, and gender', () => {
    nounParadigms.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(['1st', '2nd', '3rd']).toContain(p.declension);
      expect(['masculine', 'feminine', 'neuter']).toContain(p.gender);
    });
  });

  it('every paradigm has forms for all cases and numbers', () => {
    nounParadigms.forEach((p) => {
      CASES.forEach((c) => {
        NUMBERS.forEach((n) => {
          expect(p.forms[c][n]).toBeDefined();
          expect(p.forms[c][n].full).toBeTruthy();
        });
      });
    });
  });
});

// ─── adjective paradigms ───────────────────────────────────────────────────

describe('adjParadigms', () => {
  it('is a non-empty array', () => {
    expect(adjParadigms.length).toBeGreaterThan(0);
  });

  it('every paradigm has a unique id', () => {
    const ids = adjParadigms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every paradigm has all case/number/gender combinations', () => {
    adjParadigms.forEach((p) => {
      CASES.forEach((c) => {
        NUMBERS.forEach((n) => {
          GENDERS.forEach((g) => {
            expect(typeof p.forms[c][n][g]).toBe('string');
          });
        });
      });
    });
  });
});

// ─── verb paradigms ────────────────────────────────────────────────────────

describe('verbParadigms', () => {
  it('is a non-empty array', () => {
    expect(verbParadigms.length).toBeGreaterThan(0);
  });

  it('every paradigm has a unique id', () => {
    const ids = verbParadigms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every paradigm has a label and group', () => {
    verbParadigms.forEach((p) => {
      expect(p.label).toBeTruthy();
      expect(['indicative', 'subjunctive', 'imperative']).toContain(p.group);
    });
  });

  it('indicative paradigms have all six person-number forms', () => {
    const indicatives = verbParadigms.filter((p) => p.group === 'indicative');
    indicatives.forEach((p) => {
      PERSONS.forEach((person) => {
        expect(p.forms[person]).toBeTruthy();
      });
    });
  });
});

// ─── infinitives and participles ───────────────────────────────────────────

describe('infinitiveForms', () => {
  it('is a non-empty array with label and form fields', () => {
    expect(infinitiveForms.length).toBeGreaterThan(0);
    infinitiveForms.forEach((inf) => {
      expect(inf.label).toBeTruthy();
      expect(inf.form).toBeTruthy();
    });
  });
});

describe('participleRows', () => {
  it('is a non-empty array with m/f/n fields', () => {
    expect(participleRows.length).toBeGreaterThan(0);
    participleRows.forEach((row) => {
      expect(row.label).toBeTruthy();
      expect(typeof row.m).toBe('string');
      expect(typeof row.f).toBe('string');
      expect(typeof row.n).toBe('string');
    });
  });
});

// ─── pronouns ──────────────────────────────────────────────────────────────

describe('personalPronouns12', () => {
  it('includes first and second person pronouns', () => {
    const kinds = personalPronouns12.map((p) => p.kind);
    expect(kinds).toContain('1st');
    expect(kinds).toContain('2nd');
  });

  it('every pronoun has a name and id', () => {
    personalPronouns12.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
    });
  });
});

describe('genderedPronouns', () => {
  it('is a non-empty array', () => {
    expect(genderedPronouns.length).toBeGreaterThan(0);
  });

  it('every pronoun has an id, name, and kind', () => {
    genderedPronouns.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(['3rd-personal', 'demonstrative', 'relative', 'interrogative']).toContain(p.kind);
    });
  });
});

// ─── prepositions ──────────────────────────────────────────────────────────

describe('prepositions', () => {
  it('is a non-empty array', () => {
    expect(prepositions.length).toBeGreaterThan(0);
  });

  it('every entry has a greek form and at least one case', () => {
    prepositions.forEach((prep) => {
      expect(prep.greek).toBeTruthy();
      expect(prep.cases.length).toBeGreaterThan(0);
    });
  });

  it('every case listed has a corresponding gloss', () => {
    prepositions.forEach((prep) => {
      prep.cases.forEach((c) => {
        expect(prep.glosses[c]).toBeTruthy();
      });
    });
  });
});

// ─── accent sections ───────────────────────────────────────────────────────

describe('accentSections', () => {
  it('is a non-empty array', () => {
    expect(accentSections.length).toBeGreaterThan(0);
  });

  it('every section has a title and at least one rule', () => {
    accentSections.forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.rules.length).toBeGreaterThan(0);
    });
  });
});
