// ============================================================
//  Motor musical — Efeito Disney
//
//  Independente do laboratório e do DOM: recebe perfis compilados
//  (LalaiPerfis.compilar) e os toca com Web Audio + soundfont-player.
//
//  Cadeia de sinal (tudo passa pelo GainNode mestre):
//    nota → ganho da camada → saída do perfil (bus) → MESTRE → destino
//  Os nós do SoundFont são re-roteados para a camada do seu perfil; se
//  isso falhar, o instrumento já está ligado ao mestre (destination).
//
//  Agendamento com janela de antecipação: a música não é agendada de uma
//  vez, então uma troca de perfil pode cair no início exato de uma seção
//  ou frase, sem reiniciar a peça.
// ============================================================
(function (global) {
  'use strict';

  var ANTECIPACAO = 0.35;
  var TICK_MS = 50;
  var ATRASO_INICIAL = 0.45;
  var EPS = 1e-6;
  var FALHOU = { falhou: true };

  var TIMBRES = {
    piano:        { nome: 'Piano',                     sf: 'acoustic_grand_piano', g: 5 },
    piano_brilho: { nome: 'Piano agudo (matriz)',      sf: 'acoustic_grand_piano', g: 2 },
    piano_suave:  { nome: 'Piano suave (abafado)',     sf: 'acoustic_grand_piano', g: 3.5, sfOpts: { release: 0.8 }, filtro: { tipo: 'lowpass', hz: 1500, q: 0.5 } },
    piano_contido:{ nome: 'Piano contido (distante)',  sf: 'acoustic_grand_piano', g: 3, sfOpts: { release: 1.0 }, filtro: { tipo: 'lowpass', hz: 900, q: 0.4 } },
    piano_luz:    { nome: 'Piano claro',               sf: 'bright_acoustic_piano', g: 4.5 },
    piano_eletrico:{ nome: 'Piano elétrico (macio)',   sf: 'electric_piano_1', g: 4 },
    piano_fm:     { nome: 'Piano elétrico FM (metálico)', sf: 'electric_piano_2', g: 3.5 },
    piano_desafinado: { nome: 'Piano desafinado (duplo, −22 cents)', sf: 'acoustic_grand_piano', g: 3.5,
                        duplo: { sf: 'acoustic_grand_piano', g: 2.5, cents: -22 } },
    cravo:        { nome: 'Cravo',                     sf: 'harpsichord', g: 3 },
    harpa:        { nome: 'Harpa',                     sf: 'orchestral_harp', g: 3 },
    corne_ingles: { nome: 'Corne inglês',              sf: 'english_horn', g: 3, sfOpts: { attack: 0.06 } },
    coro_ooh:     { nome: 'Vozes fechadas (ooh)',      sf: 'voice_oohs', g: 2.5, osc: { tipo: 'sine', g: 0.3, env: 'pad' }, sfOpts: { attack: 0.4 } },
    metais:       { nome: 'Metais graves (trombone)',  sf: 'trombone', g: 3, osc: { tipo: 'sine', g: 0.25, env: 'str' }, sfOpts: { attack: 0.6 } },
    celesta:      { nome: 'Celesta',                   sf: 'celesta', g: 3 },
    caixinha:     { nome: 'Caixinha de música',        sf: 'music_box', g: 3 },
    glock:        { nome: 'Glockenspiel',              sf: 'glockenspiel', g: 2 },
    flauta:       { nome: 'Flauta',                    sf: 'flute', g: 3, sfOpts: { attack: 0.04 } },
    cello:        { nome: 'Violoncelo',                sf: 'cello', g: 4, osc: { tipo: 'triangle', g: 0.55, env: 'str' } },
    pad_cello:    { nome: 'Pad de cello',              sf: 'cello', g: 2, osc: { tipo: 'sine', g: 0.5, env: 'pad' } },
    cordas:       { nome: 'Conjunto de cordas',        sf: 'string_ensemble_1', g: 3, osc: { tipo: 'sine', g: 0.4, env: 'str' }, sfOpts: { attack: 0.12 } },
    tremolo:      { nome: 'Cordas em tremolo',         sf: 'tremolo_strings', g: 3, osc: { tipo: 'triangle', g: 0.3, env: 'str' } },
    pizz:         { nome: 'Pizzicato',                 sf: 'pizzicato_strings', g: 3 },
    baixo:        { nome: 'Baixo acústico',            sf: 'acoustic_bass', g: 4 },
    contrabaixo:  { nome: 'Contrabaixo (arco)',        sf: 'contrabass', g: 4, osc: { tipo: 'sine', g: 0.5, env: 'pad' }, sfOpts: { attack: 0.3 } },
    coro:         { nome: 'Coro (aah)',                sf: 'choir_aahs', g: 2.5, osc: { tipo: 'sine', g: 0.35, env: 'pad' }, sfOpts: { attack: 0.3 } },
    halo:         { nome: 'Pad sintético (halo)',      sf: 'pad_7_halo', g: 2.5, osc: { tipo: 'sine', g: 0.4, env: 'pad' } },
    trompa:       { nome: 'Trompa',                    sf: 'french_horn', g: 2.5, osc: { tipo: 'sine', g: 0.3, env: 'str' }, sfOpts: { attack: 0.25 } },
    violao:       { nome: 'Violão de nylon',           sf: 'acoustic_guitar_nylon', g: 3 },
    timpano:      { nome: 'Tímpano',                   sf: 'timpani', g: 4 },
    vidro:        { nome: 'Senoide vítrea (síntese)',  osc: { tipo: 'sine', g: 1, env: 'drone', vibrato: { hz: 4.5, cents: 9 } } }
  };

  function criar() {
    var ctx = null;
    var mestre = null;
    var espaco = null;
    var volume = 0.75;
    var instrumentos = {};
    var promessas = {};
    var ouvintes = {};
    var ajustes = {};
    var st = null;
    var timer = null;
    var limpezas = [];

    function emitir(nome, dados) {
      (ouvintes[nome] || []).forEach(function (fn) {
        try { fn(dados); } catch (e) { console.error(e); }
      });
    }

    function on(nome, fn) { (ouvintes[nome] = ouvintes[nome] || []).push(fn); }

    function iniciar() {
      if (!ctx) {
        var AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) throw new Error('Web Audio API indisponível');
        ctx = new AC();
        mestre = ctx.createGain();
        mestre.gain.value = volume;
        // "Espaço" fica depois do mestre: recua a música para um efeito sem
        // interferir no volume nem nos fades de transição. Em repouso, ganho 1.
        espaco = ctx.createGain();
        mestre.connect(espaco);
        espaco.connect(ctx.destination);
      }
      // Antes do primeiro gesto o navegador recusa; a mixagem tenta de novo no gesto.
      if (ctx.state === 'suspended') {
        var r = ctx.resume();
        if (r && r.catch) r.catch(function () {});
      }
      return ctx;
    }

    function abrirEspaco(nivel, ataque, duracao, soltura) {
      if (!ctx) return;
      var g = espaco.gain, t = ctx.currentTime;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(nivel, t + ataque);
      g.setValueAtTime(nivel, t + ataque + duracao);
      g.linearRampToValueAtTime(1, t + ataque + duracao + soltura);
    }

    function rampa(param, alvo, dur) {
      var t = ctx.currentTime;
      param.cancelScheduledValues(t);
      param.setValueAtTime(param.value, t);
      param.linearRampToValueAtTime(alvo, t + dur);
    }

    function depois(fn, ms) {
      var id = setTimeout(function () {
        limpezas = limpezas.filter(function (x) { return x !== id; });
        fn();
      }, Math.max(0, ms));
      limpezas.push(id);
    }

    // ---------------------------------------------------------- samples

    // Safari/iPadOS antigos não decodificam Ogg Vorbis; o MusyngKite também publica MP3.
    function formatoAmostras() {
      try {
        var a = global.document && global.document.createElement('audio');
        if (a && a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"')) return 'ogg';
      } catch (e) {}
      return 'mp3';
    }

    function carregarInstrumento(nome) {
      if (promessas[nome]) return promessas[nome];
      if (typeof global.Soundfont === 'undefined') {
        instrumentos[nome] = FALHOU;
        promessas[nome] = Promise.resolve(FALHOU);
        return promessas[nome];
      }
      emitir('carregando', { instrumento: nome, estado: 'inicio' });
      promessas[nome] = global.Soundfont.instrument(ctx, nome, {
        soundfont: 'MusyngKite', format: formatoAmostras(), destination: mestre
      }).then(function (inst) {
        instrumentos[nome] = inst;
        emitir('carregando', { instrumento: nome, estado: 'ok' });
        return inst;
      }).catch(function () {
        instrumentos[nome] = FALHOU;
        emitir('carregando', { instrumento: nome, estado: 'falhou' });
        return FALHOU;
      });
      return promessas[nome];
    }

    function instrumentosDoPerfil(perfil) {
      var nomes = [];
      Object.keys(perfil.camadas).forEach(function (l) {
        var c = perfil.camadas[l];
        var tb = c.ativo ? TIMBRES[c.timbre] : null;
        if (tb && tb.sf && nomes.indexOf(tb.sf) < 0) nomes.push(tb.sf);
        if (tb && tb.duplo && nomes.indexOf(tb.duplo.sf) < 0) nomes.push(tb.duplo.sf);
      });
      return nomes;
    }

    function preparar(perfil) {
      iniciar();
      return Promise.all(instrumentosDoPerfil(perfil).map(carregarInstrumento));
    }

    // ---------------------------------------------------------- vozes

    function envelope(p, tipo, v, t, dur, ataque) {
      p.setValueAtTime(0, t);
      if (tipo === 'pad') {
        var atk = ataque ? Math.min(ataque, dur * 0.5) : Math.min(0.45, dur * 0.25);
        var hold = Math.max(atk, dur - 0.5);
        p.linearRampToValueAtTime(v, t + atk);
        if (dur > 0.7) p.setValueAtTime(v, t + hold);
        p.exponentialRampToValueAtTime(0.001, t + dur);
      } else if (tipo === 'str') {
        var satk = ataque ? Math.min(ataque, dur * 0.5) : Math.min(0.4, dur * 0.25);
        var shold = Math.max(satk + 0.1, dur - 0.35);
        p.linearRampToValueAtTime(v, t + satk);
        if (dur > 0.6 && shold < dur) p.setValueAtTime(v * 0.88, t + shold);
        p.exponentialRampToValueAtTime(0.001, t + dur);
      } else if (tipo === 'drone') {
        var a = ataque ? Math.min(ataque, dur * 0.5) : Math.min(2, dur * 0.3);
        var r = Math.min(2, dur * 0.3);
        p.linearRampToValueAtTime(v, t + a);
        p.setValueAtTime(v, t + Math.max(a, dur - r));
        p.linearRampToValueAtTime(0, t + dur);
      } else {
        p.linearRampToValueAtTime(v, t + Math.min(0.025, dur * 0.5));
        p.exponentialRampToValueAtTime(0.001, t + dur);
      }
    }

    function tocarOsc(cfg, f, v, t, dur, destino, ataque, bus) {
      if (!(v > 0)) return;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var fim = t + dur + 0.2;
      osc.type = cfg.tipo;
      osc.frequency.value = f;
      envelope(g.gain, cfg.env, v, t, dur, ataque);
      if (cfg.vibrato) {
        var lfo = ctx.createOscillator();
        var lg = ctx.createGain();
        lfo.frequency.value = cfg.vibrato.hz;
        lg.gain.value = cfg.vibrato.cents;
        lfo.connect(lg);
        lg.connect(osc.detune);
        lfo.start(t);
        lfo.stop(fim);
      }
      osc.connect(g);
      g.connect(destino);
      osc.start(t);
      osc.stop(fim);
      bus.nos.push({ fim: fim, parar: function () {
        try { osc.stop(); } catch (e) {}
        try { g.disconnect(); } catch (e) {}
      } });
    }

    function tocarSF(inst, tb, f, v, t, dur, destino, ataque, bus) {
      var exato = 69 + 12 * Math.log2(f / 440);
      var midi = Math.round(exato);
      var desvio = Math.round((exato - midi) * 100);
      var opts = { gain: v * tb.g, duration: dur };
      if (tb.sfOpts) for (var k in tb.sfOpts) opts[k] = tb.sfOpts[k];
      if (ataque) opts.attack = ataque;
      var no = inst.play(midi, t, opts);
      if (!no) return;
      if (desvio && no.source && no.source.detune) {
        try { no.source.detune.value = desvio; } catch (e) {}
      }
      if (no.connect && no.disconnect) {
        try { no.disconnect(); no.connect(destino); } catch (e) {}
      }
      bus.nos.push({ fim: t + dur + 1.5, parar: function () {
        try { no.stop(); } catch (e) {}
        try { no.disconnect(); } catch (e) {}
      } });
    }

    function tocarNota(ev, t, dur, bus) {
      var cam = bus.perfil.camadas[ev.l];
      var destino = bus.camadas[ev.l];
      var tb = cam && cam.ativo ? TIMBRES[cam.timbre] : null;
      if (!tb || !destino) return;
      var inst = tb.sf ? instrumentos[tb.sf] : null;
      if (tb.sf && inst && inst !== FALHOU) {
        tocarSF(inst, tb, ev.f, ev.v, t, dur, destino, ev.ataque, bus);
        if (tb.osc) tocarOsc(tb.osc, ev.f, ev.v * tb.osc.g, t, dur, destino, ev.ataque, bus);
        var inst2 = tb.duplo ? instrumentos[tb.duplo.sf] : null;
        if (inst2 && inst2 !== FALHOU) {
          tocarSF(inst2, tb.duplo, ev.f * Math.pow(2, tb.duplo.cents / 1200), ev.v, t, dur, destino, ev.ataque, bus);
        }
      } else if (tb.sf) {
        var reserva = { tipo: tb.osc ? tb.osc.tipo : 'triangle', env: tb.osc ? tb.osc.env : 'nota' };
        tocarOsc(reserva, ev.f, ev.v, t, dur, destino, ev.ataque, bus);
      } else {
        tocarOsc(tb.osc, ev.f, ev.v * tb.osc.g, t, dur, destino, ev.ataque, bus);
      }
      if (t + dur > st.ultimoFim) st.ultimoFim = t + dur;
    }

    // ---------------------------------------------------------- buses

    function criarBus(perfil) {
      var saida = ctx.createGain();
      saida.connect(mestre);
      var camadas = {};
      var filtros = [];
      var aj = ajustes[perfil.id] || {};
      Object.keys(perfil.camadas).forEach(function (l) {
        var cam = perfil.camadas[l];
        if (!cam.ativo) return;
        var g = ctx.createGain();
        g.gain.value = aj[l] == null ? 1 : aj[l];
        var tb = TIMBRES[cam.timbre];
        if (tb && tb.filtro) {
          var f = ctx.createBiquadFilter();
          f.type = tb.filtro.tipo;
          f.frequency.value = tb.filtro.hz;
          f.Q.value = tb.filtro.q || 0.7;
          g.connect(f);
          f.connect(saida);
          filtros.push(f);
        } else {
          g.connect(saida);
        }
        camadas[l] = g;
      });
      return { perfil: perfil, saida: saida, camadas: camadas, filtros: filtros, nos: [] };
    }

    function destruirBus(bus) {
      bus.nos.forEach(function (n) { n.parar(); });
      bus.nos = [];
      Object.keys(bus.camadas).forEach(function (l) {
        try { bus.camadas[l].disconnect(); } catch (e) {}
      });
      bus.filtros.forEach(function (f) {
        try { f.disconnect(); } catch (e) {}
      });
      try { bus.saida.disconnect(); } catch (e) {}
    }

    function ajustarCamada(perfilId, camada, valor) {
      (ajustes[perfilId] = ajustes[perfilId] || {})[camada] = valor;
      if (!st) return;
      st.buses.forEach(function (b) {
        if (b.perfil.id === perfilId && b.camadas[camada]) rampa(b.camadas[camada].gain, valor, 0.08);
      });
    }

    function definirVolume(v) {
      volume = v;
      if (mestre && !(st && st.parando)) rampa(mestre.gain, v, 0.05);
    }

    // ---------------------------------------------------------- tempo

    function secaoEm(perfil, rel) {
      var s = perfil.secoes;
      for (var i = s.length - 1; i >= 0; i--) if (rel + EPS >= s[i].ini) return s[i];
      return s[0];
    }

    function bpmEm(perfil, rel) {
      var a = perfil.andamento;
      var id = secaoEm(perfil, rel).id;
      return (a.porSecao && a.porSecao[id]) || a.base;
    }

    function tempoDe(beat) { return st.ancora.tempo + (beat - st.ancora.beat) * 60 / st.bpm; }
    function beatDe(t) { return st.ancora.beat + (t - st.ancora.tempo) * st.bpm / 60; }

    function marcar(beat, tempo) {
      st.marcos.push({ tempo: tempo, beat: beat, bpm: st.bpm, ciclo: st.cicloInicio, perfil: st.perfil });
      if (st.marcos.length > 32) st.marcos.shift();
    }

    // ---------------------------------------------------------- agendador

    function buscar(evs, x) {
      var lo = 0, hi = evs.length;
      while (lo < hi) {
        var m = (lo + hi) >> 1;
        if (evs[m].b < x) lo = m + 1; else hi = m;
      }
      return lo;
    }

    function agendar(de, ate, agora) {
      var evs = st.perfil.eventos;
      var ciclo = st.cicloInicio;
      var relAte = ate - ciclo;
      for (var i = buscar(evs, de - ciclo - EPS); i < evs.length && evs[i].b < relAte - EPS; i++) {
        var ev = evs[i];
        var t = tempoDe(ciclo + ev.b);
        if (t < agora - 0.05) continue;
        if (t < agora) t = agora + 0.005;
        tocarNota(ev, t, ev.d * 60 / st.bpm, st.bus);
      }
    }

    // Em repetição, o ciclo é o trecho de loop do perfil; sem repetição, a peça inteira.
    function fimDoCiclo(p) { return st.loop && p.trechoLoop ? p.trechoLoop.fim : p.duracao; }
    function inicioDoCiclo(p) { return st.loop && p.trechoLoop ? p.trechoLoop.ini : 0; }

    function proximoPonto() {
      var c = st.cursor, ciclo = st.cicloInicio, p = st.perfil;
      var melhor = ciclo + fimDoCiclo(p);
      for (var i = 0; i < p.secoes.length; i++) {
        var abs = ciclo + p.secoes[i].ini;
        if (abs > c + EPS) { if (abs < melhor) melhor = abs; break; }
      }
      if (st.pendente && st.pendente.beat > c + EPS && st.pendente.beat < melhor) melhor = st.pendente.beat;
      return melhor;
    }

    function aplicarTransicao(tP) {
      var pend = st.pendente;
      st.pendente = null;
      var velho = st.bus;
      var g = velho.saida.gain;
      if (g.cancelAndHoldAtTime) {
        g.cancelAndHoldAtTime(tP);
      } else {
        g.cancelScheduledValues(tP);
        g.setValueAtTime(1, tP);
      }
      g.linearRampToValueAtTime(0.0001, tP + pend.fadeSaida);
      depois(function () {
        destruirBus(velho);
        if (st) st.buses = st.buses.filter(function (b) { return b !== velho; });
      }, (tP + pend.fadeSaida + 0.15 - ctx.currentTime) * 1000);

      var novo = criarBus(pend.perfil);
      if (pend.fadeEntrada > 0) {
        novo.saida.gain.setValueAtTime(0, ctx.currentTime);
        novo.saida.gain.setValueAtTime(0, tP);
        novo.saida.gain.linearRampToValueAtTime(1, tP + pend.fadeEntrada);
      }
      st.bus = novo;
      st.perfil = pend.perfil;
      st.buses.push(novo);
      emitir('transicao', { de: velho.perfil.id, para: novo.perfil.id, modo: pend.modo });
    }

    function processar(P) {
      var rel = P - st.cicloInicio;
      var comTransicao = st.pendente && Math.abs(st.pendente.beat - P) < EPS;
      var tP = tempoDe(P);
      if (rel >= fimDoCiclo(st.perfil) - EPS) {
        if (!st.loop && !comTransicao) { encerrarNatural(); return; }
        rel = inicioDoCiclo(st.perfil);
        st.cicloInicio = P - rel;
      }
      if (comTransicao) aplicarTransicao(tP);
      st.ancora = { beat: P, tempo: tP };
      st.bpm = bpmEm(st.perfil, rel);
      marcar(P, tP);
      if (comTransicao) retomarSustentadas(rel, tP);
    }

    // Numa troca no meio de um acorde, as notas longas da nova atmosfera que já deveriam
    // estar soando entram junto, para a harmonia não ficar vazia até o próximo acorde.
    function retomarSustentadas(rel, tP) {
      var evs = st.perfil.eventos;
      for (var i = 0; i < evs.length && evs[i].b < rel - EPS; i++) {
        var ev = evs[i];
        var resta = ev.b + ev.d - rel;
        if (ev.l === 'mel' || ev.d < 2 || resta < 1) continue;
        tocarNota(ev, tP, resta * 60 / st.bpm, st.bus);
      }
    }

    function podar(agora) {
      st.buses.forEach(function (b) {
        b.nos = b.nos.filter(function (n) { return n.fim > agora; });
      });
    }

    function tick() {
      if (!st || st.encerrando || st.parando) return;
      var agora = ctx.currentTime;
      for (var guarda = 0; guarda < 64; guarda++) {
        var P = proximoPonto();
        var horizonte = beatDe(agora + ANTECIPACAO);
        var limite = Math.min(P, horizonte);
        if (limite > st.cursor) {
          agendar(st.cursor, limite, agora);
          st.cursor = limite;
        }
        if (horizonte < P - EPS) break;
        st.cursor = P;
        processar(P);
        if (!st || st.encerrando) break;
      }
      if (st) podar(agora);
    }

    function encerrarNatural() {
      st.encerrando = true;
      clearInterval(timer);
      timer = null;
      depois(function () {
        emitir('fim', {});
        parar(0.6);
      }, (Math.max(0, st.ultimoFim - ctx.currentTime) + 0.3) * 1000);
    }

    // ---------------------------------------------------------- controle

    function descartarImediato() {
      limpezas.forEach(clearTimeout);
      limpezas = [];
      if (timer) { clearInterval(timer); timer = null; }
      if (!st) return;
      var buses = st.buses;
      st = null;
      var t = ctx.currentTime;
      buses.forEach(function (b) {
        b.saida.gain.cancelScheduledValues(t);
        b.saida.gain.setValueAtTime(b.saida.gain.value, t);
        b.saida.gain.linearRampToValueAtTime(0, t + 0.04);
      });
      setTimeout(function () { buses.forEach(destruirBus); }, 90);
    }

    function tocar(perfil, opcoes) {
      opcoes = opcoes || {};
      iniciar();
      descartarImediato();
      var inicio = opcoes.inicioBeat || 0;
      var t0 = ctx.currentTime + ATRASO_INICIAL;
      if (opcoes.fadeEntrada > 0) {
        mestre.gain.cancelScheduledValues(ctx.currentTime);
        mestre.gain.setValueAtTime(0, ctx.currentTime);
        mestre.gain.setValueAtTime(0, t0);
        mestre.gain.linearRampToValueAtTime(volume, t0 + opcoes.fadeEntrada);
      } else {
        rampa(mestre.gain, volume, 0.03);
      }
      st = {
        perfil: perfil, loop: !!opcoes.loop, buses: [], bus: null,
        cicloInicio: 0, cursor: inicio, ancora: { beat: inicio, tempo: t0 },
        bpm: bpmEm(perfil, inicio), pendente: null, marcos: [],
        ultimoFim: 0, encerrando: false, parando: false
      };
      st.bus = criarBus(perfil);
      st.buses.push(st.bus);
      marcar(inicio, t0);
      timer = setInterval(tick, TICK_MS);
      tick();
      emitir('inicio', { perfilId: perfil.id, beat: inicio });
    }

    function transicionar(perfil, opcoes) {
      opcoes = opcoes || {};
      if (!st || st.parando || st.encerrando) {
        tocar(perfil, { loop: opcoes.loop, fadeEntrada: opcoes.fadeEntrada });
        return { iniciou: true };
      }
      var modo = opcoes.modo || 'secao';
      var c = st.cursor, ciclo = st.cicloInicio, p = st.perfil;
      var fimCiclo = ciclo + fimDoCiclo(p);
      var alvo = fimCiclo;
      if (modo === 'agora') {
        // Logo após o que já está agendado (~0,35 s): para trocas ligadas a eventos da cena.
        alvo = Math.min(c + 0.01, fimCiclo);
      } else if (modo === 'imediata') {
        alvo = Math.min(Math.floor(c + EPS) + 1, fimCiclo);
      } else {
        var pontos = modo === 'frase' ? p.frases : p.secoes.map(function (s) { return s.ini; });
        for (var i = 0; i < pontos.length; i++) {
          var abs = ciclo + pontos[i];
          if (abs > c + EPS && abs < fimCiclo - EPS) { alvo = abs; break; }
        }
      }
      var imediata = modo === 'imediata' || modo === 'agora';
      st.pendente = {
        perfil: perfil, beat: alvo, modo: modo,
        fadeSaida: Math.max(0.05, opcoes.fadeSaida != null ? opcoes.fadeSaida : (imediata ? 2.0 : 1.2)),
        fadeEntrada: Math.max(0, opcoes.fadeEntrada != null ? opcoes.fadeEntrada : (imediata ? 1.5 : 0))
      };
      return { beat: alvo - ciclo, modo: modo };
    }

    function cancelarTransicao() { if (st) st.pendente = null; }

    function parar(fade) {
      if (!st || st.parando) return;
      fade = fade == null ? 0.8 : Math.max(0.05, fade);
      clearInterval(timer);
      timer = null;
      st.parando = true;
      st.pendente = null;
      var t = ctx.currentTime;
      mestre.gain.cancelScheduledValues(t);
      mestre.gain.setValueAtTime(mestre.gain.value, t);
      mestre.gain.linearRampToValueAtTime(0, t + fade);
      var alvo = st;
      depois(function () {
        if (st !== alvo) return;
        alvo.buses.forEach(destruirBus);
        st = null;
        mestre.gain.cancelScheduledValues(ctx.currentTime);
        mestre.gain.setValueAtTime(volume, ctx.currentTime);
        emitir('parado', {});
      }, fade * 1000 + 80);
    }

    function definirLoop(v) { if (st) st.loop = !!v; }

    function estado() {
      if (!st || !ctx) return { tocando: false };
      var agora = ctx.currentTime;
      var m = st.marcos[0];
      for (var i = st.marcos.length - 1; i >= 0; i--) {
        if (st.marcos[i].tempo <= agora + 1e-3) { m = st.marcos[i]; break; }
      }
      var dur = m.perfil.duracao;
      var rel = m.beat + Math.max(0, agora - m.tempo) * m.bpm / 60 - m.ciclo;
      rel = Math.max(0, Math.min(rel, dur));
      var pend = null;
      if (st.pendente) {
        var pr = st.pendente.beat - m.ciclo;
        var fim = fimDoCiclo(m.perfil);
        if (pr >= fim - EPS) pr = inicioDoCiclo(m.perfil) + (pr - fim);
        pend = { perfilId: st.pendente.perfil.id, nome: st.pendente.perfil.nome, beat: pr, modo: st.pendente.modo };
      }
      return {
        tocando: !st.parando,
        perfilId: m.perfil.id,
        nome: m.perfil.nome,
        beat: rel,
        duracao: dur,
        bpm: m.bpm,
        secao: secaoEm(m.perfil, rel),
        pendente: pend,
        loop: st.loop
      };
    }

    return {
      iniciar: iniciar,
      preparar: preparar,
      instrumentosDoPerfil: instrumentosDoPerfil,
      tocar: tocar,
      transicionar: transicionar,
      cancelarTransicao: cancelarTransicao,
      parar: parar,
      definirVolume: definirVolume,
      abrirEspaco: abrirEspaco,
      definirLoop: definirLoop,
      ajustarCamada: ajustarCamada,
      estado: estado,
      on: on
    };
  }

  global.MotorMusical = { TIMBRES: TIMBRES, criar: criar };
})(typeof window !== 'undefined' ? window : globalThis);
