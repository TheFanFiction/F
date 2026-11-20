// ============================================================
//  Efeito Disney — ajustes aprovados (2026-11-20)
//
//  Decisões finais tomadas no laboratório, aplicadas sobre os perfis
//  de lalai-profiles.js: tonalidade, timbres alternativos e ganho por
//  camada (multiplicador; 0 desliga a camada).
//  Perigo: piano original na melodia (pedido posterior à avaliação).
// ============================================================
(function (global) {
  'use strict';

  global.LALAI_APROVADO = {
    mundoreal: {
      transposicao: 1,
      timbres: { mel: 'piano_eletrico' },
      ganhos: { mel: 0.4, cel: 0.75, pad: 1.1, bas: 1.25, str: 1.25, con: 1.15, pul: 1.15 }
    },
    outromundo: {
      transposicao: 0,
      timbres: {},
      ganhos: { mel: 0.7, cel: 1.15, pad: 0.6, bas: 1.3, con: 0.1, sub: 1.7 }
    },
    estranheza: {
      transposicao: 2,
      timbres: { mel: 'piano_contido' },
      ganhos: { mel: 0.4, pad: 0.65, bas: 1.45, str: 1.3, ped: 0.15 }
    },
    suspense: {
      transposicao: -3,
      timbres: {},
      ganhos: { mel: 0.05, pad: 1.4, con: 0.8, pul: 1.6, ped: 0, sub: 2 }
    },
    perigo: {
      transposicao: 0,
      timbres: {},
      ganhos: { mel: 0.15, str: 0.65, con: 0, pul: 2, sub: 2, per: 1.75 }
    },
    tristeza: {
      transposicao: -3,
      timbres: { mel: 'piano_eletrico', con: 'cello' },
      ganhos: { mel: 0.3, pad: 1.2, str: 1.05, con: 0.45, gtr: 1.2 }
    },
    esperanca: {
      transposicao: 3,
      timbres: { mel: 'piano', str: 'cello' },
      ganhos: { cel: 0.15, pad: 0.2, bas: 1.45, str: 0.55, con: 1.2, pul: 0.5, ped: 1.15 }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
