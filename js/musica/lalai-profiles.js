// ============================================================
//  Efeito Disney — perfis de atmosfera da Melodia da Lalai
//
//  Dados e compilação puros (sem AudioContext, sem DOM): o jogo pode
//  usar este arquivo sem depender do laboratório.
//
//  Cada perfil:
//   - declara TODAS as camadas conhecidas (ativas e inativas);
//   - filtrar(nota, info)    → remove notas da matriz (cópia);
//   - transformar(nota, info) → altera notas da matriz (cópia);
//   - gerar(T)               → cria linhas novas (contracantos, graves…).
//   - transposicaoPadrao: semitons aprovados para a atmosfera (melodia e
//     acordes juntos, intervalos preservados). A Matriz é fixa em 0.
//   - dinamica: multiplicador de intensidade por seção (opcional).
//  Versões anteriores ficam como <id>_v1, para comparação.
// ============================================================
(function (global) {
  'use strict';

  var D = global.LalaiDados;
  if (!D) throw new Error('lalai-profiles.js requer lalai-data.js');

  var CAMADAS = [
    { id: 'mel', nome: 'Melodia',           origem: 'matriz' },
    { id: 'cel', nome: 'Brilho agudo',      origem: 'matriz' },
    { id: 'pad', nome: 'Pad harmônico',     origem: 'matriz' },
    { id: 'bas', nome: 'Baixo',             origem: 'matriz' },
    { id: 'str', nome: 'Linha sustentada',  origem: 'matriz' },
    { id: 'kik', nome: 'Bumbo sintético',   origem: 'matriz' },
    { id: 'hh',  nome: 'Chimbal sintético', origem: 'matriz' },
    { id: 'snr', nome: 'Caixa sintética',   origem: 'matriz' },
    { id: 'con', nome: 'Contracanto',       origem: 'perfil' },
    { id: 'pul', nome: 'Pulso rítmico',     origem: 'perfil' },
    { id: 'ped', nome: 'Nota pedal aguda',  origem: 'perfil' },
    { id: 'sub', nome: 'Grave sustentado',  origem: 'perfil' },
    { id: 'gtr', nome: 'Violão',            origem: 'perfil' },
    { id: 'per', nome: 'Percussão',         origem: 'perfil' }
  ];
  var PERCUSSAO_MATRIZ = ['kik', 'hh', 'snr'];
  var SECOES_A = ['A', 'A2', 'RA', 'FA'];

  // ------------------------------------------------------------
  //  Ferramentas de composição (T)
  // ------------------------------------------------------------
  function arred(x) { return Math.round(x * 1000) / 1000; }
  function cents(f, c) { return f * Math.pow(2, c / 1200); }
  function quinta(f) { return f * Math.pow(2, 7 / 12); }
  function copiar(n) { var c = {}; for (var k in n) c[k] = n[k]; return c; }

  function nt(b, f, d, v, l, extra) {
    var n = { b: arred(b), f: f, d: d, v: v, l: l };
    if (extra) for (var k in extra) n[k] = extra[k];
    return n;
  }

  function noRegistro(cl, minHz) {
    var f = D.tom(cl, 0);
    while (f < minHz - 0.01) f *= 2;
    return f;
  }

  function secao(id) {
    for (var i = 0; i < D.SECOES.length; i++) if (D.SECOES[i].id === id) return D.SECOES[i];
    throw new Error('Seção desconhecida: ' + id);
  }

  function porBatida(ini, fim, passo, fn) {
    var out = [];
    var n = Math.round((fim - ini) / passo);
    for (var i = 0; i < n; i++) {
      var b = arred(ini + i * passo);
      var r = fn(b, D.acordeEm(b), D.secaoEm(b));
      if (r) out = out.concat(r);
    }
    return out;
  }

  function acordesNas(ids) {
    return D.HARMONIA.filter(function (a) { return ids.indexOf(D.secaoEm(a.ini).id) >= 0; });
  }

  function ordenar(notas) {
    return notas.map(function (n, i) { return [n, i]; })
      .sort(function (a, b) { return (a[0].b - b[0].b) || (a[1] - b[1]); })
      .map(function (p) { return p[0]; });
  }

  function notasMatriz(camada) {
    return ordenar(D.copiarNotas()).filter(function (n) { return n.l === camada; });
  }

  function novoAcorde(b) { return D.acordeEm(b - 0.5) !== D.acordeEm(b); }

  var INICIOS_MEL = notasMatriz('mel').map(function (n) { return n.b; });
  function proximaMel(b) {
    for (var i = 0; i < INICIOS_MEL.length; i++) if (INICIOS_MEL[i] > b + 1e-6) return INICIOS_MEL[i];
    return D.DURACAO;
  }
  function terceira(ac) { return ac.terca != null ? ac.terca : ac.quarta; }

  var T = {
    D: D, hz: D.hz, nt: nt, noRegistro: noRegistro, quinta: quinta, cents: cents,
    secao: secao, porBatida: porBatida, acordesNas: acordesNas,
    notasMatriz: notasMatriz, novoAcorde: novoAcorde, terceira: terceira
  };

  function on(timbre, ganho, funcao, alternativas) {
    return { ativo: true, timbre: timbre, ganho: ganho, funcao: funcao, alternativas: alternativas || null };
  }
  function off(motivo) { return { ativo: false, timbre: null, ganho: 0, funcao: motivo }; }

  var PERC_MATRIZ = 'Percussão sintética da matriz — fora do tema';
  var hz = D.hz;

  // ------------------------------------------------------------
  //  PERFIS
  // ------------------------------------------------------------
  var PERFIS = {

    // ==========================================================
    matriz: {
      nome: 'Matriz (original)',
      cor: '#c6a16b',
      emocao: 'A composição aprovada, intocada.',
      ideia: 'Toca LALAI_DATA exatamente como está: piano, piano agudo, pad de cello, ' +
             'cello e baixo acústico. É a régua para comparar todas as transformações.',
      andamento: { base: 82 },
      transposicaoPadrao: 0,
      fixa: true,
      trechoLoop: { ini: 0, fim: 96 },
      camadas: {
        mel: on('piano', 1, 'Melodia original'),
        cel: on('piano_brilho', 1, 'Toques agudos originais'),
        pad: on('pad_cello', 1, 'Pad harmônico contínuo'),
        bas: on('baixo', 1, 'Fundamentais sustentadas'),
        str: on('cello', 1, 'Linha sustentada do cello'),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: off('Não existe na matriz'),
        pul: off('Não existe na matriz'),
        ped: off('Não existe na matriz'),
        sub: off('Não existe na matriz'),
        gtr: off('Violão removido do tema principal'),
        per: off('Sem percussão no tema principal')
      }
    },

    // ==========================================================
    mundoreal: {
      nome: 'Mundo Real',
      cor: '#e8b86a',
      emocao: 'Alegre, acolhedor, encantador e curioso.',
      referencia: 'My Castle Town (atmosfera: passeio tranquilo por um lugar querido)',
      ideia: 'Andamento um pouco mais vivo (92). A seção A continua uma apresentação calma; ' +
             "a partir de A' entra um passo \"de passeio\": o baixo caminha (fundamental–quinta–oitava) " +
             'e um pizzicato responde nos contratempos. A celesta de verdade substitui o piano agudo, ' +
             'e uma flauta faz pequenas perguntas nas pausas da melodia. As cordas em conjunto ' +
             'clareiam a linha que antes era do cello solo.',
      andamento: { base: 92 },
      transposicaoPadrao: 1,
      camadas: {
        mel: on('piano', 1.0, 'Protagonista: a voz da Lalai, intocada', ['piano', 'piano_luz', 'piano_eletrico']),
        cel: on('celesta', 1.0, 'Encanto: celesta real no lugar do piano agudo'),
        pad: on('pad_cello', 0.75, 'Aconchego: pad contínuo mais leve, abrindo espaço para o pulso'),
        bas: on('baixo', 1.0, "Passos: sustentado em A e na Coda; baixo caminhante de A' até A final"),
        str: on('cordas', 0.8, 'Calor luminoso: conjunto de cordas no lugar do cello solo'),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('flauta', 1.0, 'Curiosidade: respostas curtas da flauta nas pausas da melodia'),
        pul: on('pizz', 1.0, 'Leveza saltitante: pizzicato nos contratempos'),
        ped: off('Sem nota pedal — a harmonia original basta'),
        sub: off('Sem grave extra — o baixo caminhante já sustenta'),
        gtr: off('Violão fora do tema principal'),
        per: off('O pulso vem do baixo e do pizzicato, sem bateria')
      },
      filtrar: function (n, i) {
        if (n.l === 'bas' && i.secao !== 'A' && i.secao !== 'CODA') return false;
        return true;
      },
      gerar: function (T) {
        var out = [];
        // Baixo caminhante: fundamental na troca de acorde, depois quinta / oitava / quinta
        out = out.concat(T.porBatida(16, 88, 1, function (b, ac, sec) {
          if (sec.id === 'B2' && b % 2 !== 0) return null;
          var r = T.noRegistro(ac.raiz, 77);
          var passo = Math.round(b) % 4;
          var f = (T.novoAcorde(b) || passo === 0) ? r : (passo === 2 ? r * 2 : T.quinta(r));
          return T.nt(b, f, 0.8, 0.075, 'bas');
        }));
        // Pizzicato nos contratempos: terça + quinta do acorde
        out = out.concat(T.porBatida(16, 88, 1, function (b, ac, sec) {
          var esparso = (sec.id === 'A2' || sec.id === 'B2');
          if (esparso && b % 2 === 0) return null;
          var t = T.noRegistro(T.terceira(ac), 220);
          var q = T.noRegistro(ac.quinta, t + 1);
          return [T.nt(b + 0.5, t, 0.35, 0.03, 'pul'), T.nt(b + 0.5, q, 0.35, 0.026, 'pul')];
        }));
        // Flauta: pergunta (arpejo que sobe e fica em aberto) e resposta (desce e pousa)
        SECOES_A.forEach(function (id) {
          var o = T.secao(id).ini;
          out.push(T.nt(o + 6.2, hz('D5'), 0.4, 0.05, 'con'),
                   T.nt(o + 6.6, hz('F5'), 0.4, 0.05, 'con'),
                   T.nt(o + 7.0, hz('A5'), 0.8, 0.055, 'con'));
          if (id !== 'A') {
            out.push(T.nt(o + 14.4, hz('C6'), 0.35, 0.045, 'con'),
                     T.nt(o + 14.75, hz('A5'), 0.35, 0.045, 'con'),
                     T.nt(o + 15.1, hz('F5'), 0.8, 0.05, 'con'));
          }
        });
        return out;
      }
    },

    // ==========================================================
    outromundo: {
      nome: 'Outro Mundo',
      cor: '#9b7fd4',
      emocao: 'Misterioso e acolhedor: familiar, mas não exatamente igual.',
      ideia: 'Menos magia, mais mistério. A melodia passa para um piano elétrico macio (familiar, ' +
             'com um brilho estranho), o pad quente do cello volta e um Si♭ grave sustentado dá chão ' +
             'a tudo, criando uma tensão leve só quando o acorde se afasta dele. Vozes fechadas (ooh), ' +
             'quase sussurradas, substituem o coro aberto. A caixinha de música vira só uma lembrança: ' +
             'ecoa apenas a primeira frase de cada A, bem baixa. Saíram o Mi lídio constante e o eco desafinado.',
      andamento: { base: 78 },
      transposicaoPadrao: 0,
      camadas: {
        mel: on('piano_eletrico', 0.9, 'Piano elétrico macio: familiar e acolhedor, com um brilho estranho',
                ['piano_eletrico', 'piano_suave', 'piano', 'caixinha']),
        cel: on('celesta', 0.45, 'Brilho distante e levemente desafinado (+12 cents)'),
        pad: on('pad_cello', 0.85, 'Aconchego: o pad quente original'),
        bas: on('baixo', 0.6, 'Chão presente, porém distante'),
        str: on('coro_ooh', 0.55, 'Vozes fechadas, quase sussurradas: mistério', ['coro_ooh', 'coro', 'cordas']),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('caixinha', 1.0, 'Lembrança: a caixinha ecoa só a primeira frase de cada A'),
        pul: off('Sem pulso — o tempo parece suspenso'),
        ped: off('Mi lídio retirado: deixava tudo mágico demais'),
        sub: on('contrabaixo', 0.8, 'Si♭ grave sustentado: acolhe, e cria mistério quando o acorde se afasta'),
        gtr: off('Violão fora deste perfil'),
        per: off('Sem percussão')
      },
      transformar: function (n) {
        if (n.l === 'cel') n.f = cents(n.f, 12);
        if (n.l === 'mel') n.d = n.d * 1.1;
        return n;
      },
      gerar: function (T) {
        var out = [];
        var mel = T.notasMatriz('mel');
        SECOES_A.forEach(function (id) {
          var o = T.secao(id).ini;
          mel.forEach(function (n) {
            if (n.b >= o && n.b < o + 7.93) out.push(T.nt(n.b + 0.5, n.f * 2, n.d, n.v * 0.15, 'con'));
          });
        });
        T.D.SECOES.forEach(function (s) {
          out.push(T.nt(s.ini, hz('Bb1'), s.fim - s.ini + 0.5, 0.05, 'sub', { ataque: 1.2 }));
        });
        return out;
      }
    },

    // ==========================================================
    suspense: {
      nome: 'Suspense',
      cor: '#6b7fa8',
      emocao: 'Tensão grave e silenciosa; os elementos alegres recuam.',
      ideia: 'Tímpanos retirados. A tensão vem de elementos sutis: o Fá grave (dominante) continua parado ' +
             'e nunca resolve, agora com entrada lenta; o pad fica só com fundamental e quinta; o cello grave ' +
             'desce cromaticamente. No agudo, cordas discretas seguram um Dó fino e longo que mal se ouve. ' +
             'O piano fica mais lento, abafado e suave, como ouvido de longe. Uma nota grave do piano a cada ' +
             '8 tempos marca a passagem do tempo sem virar batida.',
      andamento: { base: 60 },
      transposicaoPadrao: -1,
      camadas: {
        mel: on('piano_contido', 0.8, 'Piano mais lento, abafado e suave, como ouvido de longe',
                ['piano_contido', 'piano_suave', 'piano']),
        cel: off('Nenhum brilho'),
        pad: on('pad_cello', 0.5, 'Harmonia esvaziada: só fundamental e quinta'),
        bas: off('Substituído pelo pedal de dominante'),
        str: off('As cordas calorosas da matriz saem'),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('cello', 0.7, 'Descida cromática no grave: algo se aproxima'),
        pul: on('piano_contido', 1.0, 'Experimental: uma nota grave do piano a cada 8 tempos, distante'),
        ped: on('cordas', 1.0, 'Cordas discretas: um Dó agudo, fino e longo, que mal se ouve'),
        sub: on('contrabaixo', 0.9, 'Pedal de Fá grave (dominante) que nunca resolve, com entrada lenta'),
        gtr: off('Violão fora deste perfil'),
        per: off('Tímpanos retirados: não funcionaram')
      },
      filtrar: function (n, i) {
        if (n.l === 'pad') return i.classe === i.acorde.raiz || i.classe === i.acorde.quinta;
        return true;
      },
      transformar: function (n) {
        if (n.l === 'mel') { n.d = n.d * 0.9; n.v = n.v * 0.9; }
        return n;
      },
      gerar: function (T) {
        var out = [];
        var cromatica = [hz('D3'), hz('Db3'), hz('C3'), hz('B2')];
        T.D.SECOES.forEach(function (s) {
          var len = s.fim - s.ini;
          out.push(T.nt(s.ini, hz('F2'), len + 0.5, 0.075, 'sub', { ataque: 2 }));
          out.push(T.nt(s.ini, hz('C6'), len + 0.5, 0.012, 'ped', { ataque: 2.5 }));
          for (var k = 0; k * 4 < len; k++) out.push(T.nt(s.ini + k * 4, cromatica[k % 4], 4, 0.026, 'con'));
        });
        for (var b = 0; b < 96; b += 8) out.push(T.nt(b, hz('F1'), 4, 0.05, 'pul'));
        return out;
      }
    },

    // ==========================================================
    perigo: {
      nome: 'Perigo',
      cor: '#c0505e',
      emocao: 'Ameaça e urgência: o tema da Lalai, acelerado e sem respiro.',
      ideia: 'O piano original volta a conduzir a melodia, agora a 120 BPM e ligado: cada nota sustenta ' +
             'até a seguinte, então as pausas entre as notas quase desaparecem (os ataques continuam nos ' +
             'mesmos tempos da Matriz). O ostinato do baixo tem um vizinho cromático (fundamental, ' +
             'fundamental, meio-tom acima, fundamental), o tremolo ganha meio-tom acima da fundamental a ' +
             'partir de B, e metais graves crescem a cada troca de acorde no B, no Retorno A e no A final.',
      andamento: { base: 120 },
      transposicaoPadrao: 0,
      camadas: {
        mel: on('piano', 1.0, 'Piano original, acelerado e ligado: urgência sem perder a identidade',
                ['piano', 'cravo', 'piano_fm', 'piano_desafinado']),
        cel: off('Nenhum brilho'),
        pad: off('Substituído pelo tremolo'),
        bas: off('Substituído pelo ostinato'),
        str: on('tremolo', 1.0, 'Agitação: tremolo em fundamental + quinta, com meio-tom de ameaça a partir de B'),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('piano', 0.8, 'Peso: piano grave dobrando a melodia uma oitava abaixo', ['piano', 'cordas', 'cravo']),
        pul: on('baixo', 1.0, 'Ostinato com vizinho cromático: movimento inquieto'),
        ped: off('Sem nota aguda'),
        sub: on('metais', 1.0, 'Metais graves que crescem a cada troca de acorde (B, Retorno A, A final)'),
        gtr: off('Violão fora deste perfil'),
        per: on('timpano', 1.0, 'Experimental: tímpanos nos tempos fortes e rufos (aguarda aprovação)')
      },
      filtrar: function (n) {
        return n.l !== 'str';
      },
      transformar: function (n) {
        if (n.l === 'mel') n.d = Math.min(3, Math.max(n.d, (proximaMel(n.b) - n.b) * 0.97));
        return n;
      },
      gerar: function (T) {
        var out = T.notasMatriz('mel').map(function (n) {
          return T.nt(n.b, n.f / 2, Math.max(0.15, n.d * 0.5), n.v * 0.4, 'con');
        });
        T.D.HARMONIA.forEach(function (a) {
          var r = T.noRegistro(a.raiz, 130);
          var dur = a.fim - a.ini;
          var sec = T.D.secaoEm(a.ini).id;
          out.push(T.nt(a.ini, r, dur, 0.03, 'str'), T.nt(a.ini, T.quinta(r), dur, 0.026, 'str'));
          if (sec !== 'A' && sec !== 'A2') {
            out.push(T.nt(a.ini, T.noRegistro((a.raiz + 1) % 12, 260), dur, 0.018, 'str'));
          }
          if (sec === 'B' || sec === 'RA' || sec === 'FA') {
            var g = T.noRegistro(a.raiz, 70);
            var atk = Math.min(1.2, dur * 0.6);
            out.push(T.nt(a.ini, g, dur, 0.04, 'sub', { ataque: atk }),
                     T.nt(a.ini, T.quinta(g), dur, 0.03, 'sub', { ataque: atk }));
          }
        });
        var vizinho = Math.pow(2, 1 / 12);
        out = out.concat(T.porBatida(0, 96, 0.5, function (b, ac) {
          var r = T.noRegistro(ac.raiz, 55);
          var f = Math.round(b * 2) % 4 === 2 ? r * vizinho : r;
          return T.nt(b, f, 0.4, b % 1 === 0 ? 0.085 : 0.055, 'pul');
        }));
        out = out.concat(T.porBatida(0, 96, 2, function (b, ac) {
          return T.nt(b, T.noRegistro(ac.raiz, 85), 1, 0.055, 'per');
        }));
        T.D.SECOES.forEach(function (s) {
          [0, 0.25, 0.5, 0.75].forEach(function (x, k) {
            out.push(T.nt(s.fim - 1 + x, hz('F2'), 0.5, 0.03 + k * 0.01, 'per'));
          });
        });
        return out;
      }
    },

    // ==========================================================
    tristeza: {
      nome: 'Tristeza',
      cor: '#6f8fb0',
      emocao: 'Íntima, delicada, introspectiva: algo que se perdeu.',
      referencia: 'Without My Strings (instrumentação íntima e despida)',
      ideia: 'Piano abafado e suave, ligado, perdendo força no fim de cada frase; o andamento desacelera ' +
             'até a Coda (60 → 52). O arranjo conta uma perda: A é só piano; o violão (mais esparso, uma nota ' +
             "a cada dois tempos) e o cello entram em A'; no Retorno A, onde a matriz tem seu clímax, o clímax " +
             "não chega: a dinâmica cai. No B' e na Coda o piano fica sozinho de novo. Depois da primeira frase, " +
             'um corne inglês repete o começo da melodia (Si♭–Dó–Ré) e para no meio, como uma lembrança incompleta.',
      andamento: { base: 60, porSecao: { A: 60, A2: 60, B: 62, RA: 60, B2: 56, FA: 58, CODA: 52 } },
      transposicaoPadrao: -2,
      dinamica: { A: 0.85, A2: 0.9, B: 0.9, RA: 0.7, B2: 0.7, FA: 0.8, CODA: 0.65 },
      camadas: {
        mel: on('piano_suave', 0.9, 'Piano íntimo e abafado, ligado, perdendo força no fim de cada frase',
                ['piano_suave', 'piano', 'piano_eletrico']),
        cel: off('Sem brilho'),
        pad: on('pad_cello', 0.35, 'Quase ausente: só no B e no A final'),
        bas: off('Sem grave próprio — o violão sustenta o baixo'),
        str: on('cello', 1.0, "A voz da melancolia em A', B, Retorno A e A final; cala no B'"),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('corne_ingles', 1.0, 'Eco incompleto: o corne inglês começa a melodia e para no meio',
                ['corne_ingles', 'cello', 'flauta']),
        pul: off('Sem pulso'),
        ped: off('Sem nota aguda'),
        sub: off('Sem grave extra'),
        gtr: on('violao', 0.85, 'Experimental: violão de nylon esparso, só onde há acompanhamento'),
        per: off('Sem percussão')
      },
      filtrar: function (n, i) {
        if (n.l === 'pad') return i.secao === 'B' || i.secao === 'FA';
        if (n.l === 'str') return i.secao !== 'B2';
        return true;
      },
      transformar: function (n, i) {
        if (n.l === 'mel') {
          n.d = n.d * 1.3;
          n.v = n.v * (1 - 0.35 * i.posFrase);
        }
        return n;
      },
      gerar: function (T) {
        var acompanhadas = ['A2', 'B', 'RA', 'FA'];
        var out = T.porBatida(16, 88, 2, function (b, ac, sec) {
          if (acompanhadas.indexOf(sec.id) < 0) return null;
          var raiz = T.noRegistro(ac.raiz, 82);
          var f = (T.novoAcorde(b) || Math.round(b / 2) % 2 === 0) ? raiz : T.noRegistro(T.terceira(ac), 196);
          return T.nt(b, f, 2.5, f === raiz ? 0.045 : 0.035, 'gtr');
        });
        ['A2', 'RA', 'FA'].forEach(function (id) {
          var o = T.secao(id).ini;
          out.push(T.nt(o + 6.2, hz('Bb4'), 0.45, 0.045, 'con'),
                   T.nt(o + 6.7, hz('C5'), 0.45, 0.04, 'con'),
                   T.nt(o + 7.2, hz('D5'), 0.9, 0.032, 'con'));
        });
        return out;
      }
    },

    // ==========================================================
    esperanca: {
      nome: 'Esperança',
      cor: '#8fbf7f',
      emocao: 'Renovação, acolhimento e superação: a música se abre.',
      ideia: 'O oposto da Tristeza: piano claro e aberto, e cada frase cresce em vez de se apagar. ' +
             'A peça inteira cresce em intensidade e andamento (76 → 86). A harmonia está completa desde o ' +
             'início, e uma nota aguda e suave das cordas traz luz já em A. Uma harpa faz arpejos que sobem ' +
             "(um por acorde em A, A' e B', em colcheias no B, no Retorno A e no A final), como um nascer do sol. " +
             "Celesta e baixo entram em A'; cordas em conjunto (mais claras que o cello solo) sustentam as " +
             'linhas, e uma trompa nas terças dos acordes traz coragem no Retorno A e no A final.',
      andamento: { base: 82, porSecao: { A: 76, A2: 78, B: 82, RA: 86, B2: 84, FA: 86, CODA: 80 } },
      transposicaoPadrao: 1,
      // O crescimento acontece uma vez; depois o ciclo fica no trecho já "conquistado".
      trechoLoop: { ini: 48, fim: 88 },
      dinamica: { A: 0.75, A2: 0.85, B: 0.95, RA: 1.1, B2: 1.0, FA: 1.15, CODA: 1.0 },
      camadas: {
        mel: on('piano_luz', 1.0, 'Piano claro e aberto: cada frase cresce em vez de se apagar',
                ['piano_luz', 'piano', 'piano_eletrico']),
        cel: on('celesta', 0.9, "Brilho a partir de A'"),
        pad: on('pad_cello', 0.9, 'Harmonia completa desde o início'),
        bas: on('baixo', 1.0, "Grave entra em A'"),
        str: on('cordas', 0.9, "Cordas em conjunto, mais claras que o cello solo, a partir de A'", ['cordas', 'cello']),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: on('trompa', 1.0, 'Superação: trompa nas terças dos acordes, no Retorno A e no A final'),
        pul: on('harpa', 1.0, 'Renovação: arpejos de harpa que sobem'),
        ped: on('cordas', 1.0, 'Luz desde o início: um Fá agudo e suave das cordas em A'),
        sub: off('Sem grave extra'),
        gtr: off('Violão fora deste perfil'),
        per: off('Sem percussão')
      },
      filtrar: function (n, i) {
        if ((n.l === 'cel' || n.l === 'bas') && i.secao === 'A') return false;
        return true;
      },
      transformar: function (n, i) {
        if (n.l === 'mel') n.v = n.v * (0.9 + 0.25 * i.posFrase);
        return n;
      },
      gerar: function (T) {
        var out = [];
        function arpejo(b, ac) {
          var r = T.noRegistro(ac.raiz, 196);
          return [r, T.noRegistro(T.terceira(ac), r), T.noRegistro(ac.quinta, r), r * 2].map(function (f, k) {
            return T.nt(b + k * 0.5, f, 1.2, 0.035, 'pul');
          });
        }
        T.D.HARMONIA.forEach(function (a) {
          var sec = T.D.secaoEm(a.ini).id;
          if (sec === 'A' || sec === 'A2' || sec === 'B2' || sec === 'CODA') out = out.concat(arpejo(a.ini, a));
        });
        out = out.concat(T.porBatida(32, 88, 2, function (b, ac, sec) {
          return sec.id === 'B2' ? null : arpejo(b, ac);
        }));
        out.push(T.nt(0, hz('F5'), 16.5, 0.015, 'ped', { ataque: 2.5 }));
        T.acordesNas(['RA', 'FA']).forEach(function (a) {
          out.push(T.nt(a.ini, T.noRegistro(T.terceira(a), 196), a.fim - a.ini, 0.035, 'con', { ataque: 0.4 }));
        });
        return out;
      }
    },

    // ==========================================================
    estranheza: {
      nome: 'Estranheza',
      cor: '#7fa59b',
      emocao: 'Algo está fora do lugar: acordes incompletos e pequenas dissonâncias.',
      ideia: 'O pad perde a terça de cada acorde: nem maior, nem menor, só um oco. ' +
             'A melodia ganha lacunas (algumas notas curtas somem) e uma nota a cada cinco ' +
             'sai 35 cents abaixo. O cello não sustenta até o fim: corta na metade. ' +
             'Em cada acorde, um sopro senoidal meio-tom acima da quinta entra atrasado, ' +
             'como algo que se aproxima devagar. A celesta desaparece.',
      andamento: { base: 76 },
      transposicaoPadrao: 0,
      camadas: {
        mel: on('piano', 0.9, 'Melodia reconhecível, mas com buracos e notas tortas', ['piano', 'piano_contido', 'piano_desafinado']),
        cel: off('O encanto se apaga'),
        pad: on('pad_cello', 0.85, 'Acordes ocos: a terça é retirada'),
        bas: on('baixo', 0.8, 'Chão mantido, para a estranheza não virar caos'),
        str: on('cello', 0.9, 'Sustentação que falha: as notas longas param na metade'),
        kik: off(PERC_MATRIZ), hh: off(PERC_MATRIZ), snr: off(PERC_MATRIZ),
        con: off('Sem contracanto — o vazio é o efeito'),
        pul: off('Sem pulso'),
        ped: on('vidro', 1.0, 'Dissonância insinuada: meio-tom acima da quinta, entrando atrasada'),
        sub: off('Sem grave extra'),
        gtr: off('Violão fora deste perfil'),
        per: off('Sem percussão')
      },
      filtrar: function (n, i) {
        if (n.l === 'mel' && i.indice % 6 === 4 && n.d < 1) return false;
        if (n.l === 'pad' && i.acorde.terca != null && i.classe === i.acorde.terca) return false;
        return true;
      },
      transformar: function (n, i) {
        if (n.l === 'mel' && i.indice % 5 === 2) n.f = cents(n.f, -35);
        if (n.l === 'str') n.d = Math.max(0.75, n.d * 0.5);
        return n;
      },
      gerar: function (T) {
        return T.D.HARMONIA.filter(function (a) { return a.fim - a.ini >= 2; }).map(function (a) {
          return T.nt(a.ini + 1, T.noRegistro((a.quinta + 1) % 12, 600), a.fim - a.ini - 1, 0.011, 'ped');
        });
      }
    },
  };

  var LISTA = ['matriz', 'mundoreal', 'outromundo', 'estranheza', 'suspense', 'perigo', 'tristeza', 'esperanca'];
  var ANTERIORES = [];

  function registrarAnteriores(perfis) {
    Object.keys(perfis).forEach(function (id) {
      PERFIS[id] = perfis[id];
      if (ANTERIORES.indexOf(id) < 0) ANTERIORES.push(id);
    });
  }

  // ------------------------------------------------------------
  //  Validação e compilação
  // ------------------------------------------------------------
  var CONHECIDAS = CAMADAS.map(function (c) { return c.id; });

  function validar(id) {
    var p = PERFIS[id];
    if (!p) return ['Perfil desconhecido: ' + id];
    var erros = [];
    CONHECIDAS.forEach(function (l) {
      if (!p.camadas[l]) erros.push('Camada não declarada: ' + l);
    });
    Object.keys(p.camadas).forEach(function (l) {
      if (CONHECIDAS.indexOf(l) < 0) erros.push('Camada desconhecida: ' + l);
      var c = p.camadas[l];
      if (c.ativo && (!c.timbre || !(c.ganho > 0))) erros.push('Camada ativa sem timbre ou ganho: ' + l);
    });
    PERCUSSAO_MATRIZ.forEach(function (l) {
      if (p.camadas[l] && p.camadas[l].ativo) erros.push('Percussão da matriz ativada sem aprovação: ' + l);
    });
    return erros;
  }

  function posicaoNaFrase(b) {
    var F = D.FRASES, ini = 0, fim = D.DURACAO;
    for (var i = 0; i < F.length; i++) {
      if (F[i] <= b + 1e-6) { ini = F[i]; fim = i + 1 < F.length ? F[i + 1] : D.DURACAO; }
    }
    return Math.max(0, Math.min(1, (b - ini) / (fim - ini)));
  }

  function transposicaoPadrao(id) {
    var p = PERFIS[id];
    return p.fixa ? 0 : (p.transposicaoPadrao || 0);
  }

  // Repetição contínua: a introdução (A) toca só na primeira passagem e a Coda,
  // que é um final em decrescendo, fica fora do ciclo. O A final termina na
  // dominante (F) e resolve em B♭ no início de A', como na própria Matriz.
  var LOOP_PADRAO = { ini: 16, fim: 88 };

  // opcoes.transposicao: semitons (omitido = padrão do perfil; a Matriz é sempre 0)
  // opcoes.timbres: { camada: timbre } — só aceita timbres listados em `alternativas`
  // opcoes.ganhos: { camada: multiplicador } — 0 desliga a camada
  function compilar(id, opcoes) {
    opcoes = opcoes || {};
    var p = PERFIS[id];
    if (!p) throw new Error('Perfil desconhecido: ' + id);
    var erros = validar(id);
    var semitons = p.fixa ? 0 : (opcoes.transposicao != null ? opcoes.transposicao : transposicaoPadrao(id));
    var fator = semitons ? Math.pow(2, semitons / 12) : 1;
    var notas = [];
    var indices = {};
    var desconhecidas = {};

    var camadas = {};
    Object.keys(p.camadas).forEach(function (l) { camadas[l] = copiar(p.camadas[l]); });
    var trocas = opcoes.timbres || {};
    Object.keys(trocas).forEach(function (l) {
      var cam = camadas[l], t = trocas[l];
      if (!cam || !cam.ativo) { erros.push('Troca de timbre em camada inativa: ' + l); return; }
      if (t === cam.timbre) return;
      if (!cam.alternativas || cam.alternativas.indexOf(t) < 0) {
        erros.push('Timbre fora das alternativas de ' + l + ': ' + t);
        return;
      }
      cam.timbre = t;
    });
    var ganhos = opcoes.ganhos || {};
    Object.keys(ganhos).forEach(function (l) {
      var cam = camadas[l];
      if (!cam || !cam.ativo) { erros.push('Ajuste de ganho em camada inativa: ' + l); return; }
      cam.ganho = cam.ganho * ganhos[l];
      if (!(cam.ganho > 0)) {
        cam.ativo = false;
        cam.ganho = 0;
        cam.funcao = cam.funcao + ' (silenciada no ajuste aprovado)';
      }
    });

    function aceitar(n, origem) {
      var cam = camadas[n.l];
      if (!cam) {
        if (!desconhecidas[n.l]) erros.push('Nota em camada não declarada (' + origem + '): ' + n.l);
        desconhecidas[n.l] = true;
        return;
      }
      if (!cam.ativo) return;
      if (!(n.d > 0) || !(n.f > 0) || !(n.v > 0)) return;
      var dinamica = p.dinamica ? (p.dinamica[D.secaoEm(n.b).id] || 1) : 1;
      var ev = { b: n.b, f: n.f * fator, d: n.d, v: n.v * cam.ganho * dinamica, l: n.l };
      if (n.ataque) ev.ataque = n.ataque;
      notas.push(ev);
    }

    ordenar(D.copiarNotas()).forEach(function (n) {
      var info = {
        secao: D.secaoEm(n.b).id,
        acorde: D.acordeEm(n.b),
        classe: D.classe(n.f),
        posFrase: posicaoNaFrase(n.b),
        indice: (indices[n.l] = (indices[n.l] == null ? 0 : indices[n.l] + 1))
      };
      var cam = camadas[n.l];
      if (cam && !cam.ativo) return;
      if (p.filtrar && !p.filtrar(n, info)) return;
      var m = p.transformar ? p.transformar(copiar(n), info) : n;
      if (m) aceitar(m, 'matriz');
    });

    if (p.gerar) p.gerar(T).forEach(function (n) { aceitar(n, 'gerada'); });

    var eventos = ordenar(notas);
    var contagem = {};
    eventos.forEach(function (e) { contagem[e.l] = (contagem[e.l] || 0) + 1; });

    return {
      id: id,
      nome: p.nome,
      cor: p.cor,
      andamento: { base: p.andamento.base, porSecao: p.andamento.porSecao || null },
      dinamica: p.dinamica || null,
      duracao: D.DURACAO,
      trechoLoop: { ini: (p.trechoLoop || LOOP_PADRAO).ini, fim: (p.trechoLoop || LOOP_PADRAO).fim },
      secoes: D.SECOES.map(function (s) { return { id: s.id, nome: s.nome, curto: s.curto, ini: s.ini, fim: s.fim }; }),
      frases: D.FRASES.slice(),
      camadas: camadas,
      eventos: eventos,
      contagem: contagem,
      transposicao: semitons,
      transposicaoPadrao: transposicaoPadrao(id),
      fixa: !!p.fixa,
      erros: erros
    };
  }

  global.LalaiPerfis = {
    CAMADAS: CAMADAS,
    LISTA: LISTA,
    ANTERIORES: ANTERIORES,
    PERFIS: PERFIS,
    validar: validar,
    transposicaoPadrao: transposicaoPadrao,
    compilar: compilar,
    registrarAnteriores: registrarAnteriores,
    util: { on: on, off: off, cents: cents, PERC_MATRIZ: PERC_MATRIZ, SECOES_A: SECOES_A }
  };
})(typeof window !== 'undefined' ? window : globalThis);
