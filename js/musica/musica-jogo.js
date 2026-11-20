// ============================================================
//  Música do jogo — Efeito Disney
//
//  Liga as atmosferas aprovadas (LALAI_APROVADO) ao motor musical.
//  Os efeitos sonoros do jogo usam contextos de áudio próprios e não
//  passam por aqui.
//
//  MusicaJogo.tocar(atmosfera, { fadeEntrada, fadeSaida, modo })
//  MusicaJogo.pararSe(atmosfera, fade)  — só para se for a atmosfera atual
//  MusicaJogo.parar(fade)
// ============================================================
(function (global) {
  'use strict';

  var P = global.LalaiPerfis;
  var APROVADO = global.LALAI_APROVADO || {};
  var motor = global.MotorMusical.criar();
  var ATMOSFERAS = ['mundoreal', 'outromundo', 'estranheza', 'suspense', 'perigo', 'tristeza', 'esperanca'];
  var cache = {};
  var alvo = null;
  var pedido = 0;
  var paradaAdiada = null;
  var preCarregado = false;

  function perfil(id) {
    if (!cache[id]) {
      var c = P.compilar(id, APROVADO[id] || {});
      if (c.erros.length) console.warn('[música] ' + id, c.erros);
      cache[id] = c;
    }
    return cache[id];
  }

  // Navegadores (principalmente no tablet) só liberam áudio após um gesto do jogador.
  function desbloquear() {
    try { motor.iniciar(); } catch (e) { return; }
    if (preCarregado) return;
    preCarregado = true;
    motor.preparar(perfil('mundoreal'));
    motor.preparar(perfil('outromundo'));
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) {
    global.addEventListener(ev, desbloquear, { capture: true, passive: true });
  });

  function tocar(id, opcoes) {
    if (ATMOSFERAS.indexOf(id) < 0) { console.warn('[música] atmosfera desconhecida: ' + id); return; }
    opcoes = opcoes || {};
    // "Parar esta música" seguido de "tocar outra" no mesmo instante vira uma transição.
    var adiada = paradaAdiada;
    if (adiada) { clearTimeout(adiada.timer); paradaAdiada = null; }
    if (adiada && motor.estado().perfilId === id) { alvo = id; pedido++; return; }
    if (alvo === id) return;
    var est = motor.estado();
    if (est.tocando && est.perfilId === id && est.pendente) {
      motor.cancelarTransicao();
      alvo = id;
      pedido++;
      return;
    }
    alvo = id;
    var meu = ++pedido;
    var p = perfil(id);
    try { motor.iniciar(); } catch (e) { return; }
    motor.preparar(p).then(function () {
      if (meu !== pedido) return;
      if (motor.estado().tocando) {
        motor.transicionar(p, {
          modo: opcoes.modo || 'agora',
          fadeSaida: adiada ? adiada.fade : (opcoes.fadeSaida != null ? opcoes.fadeSaida : 2),
          fadeEntrada: opcoes.fadeEntrada != null ? opcoes.fadeEntrada : 2,
          loop: true
        });
      } else {
        motor.tocar(p, { loop: true, fadeEntrada: opcoes.fadeEntrada || 0 });
      }
    });
  }

  function parar(fade) {
    if (alvo === null && !motor.estado().tocando) return;
    alvo = null;
    pedido++;
    if (paradaAdiada) clearTimeout(paradaAdiada.timer);
    var f = fade == null ? 1 : fade;
    paradaAdiada = {
      fade: f,
      timer: setTimeout(function () { paradaAdiada = null; motor.parar(f); }, 0)
    };
  }

  function pararSe(id, fade) {
    if (alvo === id) parar(fade);
  }

  function preparar(ids) {
    try { motor.iniciar(); } catch (e) { return; }
    ids.forEach(function (id) {
      if (ATMOSFERAS.indexOf(id) >= 0) motor.preparar(perfil(id));
    });
  }

  global.MusicaJogo = {
    ATMOSFERAS: ATMOSFERAS,
    VOLUME_BASE: 0.75,
    tocar: tocar,
    parar: parar,
    pararSe: pararSe,
    preparar: preparar,
    atmosfera: function () { return alvo; },
    transposicao: function () { return alvo ? perfil(alvo).transposicao : 0; },
    estado: motor.estado,
    definirVolume: motor.definirVolume,
    abrirEspaco: motor.abrirEspaco
  };
})(window);
