// ============================================================
//  Mixagem de áudio — efeitos sonoros + equilíbrio com a música
//
//  Efeitos:  som → categoria → EFEITOS (geral) → limitador → destino
//  Música:   motor musical próprio (MusicaJogo); aqui só o volume e o
//            "abrir espaço" temporário quando um efeito importante toca.
//
//  Um único contexto de áudio para todos os efeitos (antes cada efeito
//  criava o seu e nunca o fechava — no tablet isso esgota os contextos).
//
//  Volumes (0–1, 1 = nível de mixagem projetado), salvos no navegador:
//    MixagemAudio.definirVolume('musica' | 'efeitos' | <categoria>, valor)
// ============================================================
(function (global) {
  'use strict';

  var CHAVE = 'fanfiction_audio_v1';
  var CATEGORIAS = {
    susto:      'Sustos',
    impacto:    'Impactos e passos',
    computador: 'Computador',
    suspense:   'Suspense e ambiente',
    interface:  'Interface e digitação'
  };

  var volumes = { musica: 1, efeitos: 1 };
  Object.keys(CATEGORIAS).forEach(function (c) { volumes[c] = 1; });
  try {
    var salvos = JSON.parse(global.localStorage.getItem(CHAVE)) || {};
    Object.keys(volumes).forEach(function (k) {
      if (typeof salvos[k] === 'number' && salvos[k] >= 0 && salvos[k] <= 1) volumes[k] = salvos[k];
    });
  } catch (e) {}

  var ctx = null;
  var geral = null;
  var saidas = {};
  var espaco = { nivel: 1, fim: 0 };

  function contexto() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      ctx = new AC();
      // Limitador: evita que vários efeitos somados estourem. O compressor do
      // Web Audio aplica ganho de compensação automático; a etapa final o anula.
      var compensacao = ctx.createGain();
      compensacao.gain.value = 0.64;
      compensacao.connect(ctx.destination);
      var limitador = ctx.createDynamicsCompressor();
      limitador.threshold.value = -8;
      limitador.knee.value = 4;
      limitador.ratio.value = 20;
      limitador.attack.value = 0.001;
      limitador.release.value = 0.25;
      limitador.connect(compensacao);
      geral = ctx.createGain();
      geral.gain.value = volumes.efeitos;
      geral.connect(limitador);
      Object.keys(CATEGORIAS).forEach(function (c) {
        var g = ctx.createGain();
        g.gain.value = volumes[c];
        g.connect(geral);
        saidas[c] = g;
      });
    }
    if (ctx.state === 'suspended') {
      var r = ctx.resume();
      if (r && r.catch) r.catch(function () {});
    }
    return ctx;
  }

  function saida(categoria) {
    contexto();
    return saidas[categoria] || saidas.interface;
  }

  // A música recua para dar espaço a um efeito importante e volta suavemente.
  // Pedidos sobrepostos usam o nível mais baixo e o fim mais tardio.
  function abrirEspaco(nivel, duracao, soltura) {
    if (!global.MusicaJogo || !global.MusicaJogo.abrirEspaco) return;
    var agora = Date.now() / 1000;
    var ativo = agora < espaco.fim;
    var n = ativo ? Math.min(nivel, espaco.nivel) : nivel;
    var fim = Math.max(ativo ? espaco.fim : 0, agora + duracao);
    espaco = { nivel: n, fim: fim };
    global.MusicaJogo.abrirEspaco(n, 0.06, fim - agora, soltura || 1.2);
  }

  function aplicarVolumeMusica() {
    if (global.MusicaJogo && global.MusicaJogo.definirVolume) {
      global.MusicaJogo.definirVolume(global.MusicaJogo.VOLUME_BASE * volumes.musica);
    }
  }

  function definirVolume(nome, valor) {
    if (!(nome in volumes)) return;
    volumes[nome] = Math.max(0, Math.min(1, valor));
    if (nome === 'musica') aplicarVolumeMusica();
    else if (ctx) {
      var alvo = nome === 'efeitos' ? geral : saidas[nome];
      var t = ctx.currentTime;
      alvo.gain.cancelScheduledValues(t);
      alvo.gain.setValueAtTime(alvo.gain.value, t);
      alvo.gain.linearRampToValueAtTime(volumes[nome], t + 0.05);
    }
    try { global.localStorage.setItem(CHAVE, JSON.stringify(volumes)); } catch (e) {}
  }

  function volume(nome) { return volumes[nome]; }

  // Controles do painel de Configurações: <input type="range" data-volume="musica">
  function ligarControles() {
    var campos = global.document.querySelectorAll('[data-volume]');
    Array.prototype.forEach.call(campos, function (campo) {
      var nome = campo.getAttribute('data-volume');
      var rotulo = global.document.querySelector('[data-volume-valor="' + nome + '"]');
      function mostrar() { if (rotulo) rotulo.textContent = Math.round(volumes[nome] * 100) + '%'; }
      campo.value = Math.round(volumes[nome] * 100);
      mostrar();
      campo.addEventListener('input', function () {
        definirVolume(nome, campo.value / 100);
        mostrar();
      });
    });
  }

  // O contexto dos efeitos só é liberado após um gesto do jogador (exigência dos navegadores).
  ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) {
    global.addEventListener(ev, function () { contexto(); }, { capture: true, passive: true });
  });

  aplicarVolumeMusica();
  ligarControles();

  global.MixagemAudio = {
    CATEGORIAS: CATEGORIAS,
    contexto: contexto,
    saida: saida,
    abrirEspaco: abrirEspaco,
    definirVolume: definirVolume,
    volume: volume
  };
})(window);
