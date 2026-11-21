// ============================================================
//  Orientação da tela — o jogo é jogado na horizontal
//
//  1. Ao entrar em tela cheia, tenta travar em paisagem
//     (screen.orientation.lock; só funciona em tela cheia, no Android).
//  2. Em aparelho de toque na vertical, mostra o aviso #avisoGirar,
//     bloqueia teclado/toque, zera os comandos de movimento e pausa as
//     sequências agendadas (agendar() em game.js) até voltar à horizontal.
//  Script clássico, carregado depois de js/game.js.
// ============================================================
(function () {
    'use strict';

    var aviso = document.getElementById('avisoGirar');
    var toque = window.matchMedia('(pointer: coarse)');
    var retrato = window.matchMedia('(orientation: portrait)');
    var estado = { bloqueada: false, travada: false };

    function emTelaCheia() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    // Recusas e falta de suporte são esperadas (iPhone, iPad, computador, fora da tela cheia)
    function tentarTravarPaisagem() {
        var so = window.screen && window.screen.orientation;
        if (!so || typeof so.lock !== 'function' || !emTelaCheia()) {
            estado.travada = false;
            return Promise.resolve(false);
        }
        try {
            return so.lock('landscape').then(function () {
                estado.travada = true;
                return true;
            }, function () {
                estado.travada = false;
                return false;
            });
        } catch (e) {
            estado.travada = false;
            return Promise.resolve(false);
        }
    }

    function zerarComandos() {
        try {
            movingLeft = false; movingRight = false; movingUp = false; movingDown = false;
            joystickDx = 0; joystickDy = 0;
        } catch (e) {}
        var knob = document.getElementById('joystickKnob');
        if (knob) knob.style.transform = 'translate(0, 0)';
    }

    function avaliar() {
        var deveBloquear = toque.matches && retrato.matches;
        if (deveBloquear === estado.bloqueada) return;
        estado.bloqueada = deveBloquear;
        document.documentElement.classList.toggle('orientacao-bloqueada', deveBloquear);
        if (aviso) aviso.setAttribute('aria-hidden', deveBloquear ? 'false' : 'true');
        if (deveBloquear) {
            zerarComandos();
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
            if (typeof pausarAgendamentos === 'function') pausarAgendamentos();
        } else if (typeof retomarAgendamentos === 'function') {
            retomarAgendamentos();
        }
    }

    // Teclado: nada chega ao jogo nem aos botões focados enquanto o aviso estiver ativo
    function barrarTecla(e) {
        if (!estado.bloqueada) return;
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    ['keydown', 'keyup', 'keypress'].forEach(function (tipo) {
        window.addEventListener(tipo, barrarTecla, true);
    });

    function aoMudarTelaCheia() {
        if (emTelaCheia()) {
            tentarTravarPaisagem().then(avaliar);
        } else {
            estado.travada = false;
            avaliar();
        }
    }
    document.addEventListener('fullscreenchange', aoMudarTelaCheia);
    document.addEventListener('webkitfullscreenchange', aoMudarTelaCheia);

    function ouvir(mq) {
        if (mq.addEventListener) mq.addEventListener('change', avaliar);
        else if (mq.addListener) mq.addListener(avaliar);
    }
    ouvir(toque);
    ouvir(retrato);
    window.addEventListener('resize', avaliar);
    window.addEventListener('orientationchange', avaliar);

    avaliar();

    window.Orientacao = {
        get bloqueada() { return estado.bloqueada; },
        get travadaEmPaisagem() { return estado.travada; },
        avaliar: avaliar,
        tentarTravarPaisagem: tentarTravarPaisagem
    };
})();
