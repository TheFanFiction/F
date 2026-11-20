        function alternarTelaCheia() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                // Entrar em tela cheia
                let elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(err => console.log(err));
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            } else {
                // Sair da tela cheia
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        }
        function entrarEmTelaCheia() {
            let elem = document.documentElement; // Pega a página inteira
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => {
                    console.log("Erro ao tentar entrar em tela cheia:", err.message);
                });
            } else if (elem.webkitRequestFullscreen) { /* Safari / iOS antigo */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge antigo */
                elem.msRequestFullscreen();
            }
        }
        // =====================================================================
        // INTEGRAÇÃO E LÓGICA DO COMPUTADOR
        // =====================================================================
        let pcAtivo = false;
        const imagemPCNormal = "assets/images/retro-computing.png"; 
        const imagemPCOutroMundo = "assets/images/retro-computing-horror.png"; 

        let isOutroMundo = false;
        let perguntaAtualIndex = 0;

        const perguntasReal = [
            {
                pergunta: "Em Shrek Para Sempre, qual vilão oferece um contrato mágico ao Shrek para que ele volte a ser um ogro assustador por um dia, em troca de um único dia do seu passado?",
                opcoes: [
                    { texto: "A) Lord Farquaad", correta: false, feedback: "Hm, não é isso..." },
                    { texto: "B) Rumpelstiltskin", correta: true, feedback: "Exato!" },
                    { texto: "C) Príncipe Encantado", correta: false, feedback: "Hm, não é isso..." }
                ]
            },
            {
                pergunta: "Quando a Alice se perde no País das Maravilhas e não sabe qual caminho escolher na floresta, qual personagem enigmático aparece nas árvores e diz a famosa frase: 'Para quem não sabe para onde vai, qualquer caminho serve'?",
                opcoes: [
                    { texto: "A) O Gato Risonho.", correta: true, feedback: "Exatamente!" },
                    { texto: "B) O Coelho Branco.", correta: false, feedback: "Hm, não é isso..." },
                    { texto: "C) O Chapeleiro Maluco.", correta: false, feedback: "Hm, não é isso..." }
                ]
            },
            {
                pergunta: "A Tiana trabalha dia e noite na animada cidade de Nova Orleans. Qual é o grande sonho que ela quer realizar com o seu próprio esforço?",
                opcoes: [
                    { texto: "A) Casar com um príncipe.", correta: false, feedback: "Hm, não é isso..." },
                    { texto: "B) Abrir o seu próprio restaurante.", correta: true, feedback: "Exatamente! Quase dá para sentir o cheiro dos beignets daqui!" },
                    { texto: "C) Cantar jazz.", correta: false, feedback: "Hm, não é isso..." }
                ]
            }
        ];

        const perguntasOutroMundo = [
            {
                icone: "assets/images/wig.png",
                pergunta: "Rumpelstiltskin sabia muito bem: quando alguém se cansa da rotina chata em família, assinar um acordo é uma benção. Você rastejou até aqui para fugir da sua casa cinzenta... Assinar o nosso acordo e aceitar os botões não é exatamente o que você desejava?",
                opcoes: [
                    { texto: "A) Você não vai me enganar! Eu não aceito acordo nenhum!", rebelde: true, feedback: "TARDE DEMAIS. O CONTRATO FOI ASSINADO QUANDO VOCÊ CRUZOU A PORTA" },
                    { texto: "B) Sim...", rebelde: false, feedback: "Viu como é simples? Quando a rotina sufoca, entregar-se à Outra Mãe é a única saída." },
                    { texto: "C) Sim... não quero voltar para casa.", rebelde: false, feedback: "Viu como é simples? Quando a rotina sufoca, entregar-se à Outra Mãe é a única saída." },
                ]
            },
            {
                icone: "assets/images/Gato Risonho sem fundo.png",
                pergunta: "O Gato Risonho avisou: 'Para quem não sabe para onde vai, qualquer caminho serve.' Você rastejou por aquela porta secreta sem rumo, apenas fugindo da sua vida chata. Se você nem sabia para onde estava indo, não é melhor ficar aqui conosco?",
                opcoes: [
                    { texto: "A) Sim... eu só queria fugir da solidão, então qualquer lugar com carinho serve.", rebelde: false, feedback: "Viu só? Quando você não sabe para onde vai, o nosso abraço é o único destino seguro que lhe resta..." },
                    { texto: "B) Não! Eu sei exatamente para onde vou: vou voltar para casa!", rebelde: true, feedback: "NÃO HÁ PARA ONDE FUGIR! VOCÊ JÁ ESTA PRESA NA ESCURIDÃO." },
                    { texto: "C) Sim... se a Outra Mãe me quer aqui, esse é o único caminho que importa.", rebelde: false, feedback: "Viu só? Quando você não sabe para onde vai, o nosso abraço é o único destino seguro que lhe resta..." },
                ]
            },
            {
                icone: "assets/images/sombra.png",
                pergunta: "O Homem da Sombra oferecia tudo o que as pessoas mais queriam em troca de suas almas, uma troca perfeita para a realização de um mundo perfeito. Se alguém realiza os seus maiores desejos e te salva da solidão, é mais do que justo dar algo em troca, não é? A sua Outra Mãe te deu o mundo perfeito que você sempre mereceu. Qual é a justa retribuição por essa boa ação?",
                opcoes: [
                    { texto: "A) Eu vou viver aqui para sempre.", rebelde: false, feedback: "Viu como é simples? É um preço tão pequeno por uma eternidade de realizações." },
                    { texto: "B) Eu vou ser a filha perfeita.", rebelde: false, feedback: "Viu como é simples? É um preço tão pequeno por uma eternidade de realizações." },
                    { texto: "C) Eu não te devo nada!", rebelde: true, feedback: "A INGRATIDÃO ESTRAGA A PERFEIÇÃO. A INGRATIDÃO ESTRAGA A PERFEIÇÃO. A INGRATIDÃO ESTRAGA A PERFEIÇÃO." }
                ]
            }
        ];

        function abrirComputador() {
            pcAtivo = true;
            movingLeft = false; movingRight = false; movingUp = false; movingDown = false;

            document.getElementById('joystickArea').style.display = 'none';
            document.querySelector('.action-buttons').style.display = 'none';
            dialogBox.style.display = 'none';

            isOutroMundo = faseOutroMundo || chaveUsada;

            const monitorBox = document.getElementById("monitorBox");
            const pcScreen = document.getElementById("pcScreen");
            const janelaHeader = document.getElementById("janelaHeader");
            const janelaTitulo = document.getElementById("janelaTitulo");
            const perguntaTexto = document.getElementById("perguntaTexto");
            const btnTeste = document.getElementById("btnTeste");
            const imgPC = document.getElementById('imgPC');

            if (isOutroMundo) {
                if (btnTeste) {
                    btnTeste.innerHTML = "MODO: OUTRO MUNDO";
                    btnTeste.style.backgroundColor = "#2b0000";
                }

                monitorBox.classList.add("outro-mundo-monitor"); 
                pcScreen.classList.add("outro-mundo-screen");
                janelaHeader.classList.add("outro-mundo-header"); 
                perguntaTexto.classList.add("outro-mundo-pergunta");
                janelaTitulo.innerHTML = "QUEM É A SUA MÃE FAVORITA?";
                imgPC.src = imagemPCOutroMundo;
            } else {
                if (btnTeste) {
                    btnTeste.innerHTML = "MODO: Mundo Real";
                    btnTeste.style.backgroundColor = "#d1506b";
                }

                monitorBox.classList.remove("outro-mundo-monitor"); 
                pcScreen.classList.remove("outro-mundo-screen");
                janelaHeader.classList.remove("outro-mundo-header"); 
                perguntaTexto.classList.remove("outro-mundo-pergunta");
                janelaTitulo.innerHTML = "Trivia Quiz v1.0";
                imgPC.src = imagemPCNormal;
            }

            perguntaAtualIndex = 0; 
            carregarPergunta();

            // Mostra a cena do PC
            document.getElementById('introScene').style.display = 'flex';
            imgPC.classList.remove('zoom-ativo');
            document.getElementById('quizInterface').style.opacity = '0';
            document.getElementById('quizInterface').style.pointerEvents = 'none';

            // disparA A TRANSIÇÃO AUTOMATICAMENTE APÓS 100 MILISSEGUNDOS
            setTimeout(() => {
                iniciarTransicao();
            }, 100);
        }

        function iniciarTransicao() {
            const img = document.getElementById('imgPC');
            const quizInterface = document.getElementById('quizInterface');

            img.classList.add('zoom-ativo');

            tocarSomLigar();

            setTimeout(() => {
                quizInterface.style.opacity = '1';
                quizInterface.style.pointerEvents = 'all';
            }, 2000);
        }

        function sairDoPC() {
            if (!pcAtivo) return;
            const img = document.getElementById('imgPC');
            const quizInterface = document.getElementById('quizInterface');

            // Esconde a interface do quiz suavemente
            quizInterface.style.opacity = '0';
            quizInterface.style.pointerEvents = 'none';

            setTimeout(() => {
                img.classList.remove('zoom-ativo');
                document.getElementById('introScene').style.display = 'none';
                
                document.getElementById('joystickArea').style.display = 'block';
                document.querySelector('.action-buttons').style.display = 'block';
                dialogBox.style.display = 'block';

                // Afasta um pouco a Lalai da mesa para não reabrir o PC imediatamente ao fechar
                playerX = 300;

                pcAtivo = false;
                emTransicao = false;
                
                requestAnimationFrame(updateGame);
            }, 500);
        }

        // Abertura do computador: clique do interruptor, zumbido do monitor aquecendo e um
        // acorde curto no tom da música atual (menor e levemente desafinado no Outro Mundo).
        function tocarSomLigar() {
            if (!window.MixagemAudio) return;
            const ac = MixagemAudio.contexto();
            const saida = MixagemAudio.saida('computador');
            const t = ac.currentTime;
            MixagemAudio.abrirEspaco(0.6, 1.6, 1.2);

            const clique = ac.createBufferSource();
            clique.buffer = criarRuidoBranco(ac);
            const filtroClique = ac.createBiquadFilter();
            filtroClique.type = 'bandpass';
            filtroClique.frequency.value = 1600;
            filtroClique.Q.value = 2;
            const ganhoClique = ac.createGain();
            ganhoClique.gain.setValueAtTime(0.1, t);
            ganhoClique.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            clique.connect(filtroClique); filtroClique.connect(ganhoClique); ganhoClique.connect(saida);
            clique.start(t); clique.stop(t + 0.05);

            const zumbido = ac.createOscillator();
            zumbido.type = 'triangle';
            zumbido.frequency.setValueAtTime(110, t);
            zumbido.frequency.linearRampToValueAtTime(120, t + 0.8);
            const filtroZumbido = ac.createBiquadFilter();
            filtroZumbido.type = 'lowpass';
            filtroZumbido.frequency.value = 500;
            const ganhoZumbido = ac.createGain();
            ganhoZumbido.gain.setValueAtTime(0, t);
            ganhoZumbido.gain.linearRampToValueAtTime(0.05, t + 0.4);
            ganhoZumbido.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
            zumbido.connect(filtroZumbido); filtroZumbido.connect(ganhoZumbido); ganhoZumbido.connect(saida);
            zumbido.start(t); zumbido.stop(t + 1.9);

            const tonica = 466.16 * Math.pow(2, (window.MusicaJogo ? MusicaJogo.transposicao() : 0) / 12);
            const intervalos = isOutroMundo ? [0, 3, 7] : [0, 4, 7];
            const filtroAcorde = ac.createBiquadFilter();
            filtroAcorde.type = 'lowpass';
            filtroAcorde.frequency.value = 2200;
            filtroAcorde.connect(saida);
            intervalos.forEach((semitons, i) => {
                const inicio = t + 0.35 + i * 0.16;
                const nota = ac.createOscillator();
                nota.type = 'triangle';
                nota.frequency.value = tonica * Math.pow(2, semitons / 12);
                if (isOutroMundo && i === 1) nota.detune.value = -18;
                const ganhoNota = ac.createGain();
                ganhoNota.gain.setValueAtTime(0, inicio);
                ganhoNota.gain.linearRampToValueAtTime(0.06, inicio + 0.02);
                ganhoNota.gain.exponentialRampToValueAtTime(0.001, inicio + 1.1);
                nota.connect(ganhoNota); ganhoNota.connect(filtroAcorde);
                nota.start(inicio); nota.stop(inicio + 1.15);
            });
        }

        function tocarSomAcertoPC() {
            if (!window.MixagemAudio) return;
            const ac = MixagemAudio.contexto();
            const t = ac.currentTime;
            const osc = ac.createOscillator(); const gain = ac.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
            gain.gain.setValueAtTime(0.08, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain); gain.connect(MixagemAudio.saida('computador')); osc.start(t); osc.stop(t + 0.2);
        }

        function carregarPergunta() {
            const container = document.getElementById("opcoesContainer");
            const perguntaTxt = document.getElementById("perguntaTexto");
            const feedbackTxt = document.getElementById("feedbackTexto");
            const pcScreen = document.getElementById("pcScreen");
            
            container.innerHTML = ""; feedbackTxt.innerHTML = "";
            perguntaTxt.classList.remove("glitch-effect"); feedbackTxt.classList.remove("glitch-effect"); pcScreen.classList.remove("shake-screen");
            const icone = document.getElementById("iconePersonagem"); icone.style.display = "none"; icone.classList.remove("popup-animacao");
            perguntaTxt.style.display = "block";
            document.getElementById("opcoesContainer").style.display = "block";

            let bancoAtual = isOutroMundo ? perguntasOutroMundo : perguntasReal;
            if (perguntaAtualIndex >= bancoAtual.length) perguntaAtualIndex = 0; 
            let dadosPergunta = bancoAtual[perguntaAtualIndex];
            perguntaTxt.innerHTML = dadosPergunta.pergunta;

            dadosPergunta.opcoes.forEach((opcao) => {
                let btn = document.createElement("button");
                btn.className = "btn-opcao";
                if (isOutroMundo) btn.classList.add("outro-mundo-btn");
                btn.innerHTML = opcao.texto;
                btn.onclick = () => verificarResposta(opcao);
                container.appendChild(btn);
            });
        }

        function verificarResposta(opcaoEscolhida) {
            const feedbackTxt = document.getElementById("feedbackTexto");
            const perguntaTxt = document.getElementById("perguntaTexto");
            const pcScreen = document.getElementById("pcScreen");
            const botoes = document.querySelectorAll('.btn-opcao');
            
            botoes.forEach(btn => btn.disabled = true);
            feedbackTxt.innerHTML = opcaoEscolhida.feedback;

            if (isOutroMundo) {
                if (opcaoEscolhida.rebelde) {
                    tocarSomSusto();
                    perguntaTxt.classList.add("glitch-effect"); 
                    feedbackTxt.classList.add("glitch-effect"); 
                    pcScreen.classList.add("shake-screen");

                    const icone = document.getElementById("iconePersonagem");
                    icone.classList.add("shake-screen"); // <--- Apenas aplica o tremor (sem glitch na imagem transparente)
                    let bancoAtual = perguntasOutroMundo;
                    
                    icone.style.opacity = "0"; 
                    icone.src = bancoAtual[perguntaAtualIndex].icone;
                    
                    icone.onload = function() {
                        icone.style.display = "block";
                        icone.style.opacity = "1";
                        icone.classList.remove("popup-animacao");
                        void icone.offsetWidth; 
                        icone.classList.add("popup-animacao");
                    };
                    
                    perguntaTxt.style.display = "none";
                    document.getElementById("opcoesContainer").style.display = "none";
                } else {
                    feedbackTxt.style.color = "#ff6666";
                }
            } else {
                if (opcaoEscolhida.correta) { 
                    feedbackTxt.style.color = "#ffff00"; 
                    tocarSomAcertoPC(); 
                } 
                else { feedbackTxt.style.color = "#ff9999"; tocarSomErro(); }
            }

            setTimeout(() => {
                perguntaAtualIndex++; carregarPergunta();
            }, 2500); 
        }

        function toggleWorld() {
            isOutroMundo = !isOutroMundo;
            const btnTeste = document.getElementById("btnTeste");
            const monitorBox = document.getElementById("monitorBox");
            const pcScreen = document.getElementById("pcScreen");
            const janelaHeader = document.getElementById("janelaHeader");
            const janelaTitulo = document.getElementById("janelaTitulo");
            const perguntaTexto = document.getElementById("perguntaTexto");
            const imgPC = document.getElementById('imgPC');

            sairDoPC();

            setTimeout(() => {
                if (isOutroMundo) {
                    if (btnTeste) {
                        btnTeste.innerHTML = "MODO: OUTRO MUNDO"; 
                        btnTeste.style.backgroundColor = "#2b0000";
                    }
                    btnVoltar.style.backgroundColor = "#330000";
                    btnVoltar.style.borderColor = "#ff0000";
                    btnVoltar.style.color = "#ffaaaa";

                    monitorBox.classList.add("outro-mundo-monitor"); 
                    pcScreen.classList.add("outro-mundo-screen");
                    janelaHeader.classList.add("outro-mundo-header"); 
                    perguntaTexto.classList.add("outro-mundo-pergunta");
                    janelaTitulo.innerHTML = "QUEM É A SUA MÃE FAVORITA?";
                    imgPC.src = imagemPCOutroMundo;
                } else {
                    if (btnTeste) {
                        btnTeste.innerHTML = "MODO: Mundo Real"; 
                        btnTeste.style.backgroundColor = "#d1506b";
                    }
                    btnVoltar.style.backgroundColor = "#5a4b80";
                    btnVoltar.style.borderColor = "#2c2440";
                    btnVoltar.style.color = "#ffffff";

                    monitorBox.classList.remove("outro-mundo-monitor"); 
                    pcScreen.classList.remove("outro-mundo-screen");
                    janelaHeader.classList.remove("outro-mundo-header"); 
                    perguntaTexto.classList.remove("outro-mundo-pergunta");
                    janelaTitulo.innerHTML = "Trivia Quiz v1.0";
                    imgPC.src = imagemPCNormal;
                }
                perguntaAtualIndex = 0; 
                carregarPergunta();
            }, 800);
        }
        // BLOQUEIA O CLIQUE DIREITO (MENU DE CONTEXTO) EM TUDO
        document.addEventListener('contextmenu', event => event.preventDefault());

        // BLOQUEIA O ARRASTAMENTO DE IMAGENS E ELEMENTOS DO JOGO
        document.addEventListener('dragstart', event => event.preventDefault());
        const dialogBoxPai = document.getElementById('dialogBoxPai'); // ADICIONA JUNTO DAS OUTRAS VARIÁVEIS CONST
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const dialogBox = document.getElementById('dialogBox');
        const dialogBoxLalai = document.getElementById('dialogBoxLalai');
        const choiceContainer = document.getElementById('choiceContainer');
        const keyIcon = document.getElementById('keyIcon');
        const tunelGif = document.getElementById('tunelGifOverlay');
        const portraitContainer = document.getElementById('portraitContainer');
        const imgFundo = document.getElementById('imgFundo');
        const imgTopo = document.getElementById('imgTopo');
        const portraitFrame = document.getElementById('portraitFrame');
        const outroPaiPortrait = document.getElementById('outroPaiPortrait');
        const flashScreen = document.getElementById('flashScreen');

        let playerX = canvas.width / 2 - 32;
        let playerY = 240;
        let playerSpeed = 1.0; 
        
        let movingLeft = false, movingRight = false, movingUp = false, movingDown = false;
        let isFacingLeft = false;
        
        let jaAvisoPorta = false; 
        let avisoPortaFeito = false;
        let missaoChaveAtiva = false;
        let temChave = false;
        let dialogoOutroPaiAtivo = false;
        let passoDialogoPai = 0;
        let chaveUsada = false; 
        let emTransicao = false;
        
        let faseOutroMundo = false; 
        let faseApresentacao = false;
        let indiceApresentacao = 0;
        let minigameOutroPaiAtivo = false;
        let piadaAtual = 0;
        let sustoEscadariaFeito = false;
        let saiuDoMinigame = false;
        let sustoOfficeFeito = false;
        let jumpScareCenarioAtivo = false;
        let missaoBobinskyAtiva = false;
        let emboscadaSalaDisparada = false;

        let gameLoopRunning = false;
        let saveInterval = null;
        let ultimoHashSalvo = null;
        let joystickDx = 0;
        let joystickDy = 0;

       function dispararEmboscadaSala() {
            if (emboscadaSalaDisparada) return;
            emboscadaSalaDisparada = true;

            emTransicao = true;
            movingLeft = false; movingRight = false; movingUp = false; movingDown = false;

            pararTemaCaixinhaDeMusica();
            pararSomSuspense();

            const ctxAudio = MixagemAudio.contexto();

            dialogBox.classList.remove("texto-assustado", "dialogo-proximo");
            dialogBox.style.display = "block";

            tocarSomEstrondo(ctxAudio);
        
            const canvasEl = document.getElementById('gameCanvas');
            canvasEl.classList.add("shake-screen");
            canvasEl.classList.add("obscuro");

            dialogBox.style.display = "block";
            dialogBox.classList.add("texto-assustado");
            dialogBox.innerHTML = "Lalai: Que... que estrondo foi esse?";

         
            setTimeout(() => {
                canvasEl.classList.remove("shake-screen");
            }, 600);

        
            agendar(() => {
                dialogBox.classList.remove("texto-assustado");
                dialogBox.innerHTML = "Lalai: O que está acontecendo? Eu não consigo ver nada!";

        
                agendar(() => {
                    tocarSomPortaRealista(ctxAudio);
                    dialogBox.innerHTML = "* Rangido metálico de uma porta se abrindo *";
                    
                    agendar(() => {
                        dialogBox.innerHTML = "Lalai: ...O-quê? De onde veio esse som?";
                        
                        agendar(() => {
                            dialogBox.innerHTML = "* Passos lentos ecoam no chão... *";
                            
                            let tempoAtual = ctxAudio.currentTime;
                            for(let i = 0; i < 5; i++) {
                                let volume = 0.2 + (0.15 * i);
                                tocarPassoUnico(ctxAudio, tempoAtual + (i * 0.65), volume);
                            }
                            
                            agendar(() => {
                            dialogBox.classList.add("texto-assustado");
                            dialogBox.innerHTML = "* ELE ESTÁ CORRENDO NA MINHA DIREÇÃO! *";
                            
                            let tempoCorrida = ctxAudio.currentTime;
                            for(let i = 0; i < 8; i++) {
                                tocarPassoUnico(ctxAudio, tempoCorrida + (i * 0.18), 1.2);
                            }
                                
                                agendar(() => {
                                    outroPaiPortrait.src = "assets/images/jumpscare.png";
                                    portraitFrame.style.display = "block";
                                    portraitFrame.classList.add("jumpscare");
                                    
                                    portraitFrame.classList.add("strobe");
                                    flashScreen.style.backgroundColor = "black";
                                    flashScreen.style.opacity = "1";
                                    
                                    dialogBox.style.display = "none";
                                    
                                    tocarSomSusto('captura');

                                    agendar(() => {
                                        flashScreen.classList.remove("strobe");
                                        flashScreen.style.opacity = "1";
                                        flashScreen.style.backgroundColor = "black";
                                        portraitFrame.style.display = "none";
                                        portraitFrame.classList.remove("strobe");
                                        
                                        agendar(() => {
                                            document.getElementById('telaPretaFase2').style.opacity = "1";
                                        }, 1500);

                                    }, 4000);

                                }, 8 * 180);

                            }, 5 * 650);
                        }, 1500);
                    }, 2500);
                }, 3000);

            }, 2000); 
        }

        const loopPiadas = [
            "Sabia que você ia adorar! Aqui vai mais uma: Você sabe qual é a fruta que fica pulando de galho em galho? É o morangotango! HA HA HA!",
            "Ah, esse seu sorriso aquece o meu coração! Aqui vai mais uma: Você sabe qual é a água mais rápida do mundo? A Aguinha Pocotó! HA HA HA! Entendeu? Pocotó!",
            "Você é sempre meu melhor público! Deixa eu te contar outra então... Qual é o campeonato organizado apenas entre pessoas que não falam? É a Copa do Mudo! HA HA HA!"
        ];

        let isStepFrame = false;  
        let animCounter = 0;      
        let catieStepFrame = false;  
        let catieAnimCounter = 0;   
        let animandoChave = false;
        let chaveY = 0;
        let tempoAnimacaoChave = 0;

        let timeouts = [];
        let somSuspense = null;

        function agendar(funcao, tempo) {
            let t = setTimeout(funcao, tempo);
            timeouts.push(t);
        }
        function limparAgendamentos() {
            timeouts.forEach(clearTimeout);
            timeouts = [];
        }

        // SISTEMA DE ÁUDIO DE SUSPENSE PARA O MINIGAME
        function iniciarSomSuspense() {
            pararSomSuspense();
            if (!window.MixagemAudio) return;
            const ac = MixagemAudio.contexto();
            const t = ac.currentTime;

            const osc1 = ac.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(48, t);

            const osc2 = ac.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(52, t);

            const filter = ac.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(180, t);

            // Antes 0.5: as duas serras somadas saturavam. Agora o drone fica no nível da música, por baixo dela.
            const ganho = ac.createGain();
            ganho.gain.setValueAtTime(0, t);
            ganho.gain.linearRampToValueAtTime(0.07, t + 2.5);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(ganho);
            ganho.connect(MixagemAudio.saida('suspense'));

            osc1.start(t);
            osc2.start(t);
            somSuspense = { ac: ac, osc1: osc1, osc2: osc2, ganho: ganho };
        }

        function pararSomSuspense() {
            if (!somSuspense) return;
            const s = somSuspense;
            somSuspense = null;
            const t = s.ac.currentTime;
            s.ganho.gain.cancelScheduledValues(t);
            s.ganho.gain.setValueAtTime(s.ganho.gain.value, t);
            s.ganho.gain.linearRampToValueAtTime(0, t + 0.4);
            s.osc1.stop(t + 0.45);
            s.osc2.stop(t + 0.45);
            setTimeout(() => { try { s.ganho.disconnect(); } catch (e) {} }, 600);
        }
        // Música do Mundo Real — atmosfera do Efeito Disney (js/musica/musica-jogo.js)
        function iniciarMusicaMundoReal() {
            if (!window.MusicaJogo) return;
            MusicaJogo.tocar('mundoreal');
        }

        function fadeOutMusicaMundoReal() {
            if (!window.MusicaJogo) return;
            MusicaJogo.pararSe('mundoreal', 2.0);
        }

        function pararMusicaMundoReal() {
            if (!window.MusicaJogo) return;
            MusicaJogo.pararSe('mundoreal', 0.5);
        }

        // Música da tela de abertura (livro fechado). Sem permissão de áudio, o navegador
        // só a libera no primeiro toque, clique ou tecla.
        function iniciarMusicaAbertura() {
            if (!window.MusicaJogo) return;
            MusicaJogo.tocar('mundoreal', { fadeEntrada: 3.0 });
        }

        // Minigame do Outro Pai: a música muda no mesmo instante do evento da cena (modo 'agora',
        // ~0,35 s), sem esperar frase nem diálogo. Fades curtos na tensão, longos nos momentos tranquilos.
        const TRANSICOES_MINIGAME = {
            outromundo: { fadeSaida: 2.5, fadeEntrada: 1.5 },
            esperanca:  { fadeSaida: 2.5, fadeEntrada: 1.5 },
            estranheza: { fadeSaida: 1.2, fadeEntrada: 0.6 },
            suspense:   { fadeSaida: 0.8, fadeEntrada: 0.3 },
            perigo:     { fadeSaida: 0.4, fadeEntrada: 0.15 }
        };

        // Os instrumentos das atmosferas do minigame já são carregados na entrada,
        // para nenhuma troca esperar o download das amostras.
        function atmosferaMinigame(atmosfera) {
            if (!window.MusicaJogo) return;
            MusicaJogo.preparar(['estranheza', 'suspense', 'perigo', 'esperanca']);
            const fades = TRANSICOES_MINIGAME[atmosfera];
            MusicaJogo.tocar(atmosfera, { modo: 'agora', fadeSaida: fades.fadeSaida, fadeEntrada: fades.fadeEntrada });
        }

        // Ameaça imediata do Outro Pai
        function perigoMinigame() {
            atmosferaMinigame('perigo');
        }

        function interromperMusica(fade) {
            if (!window.MusicaJogo) return;
            MusicaJogo.parar(fade);
        }
        // FUNÇÃO DO SOM AMBIENTE (Toca baixinho e continuamente)
        function iniciarSomAmbienteOutroMundo() {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            // Se já estiver a tocar, não reinicia
            if (audioAmbienteCtx) return; 

            audioAmbienteCtx = new AudioContext();

            // Oscilador 1: Som grave e profundo
            const oscGrave = audioAmbienteCtx.createOscillator();
            oscGrave.type = 'sine';
            oscGrave.frequency.setValueAtTime(45, audioAmbienteCtx.currentTime); 

            // Oscilador 2: Leve dissonância para incomodar
            const oscDissonante = audioAmbienteCtx.createOscillator();
            oscDissonante.type = 'triangle';
            oscDissonante.frequency.setValueAtTime(55, audioAmbienteCtx.currentTime);

            // Filtro para abafar o som (estilo "debaixo d'água" ou "lugar abafado")
            const filter = audioAmbienteCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, audioAmbienteCtx.currentTime);

            ambienteGainNode = audioAmbienteCtx.createGain();
            ambienteGainNode.gain.setValueAtTime(0, audioAmbienteCtx.currentTime);
            
            // Sobe o volume bem devagar (3 segundos) para não assustar, mantendo bem baixo (0.3)
            ambienteGainNode.gain.linearRampToValueAtTime(0.3, audioAmbienteCtx.currentTime + 3); 

            oscGrave.connect(filter);
            oscDissonante.connect(filter);
            filter.connect(ambienteGainNode);
            ambienteGainNode.connect(audioAmbienteCtx.destination);

            oscGrave.start();
            oscDissonante.start();
        }
        // Jumpscare: corpo que despenca com os agudos filtrados, subgrave de impacto e rajada abafada.
        // Os sustos narrativos ganham também um "grito" na região média (600 Hz–2 kHz): é o que
        // caixas de notebook e tablet reproduzem — o subgrave sozinho quase não se ouve nelas —
        // e fica abaixo da faixa estridente (o filtro corta acima de ~3 kHz).
        // Calibração por tipo de susto (ganhos de cada camada; duração em segundos; corte do ruído em Hz).
        // Foto: susto de exploração. Outro Pai: clímax do minigame. Captura: o mais forte, com a música em silêncio.
        const PERFIS_SUSTO = {
            padrao:   { corpo: 0.21, grito: 0,    sub: 0.32, ruido: 0.13, corteRuido: 2200, duracao: 0.9, espaco: 0.35 },
            foto:     { corpo: 0.22, grito: 0.22, sub: 0.2,  ruido: 0.11, corteRuido: 1600, duracao: 0.9, espaco: 0.3 },
            outroPai: { corpo: 0.24, grito: 0.3,  sub: 0.24, ruido: 0.14, corteRuido: 1600, duracao: 1.1, espaco: 0.3 },
            captura:  { corpo: 0.3,  grito: 0.28, sub: 0.3,  ruido: 0.14, corteRuido: 1600, duracao: 1.5, espaco: 0.3 }
        };

        function tocarSomSusto(tipo) {
            if (!window.MixagemAudio) return;
            const p = PERFIS_SUSTO[tipo] || PERFIS_SUSTO.padrao;
            const ac = MixagemAudio.contexto();
            const saida = MixagemAudio.saida('susto');
            const t = ac.currentTime;
            const escala = p.duracao / 0.9;
            MixagemAudio.abrirEspaco(p.espaco, p.duracao + 0.1, 1.8);

            const corpo = ac.createOscillator();
            corpo.type = 'sawtooth';
            corpo.frequency.setValueAtTime(240, t);
            corpo.frequency.exponentialRampToValueAtTime(45, t + 0.7 * escala);
            const filtroCorpo = ac.createBiquadFilter();
            filtroCorpo.type = 'lowpass';
            filtroCorpo.Q.value = 0.9;
            filtroCorpo.frequency.setValueAtTime(1800, t);
            filtroCorpo.frequency.exponentialRampToValueAtTime(250, t + 0.7 * escala);
            const ganhoCorpo = ac.createGain();
            ganhoCorpo.gain.setValueAtTime(0.0001, t);
            ganhoCorpo.gain.exponentialRampToValueAtTime(p.corpo, t + 0.012);
            ganhoCorpo.gain.exponentialRampToValueAtTime(0.001, t + p.duracao);
            corpo.connect(filtroCorpo); filtroCorpo.connect(ganhoCorpo); ganhoCorpo.connect(saida);
            corpo.start(t); corpo.stop(t + p.duracao + 0.05);

            const sub = ac.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(120, t);
            sub.frequency.exponentialRampToValueAtTime(38, t + 0.5 * escala);
            const ganhoSub = ac.createGain();
            ganhoSub.gain.setValueAtTime(0.0001, t);
            ganhoSub.gain.exponentialRampToValueAtTime(p.sub, t + 0.008);
            ganhoSub.gain.exponentialRampToValueAtTime(0.001, t + 0.7 * escala);
            sub.connect(ganhoSub); ganhoSub.connect(saida);
            sub.start(t); sub.stop(t + 0.7 * escala + 0.05);

            const ruido = ac.createBufferSource();
            ruido.buffer = criarRuidoBranco(ac);
            const filtroRuido = ac.createBiquadFilter();
            filtroRuido.type = 'lowpass';
            filtroRuido.frequency.value = p.corteRuido;
            const ganhoRuido = ac.createGain();
            ganhoRuido.gain.setValueAtTime(p.ruido, t);
            ganhoRuido.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            ruido.connect(filtroRuido); filtroRuido.connect(ganhoRuido); ganhoRuido.connect(saida);
            ruido.start(t); ruido.stop(t + 0.3);

            if (p.grito > 0) {
                const passaFaixa = ac.createBiquadFilter();
                passaFaixa.type = 'bandpass';
                passaFaixa.frequency.value = 900;
                passaFaixa.Q.value = 0.9;
                const corteAgudo = ac.createBiquadFilter();
                corteAgudo.type = 'lowpass';
                corteAgudo.frequency.value = 1800;
                const ganhoGrito = ac.createGain();
                ganhoGrito.gain.setValueAtTime(0.0001, t);
                ganhoGrito.gain.exponentialRampToValueAtTime(p.grito, t + 0.01);
                ganhoGrito.gain.exponentialRampToValueAtTime(0.001, t + p.duracao * 0.85);
                passaFaixa.connect(corteAgudo); corteAgudo.connect(ganhoGrito); ganhoGrito.connect(saida);
                // Duas vozes levemente desafinadas entre si: o batimento dá a aspereza do grito
                [560, 590].forEach((inicio) => {
                    const voz = ac.createOscillator();
                    voz.type = 'sawtooth';
                    voz.frequency.setValueAtTime(inicio, t);
                    voz.frequency.exponentialRampToValueAtTime(inicio * 0.34, t + p.duracao * 0.7);
                    voz.connect(passaFaixa);
                    voz.start(t); voz.stop(t + p.duracao * 0.85 + 0.05);
                });
            }
        }
    function tocarSomEstrondo(ctxAudio) {
            const duration = 1.5;
            const tempoBase = ctxAudio.currentTime;
            MixagemAudio.abrirEspaco(0.4, 1.5, 1.5);

            // Sub-grave profundo para o impacto do estrondo
            const osc = ctxAudio.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, tempoBase);
            osc.frequency.exponentialRampToValueAtTime(15, tempoBase + duration);

            // O filtro tira o zumbido agudo da serra e mantém o ronco
            const filtro = ctxAudio.createBiquadFilter();
            filtro.type = 'lowpass';
            filtro.frequency.value = 700;

            const gainNode = ctxAudio.createGain();
            gainNode.gain.setValueAtTime(0.5, tempoBase);
            gainNode.gain.exponentialRampToValueAtTime(0.01, tempoBase + duration);

            osc.connect(filtro);
            filtro.connect(gainNode);
            gainNode.connect(MixagemAudio.saida('impacto'));
            osc.start(tempoBase);
            osc.stop(tempoBase + duration);
        }
        function criarRuidoBranco(contexto) {
            const bufferSize = contexto.sampleRate * 2;
            const buffer = contexto.createBuffer(1, bufferSize, contexto.sampleRate);
            const dados = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                dados[i] = Math.random() * 2 - 1;
            }
            return buffer;
        }

        // SÍNTESE DA PORTA A RANGER
        function tocarSomPortaRealista(ctxAudio) {
            const duration = 2.0;
            const tempoBase = ctxAudio.currentTime;
            const saida = MixagemAudio.saida('impacto');
            const ruidoSrc = ctxAudio.createBufferSource();
            ruidoSrc.buffer = criarRuidoBranco(ctxAudio);

            const filtroRuido = ctxAudio.createBiquadFilter();
            filtroRuido.type = 'bandpass';
            filtroRuido.frequency.setValueAtTime(300, tempoBase);
            filtroRuido.frequency.exponentialRampToValueAtTime(800, tempoBase + duration);
            filtroRuido.Q.value = 15;

            const gainRuido = ctxAudio.createGain();
            gainRuido.gain.setValueAtTime(0, tempoBase);
            gainRuido.gain.linearRampToValueAtTime(0.35, tempoBase + 0.2);
            gainRuido.gain.exponentialRampToValueAtTime(0.01, tempoBase + duration);

            ruidoSrc.connect(filtroRuido);
            filtroRuido.connect(gainRuido);
            gainRuido.connect(saida);
            ruidoSrc.start(tempoBase);
            ruidoSrc.stop(tempoBase + duration);

            const osc = ctxAudio.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, tempoBase);
            osc.frequency.exponentialRampToValueAtTime(30, tempoBase + duration);

            const gainOsc = ctxAudio.createGain();
            gainOsc.gain.setValueAtTime(0, tempoBase);
            gainOsc.gain.linearRampToValueAtTime(0.22, tempoBase + 0.3);
            gainOsc.gain.exponentialRampToValueAtTime(0.01, tempoBase + duration);

            osc.connect(gainOsc);
            gainOsc.connect(saida);
            osc.start(tempoBase);
            osc.stop(tempoBase + duration);
        }

        // SÍNTESE DO PASSO
        function tocarPassoUnico(ctxAudio, tempoExato, volumeMultiplicador) {
            const duracaoGrave = 0.08;
            const duracaoAgudo = 0.04;
            const saida = MixagemAudio.saida('impacto');

            const oscImpacto = ctxAudio.createOscillator();
            oscImpacto.type = 'sine';
            oscImpacto.frequency.setValueAtTime(120, tempoExato);
            oscImpacto.frequency.exponentialRampToValueAtTime(20, tempoExato + duracaoGrave);

            const gainImpacto = ctxAudio.createGain();
            gainImpacto.gain.setValueAtTime(0, tempoExato);
            gainImpacto.gain.linearRampToValueAtTime(0.35 * volumeMultiplicador, tempoExato + 0.01);
            gainImpacto.gain.exponentialRampToValueAtTime(0.01, tempoExato + duracaoGrave);

            oscImpacto.connect(gainImpacto);
            gainImpacto.connect(saida);
            oscImpacto.start(tempoExato);
            oscImpacto.stop(tempoExato + duracaoGrave);

            const ruidoSrc = ctxAudio.createBufferSource();
            ruidoSrc.buffer = criarRuidoBranco(ctxAudio);

            const filtroSola = ctxAudio.createBiquadFilter();
            filtroSola.type = 'bandpass';
            filtroSola.frequency.value = 1200;
            filtroSola.Q.value = 1.5;

            const gainSola = ctxAudio.createGain();
            gainSola.gain.setValueAtTime(0, tempoExato);
            gainSola.gain.linearRampToValueAtTime(0.18 * volumeMultiplicador, tempoExato + 0.01);
            gainSola.gain.exponentialRampToValueAtTime(0.01, tempoExato + duracaoAgudo);

            ruidoSrc.connect(filtroSola);
            filtroSola.connect(gainSola);
            gainSola.connect(saida);
            ruidoSrc.start(tempoExato);
            ruidoSrc.stop(tempoExato + duracaoAgudo);
        }
        // tipo 'alarme': o "ANORMALIDADE DETECTADA" do minigame, mais presente que o erro do quiz
        function tocarSomErro(tipo) {
            if (!window.MixagemAudio) return;
            const audioCtx = MixagemAudio.contexto();
            const saida = MixagemAudio.saida('interface');
            const volume = tipo === 'alarme' ? 0.2 : 0.11;
            MixagemAudio.abrirEspaco(tipo === 'alarme' ? 0.55 : 0.7, 1.2, 1.0);
            for(let i=0; i<4; i++) {
                setTimeout(() => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    // O filtro arredonda a aspereza da onda quadrada sem mudar o bipe
                    const filtro = audioCtx.createBiquadFilter();
                    filtro.type = 'lowpass';
                    filtro.frequency.value = 1800;
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                    osc.connect(filtro);
                    filtro.connect(gain);
                    gain.connect(saida);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.2);
                }, i * 300);
            }
        }

        // Música do Outro Mundo — atmosfera do Efeito Disney (js/musica/musica-jogo.js)
        function iniciarTemaCaixinhaDeMusica() {
            if (!window.MusicaJogo) return;
            MusicaJogo.tocar('outromundo', { fadeEntrada: 3.0 });
        }

        // Também para as atmosferas que derivam do Outro Mundo no minigame (ex.: Esperança após a pista do Bobinsky).
        function pararTemaCaixinhaDeMusica() {
            if (!window.MusicaJogo) return;
            const atual = MusicaJogo.atmosfera();
            if (atual && atual !== 'mundoreal') MusicaJogo.parar(0.3);
        }

        function dispararJumpscareCenario(imagemAssombrada) {
            jumpScareCenarioAtivo = true; 
            
            const cenarioAntigo = mapaCasa[cenarioAtual].img;
            mapaCasa[cenarioAtual].img = imagemAssombrada;
            
            tocarSomSusto('foto');
            flashScreen.classList.add("strobe");
            
            // O susto dura exatamente 800 milissegundos com a imagem assombrada e o piscar ativados em conjunto
            setTimeout(() => {
                mapaCasa[cenarioAtual].img = cenarioAntigo;
                flashScreen.classList.remove("strobe");
                
                // Devolve o controlo e mostra o balão de texto instantaneamente sem pausas secas
                jumpScareCenarioAtivo = false;
                dialogBox.style.display = "block";
                dialogBox.innerHTML = "Lalai: O... o que foi isso?!";
            }, 800);
        }

        // IMAGENS DOS CENÁRIOS
        const imgSala = new Image(); imgSala.src = 'assets/images/sala.png'; 
        const imgEscadaria = new Image(); imgEscadaria.src = 'assets/images/escadaria.png'; 
        const imgCozinha = new Image(); imgCozinha.src = 'assets/images/kitchen.png'; 
        const imgStorage = new Image(); imgStorage.src = 'assets/images/storage.png'; 
        const imgOffice = new Image(); imgOffice.src = 'assets/images/office.png'; 
        const imgOfficeAssombrado = new Image(); imgOfficeAssombrado.src = 'assets/images/office assombrado.png'; 
        const imgEscadariaAssombrada = new Image(); imgEscadariaAssombrada.src = 'assets/images/escadaria assombrada.png';

        // IMAGENS PERSONAGENS
        const imgPlayer = new Image(); imgPlayer.src = 'assets/images/principal.png'; 
        const imgPlayerPasso = new Image(); imgPlayerPasso.src = 'assets/images/principal_passo.png'; 
        const imgDog = new Image(); imgDog.src = 'assets/images/catie.png'; 
        const imgDogPasso = new Image(); imgDogPasso.src = 'assets/images/catie_passo.png';
        const imgChave = new Image(); imgChave.src = 'assets/images/chave.png';

        const imgOutraMae = new Image(); imgOutraMae.src = 'assets/images/outra_mae.png'; 
        const imgOutraMaeReal = new Image(); imgOutraMaeReal.src = 'assets/images/outra_mae_real.png';
        const imgOutroPai = new Image(); imgOutroPai.src = 'assets/images/outro_pai.png'; 
        const imgBobinsky = new Image(); imgBobinsky.src = 'assets/images/bobinsky.png';
        const imgOutroPaiCorpo = new Image(); imgOutroPaiCorpo.src = 'assets/images/outropai_personagem.png';

        let dogX = playerX - 30;
        let dogY = playerY + 20; 

       // GESTOR DE CENÁRIOS, LIMITES E SPAWNS (ATUALIZADO PARA 640x360)
        let cenarioAtual = "escadaria"; // Inicia na escadaria

        const mapaCasa = {
            sala: {
                img: imgSala,
                limiteEsquerdo: 0,
                limiteDireito: 540,
                chao: 175,
                portas: [
                    { x: 0, largura: 80, destino: "escadaria", spawnX: 520, gatilho: "esquerda" } 
                ],
                npc: null
            },
            escadaria: {
                img: imgEscadaria,
                limiteEsquerdo: 5,   
                limiteDireito: 550,   
                chao: 162,        
                portas: [
                    { x: 50, largura: 60, destino: "storage", spawnX: 60, gatilho: "cima" },
                    { x: 330, largura: 60, destino: "cozinha", spawnX: 20, gatilho: "cima" }, 
                    { x: 500, largura: 60, destino: "sala", spawnX: 10, gatilho: "direita" }     
                ],
                npc: null
            },
            cozinha: {
                img: imgCozinha,
                limiteEsquerdo: 10,
                limiteDireito: 530,
                chao: 180,
                portas: [
                    { x: 0, largura: 70, destino: "escadaria", spawnX: 300, gatilho: "esquerda" } 
                ],
                npc: null
            },
            storage: {
                img: imgOffice,
                limiteEsquerdo: 30,
                limiteDireito: 540,
                chao: 180,
                portas: [
                    { x: 0, largura: 70, destino: "escadaria", spawnX: 80, gatilho: "cima" } 
                ],
                npc: {
                    id: "outroPai",
                    img: imgOutroPaiCorpo, 
                    x: 420, 
                    y: 110, 
                    largura: 80,
                    interagivel: true
                }
            }
        };

        function tentarMudarCenario(teclaPressionada) {
            if (emTransicao || faseApresentacao || minigameOutroPaiAtivo) return; 

            const salaDados = mapaCasa[cenarioAtual];

            for (let i = 0; i < salaDados.portas.length; i++) {
                let porta = salaDados.portas[i];
                
                if (playerX >= porta.x && playerX <= (porta.x + porta.largura)) {
                    if (porta.gatilho === teclaPressionada || teclaPressionada === "acao") {
                        
                        let origem = cenarioAtual;
                        cenarioAtual = porta.destino;
                        playerX = porta.spawnX !== undefined ? porta.spawnX : 100;
                        dogX = playerX + (isFacingLeft ? 65 : -65);
                        
                        if (cenarioAtual === "storage" && chaveUsada && !missaoBobinskyAtiva) {
                            dialogBox.style.display = "block";
                            dialogBox.innerHTML = "Lalai: Ele está tão estranho... Por que ele está ali parado?";
                        }
            
                        else if (origem === "storage" && cenarioAtual === "escadaria" && missaoBobinskyAtiva) {
                            dialogBox.style.display = "block";
                            dialogBox.innerHTML = "Lalai: Preciso encontrar o Sr. Bobinsky e descobrir sobre essas fendas...";
                        }

                        salvarProgresso();
                        return;
                    }
                }
            }
        }

       // FUNÇÃO PARA FALAR COM NPCS / INTERAGIR
        function interagir() {
            if (emTransicao || faseApresentacao || minigameOutroPaiAtivo || pcAtivo) return;

            if (cenarioAtual === "storage" && playerX >= 210 && playerX <= 330) {
                abrirComputador();
                return;
            }

            const salaAtual = mapaCasa[cenarioAtual];
            
            if (chaveUsada && salaAtual.npc && salaAtual.npc.interagivel) {
                if (Math.abs(playerX - salaAtual.npc.x) < 80) {
                    iniciarMinigameOutroPai();
                    return; 
                }
            }

            tentarMudarCenario("acao");
        }
function mudarRetratoOutroPai(novaSrc, efeito = "rapido") {
            if (efeito === "susto") {
                outroPaiPortrait.style.transition = "none"; 
                outroPaiPortrait.src = novaSrc;
                portraitFrame.classList.add("jumpscare"); 
            } else if (efeito === "obscuro") {
                outroPaiPortrait.style.transition = "opacity 0.75s ease-in-out, filter 0.75s ease-in-out";
                outroPaiPortrait.classList.add("escurecer-retrato");
                setTimeout(() => {
                    outroPaiPortrait.src = novaSrc;
                    outroPaiPortrait.classList.remove("escurecer-retrato"); 
                    setTimeout(() => {
                        outroPaiPortrait.style.transition = "opacity 0.15s ease-in-out, filter 0.15s ease-in-out";
                    }, 750);
                }, 750); 
            } else {
                if (outroPaiPortrait.src.includes(novaSrc)) return; 
                outroPaiPortrait.style.transition = "opacity 0.15s ease-in-out, filter 0.15s ease-in-out";
                outroPaiPortrait.classList.add("escurecer-retrato");
                setTimeout(() => {
                    outroPaiPortrait.src = novaSrc;
                    outroPaiPortrait.classList.remove("escurecer-retrato");
                }, 150); 
            }
        }
        function iniciarMinigameOutroPai() {
            minigameOutroPaiAtivo = true;
            canvas.style.display = "none";
            
            // LIMPA QUALQUER ZOOM OU CLASSE DE SUSTO ANTERIOR
            portraitFrame.classList.remove("jumpscare");
            portraitFrame.style.transform = "translateX(-50%) scale(1)";
            portraitFrame.style.display = "block";
            
            // ESCONDE OS CONTROLES DO JOGO
            document.getElementById('joystickArea').style.display = 'none';
            document.querySelector('.action-buttons').style.display = 'none';
            
            outroPaiPortrait.src = "assets/images/happy.png"; 
            dialogBoxLalai.style.display = "none"; 
            dialogBox.style.display = "none"; 
            
            dialogBoxPai.style.display = "block";
            dialogBoxPai.innerHTML = "Ei, Lalai! Que bom que você está aqui. Quer ouvir uma piada, querida? Sabe o que o zero disse para o oito? 'Que belo cinto!' HA HA HA!";
            
            mostrarOpcoesPrincipais();
        }

        function mostrarOpcoesPrincipais() {
            atmosferaMinigame('outromundo');
            // Remove o efeito de jumpscare / escala se ele tiver ficado ativo
            portraitFrame.classList.remove("jumpscare");
            outroPaiPortrait.style.transform = "none"; // Garante o tamanho normal do retrato
            
            dialogBoxLalai.style.display = "none";
            dialogBoxPai.classList.remove("desespero");
            mudarRetratoOutroPai("assets/images/happy.png");
            
            dialogBoxPai.innerHTML = "Ei, Lalai! Quer ouvir uma piada, querida? Sabe o que o zero disse para o oito? 'Que belo cinto!' HA HA HA!";
            dialogBoxPai.style.display = "block";

            choiceContainer.innerHTML = `
                <button class="btn-choice" onclick="escolhaMinigame('A')">Forçar o riso</button>
                <button class="btn-choice" onclick="escolhaMinigame('B')">Séria e direta</button>
                <button class="btn-choice" onclick="escolhaMinigame('C')">Contar outra piada pra ele</button>
            `;
            choiceContainer.style.display = "flex";
        }

        window.escolhaMinigame = function(opcao) {
            limparAgendamentos(); 
            dialogBoxPai.style.display = "none"; 
            
            if (opcao !== 'C_SAIR' && opcao !== 'C_VOLTAR') {
                dialogBoxLalai.style.display = "block"; 
            }
            
            const fundoDaSala = document.getElementById('gameCanvas');

            if (opcao === 'A') {
                pararSomSuspense();
                choiceContainer.style.display = "none"; 
                fundoDaSala.classList.remove("obscuro"); 
                
                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Haha... sim, muito engraçado."; 

                agendar(() => {
                    dialogBoxLalai.style.display = "none"; 
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/happy.png"); 
                        
                        // Mostra a piada atual da lista rotativa
                        dialogBoxPai.innerHTML = loopPiadas[piadaAtual]; 
                        dialogBoxPai.style.display = "block"; 
                  
                        piadaAtual++;
                        if (piadaAtual >= loopPiadas.length) piadaAtual = 0; 
                        
                        choiceContainer.style.display = "flex";
                    }, 150); 
                }, 3500); 
            }
            else if (opcao === 'B') {
                choiceContainer.innerHTML = `
                    <button class="btn-choice" onclick="escolhaMinigame('B1')">Recuar e ouvir outra piada</button>
                    <button class="btn-choice" onclick="escolhaMinigame('B2')">Quero sair daqui agora!</button>
                `;
                
                dialogBoxLalai.innerHTML = "Eu preciso ir embora. Onde está a saída?"; 
                fundoDaSala.classList.add("obscuro"); 
                iniciarSomSuspense(); 
                atmosferaMinigame('suspense');
                mudarRetratoOutroPai("assets/images/sinister.png", "obscuro");
                
                agendar(() => {
                    dialogBoxLalai.style.display = "none"; 
                    agendar(() => {
                        dialogBoxPai.innerHTML = "Ir... embora? Mas este mundo foi costurado à sua medida. A sua Outra Mãe não gosta de crianças ingratas, Lalai. A ingratidão estraga a perfeição.";
                        dialogBoxPai.style.display = "block"; 
                    }, 200); 
                }, 4500); 
            }
            else if (opcao === 'B1') {
                pararSomSuspense();
                mostrarOpcoesPrincipais(); 
                dialogBoxLalai.innerHTML = "Tem razão... acho que prefiro ouvir mais uma piada.";
                
                fundoDaSala.classList.remove("obscuro"); 
                mudarRetratoOutroPai("assets/images/happy.png", "obscuro"); 

                agendar(() => {
                    dialogBoxLalai.style.display = "none"; 
                    agendar(() => {
                        dialogBoxPai.innerHTML = "Ah, muito melhor!<br><br>" + loopPiadas[piadaAtual];
                        dialogBoxPai.style.display = "block"; 
                        piadaAtual++;
                        if (piadaAtual >= loopPiadas.length) piadaAtual = 0; 
                    }, 200); 
                }, 4500);
            }
            else if (opcao === 'B2') {
                pararSomSuspense();
                perigoMinigame();
                choiceContainer.style.display = "none"; 
                dialogBoxLalai.style.display = "none";
                
                tocarSomErro('alarme');
                
                dialogBoxPai.innerHTML = "ANORMALIDADE DETECTADA";
                dialogBoxPai.style.display = "block";
                
                agendar(() => {
                    tocarSomSusto('outroPai');
                    mudarRetratoOutroPai("assets/images/jumpscare.png", "susto"); 

                    dialogBoxPai.classList.add("desespero");
                    dialogBoxPai.innerHTML = "ElA Te OuViu!!!!";
                    flashScreen.classList.add("strobe");
                    
                    agendar(() => {
                        flashScreen.classList.remove("strobe");
                        flashScreen.style.transition = "none"; 
                        flashScreen.style.backgroundColor = "#000";
                        flashScreen.style.opacity = "1";
                        interromperMusica(1.0);
                        dialogBoxPai.style.display = "none";
                        dialogBoxPai.classList.remove("desespero");
                        
                        dialogBoxLalai.style.display = "none"; 
                        
                        portraitFrame.classList.remove("jumpscare"); 
                        portraitFrame.style.display = "none"; 
                        
                        agendar(() => {
                            flashScreen.style.transition = "opacity 1s ease-in-out";
                            flashScreen.style.opacity = "0";

                            minigameOutroPaiAtivo = false;
                            canvas.style.display = "block";

                            document.getElementById('joystickArea').style.display = 'block';
                            document.querySelector('.action-buttons').style.display = 'block';

                            cenarioAtual = "escadaria";
                            playerX = 100;
                            playerY = 160;
                            saiuDoMinigame = false;

                            fundoDaSala.classList.remove("obscuro");

                            dialogBox.style.display = "block";
                            dialogBox.innerHTML = "Lalai: Por pouco... Preciso ter cuidado com o que digo a ele.";
                            
                            iniciarTemaCaixinhaDeMusica(); 
                            updateGame();
                        }, 1000);
                    }, 2200); 
                }, 1800); 
            }
            else if (opcao === 'C') {
                pararSomSuspense();
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";
                
                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Sabe qual documento o Thor usa pra provar que é quem diz ser?<br>O título de <i>ele é Thor</i>."; 
                
                agendar(() => {
                    dialogBoxLalai.style.display = "none"; 
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/confused.png"); 
                        atmosferaMinigame('estranheza');
                        dialogBoxPai.innerHTML = "Thor? Ele... eleitor? Mas... Essa piada não faz sentido, nós não precisamos de eleições ou escolhas aqui, Lalai. A sua Outra Mãe já organizou tudo para que este mundo seja perfeito para você.";
                        dialogBoxPai.style.display = "block";

                        choiceContainer.innerHTML = `
                            <button class="btn-choice" onclick="escolhaMinigame('C1')">Insistir: se ninguém escolhe nada aqui, não é possível mudar de ideia?</button>
                            <button class="btn-choice" onclick="escolhaMinigame('C2')">Concordar: É... acho que você tem razão, as coisas já são perfeitas assim.</button>
                        `;
                        choiceContainer.style.display = "flex";
                    }, 150);
                }, 4500);
            }
            else if (opcao === 'C1') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Eleitor? Não, eu disse Thor, o herói. Mas falando em escolhas... se ninguém escolhe nada aqui, não é possível mudar de ideia?";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/happy.png");
                        dialogBoxPai.innerHTML = "Aqui nós não mudamos de ideias, querida. As ideias já vêm prontas, costuradas com todo o carinho. Queres ouvir mais uma das minhas?";
                        dialogBoxPai.style.display = "block";

                        choiceContainer.innerHTML = `
                            <button class="btn-choice" onclick="escolhaMinigame('C1_A')">Confrontar diretamente</button>
                            <button class="btn-choice" onclick="escolhaMinigame('C1_B')">Disfarçar com ironia</button>
                        `;
                        choiceContainer.style.display = "flex";
                    }, 150);
                }, 5000);
            }
            else if (opcao === 'C1_A') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Ideias prontas soam como prisão! Quem decide o que é perfeito e o que não é?";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/sinister.png", "obscuro"); 
                        atmosferaMinigame('suspense');
                        dialogBoxPai.innerHTML = "A sua Outra Mãe não gosta de crianças ingratas, Lalai. A ingratidão estraga a perfeição.";
                        dialogBoxPai.style.display = "block";

                        agendar(() => {
                            dialogBoxPai.innerHTML = "ANORMALIDADE DETECTADA";
                           perigoMinigame();
                           tocarSomErro('alarme');

                            agendar(() => {
                                tocarSomSusto('outroPai');
                                mudarRetratoOutroPai("assets/images/jumpscare.png", "susto");

                                dialogBoxPai.classList.add("desespero");
                                portraitFrame.classList.add("desespero");
                                dialogBoxPai.innerHTML = "ElA Te OuViu!!!!";
                                flashScreen.classList.add("strobe");

                                agendar(() => {
                                    flashScreen.classList.remove("strobe");
                                    flashScreen.style.transition = "none"; 
                                    flashScreen.style.backgroundColor = "#000";
                                    flashScreen.style.opacity = "1";
                                    interromperMusica(1.0);
                                    
                                    // Limpa os estados de desespero e reset exato igual ao B2
                                    dialogBoxPai.style.display = "none";
                                    dialogBoxPai.classList.remove("desespero");
                                    
                                    dialogBoxLalai.style.display = "none"; 
                                    
                                    portraitFrame.classList.remove("desespero"); 
                                    portraitFrame.classList.remove("jumpscare");
                                    portraitFrame.style.transform = "translateX(-50%) scale(1)"; // Reseta o tamanho exato
                                    portraitFrame.style.display = "none"; 
                                    
                                    agendar(() => {
                                        flashScreen.style.transition = "opacity 1s ease-in-out";
                                        flashScreen.style.opacity = "0";

                                        minigameOutroPaiAtivo = false;
                                        canvas.style.display = "block";

                                        document.getElementById('joystickArea').style.display = 'block';
                                        document.querySelector('.action-buttons').style.display = 'block';

                                        cenarioAtual = "escadaria";
                                        playerX = 100;
                                        playerY = 160;
                                        saiuDoMinigame = false;

                                        fundoDaSala.classList.remove("obscuro");

                                        dialogBox.style.display = "block";
                                        dialogBox.innerHTML = "Lalai: Por pouco... Preciso ter cuidado com o que digo a ele.";
                                        iniciarTemaCaixinhaDeMusica();
                                        updateGame();
                                    }, 1000);
                                }, 2200); 
                            }, 1800);
                        }, 3500);
                    }, 150);
                }, 3500);
            }
            else if (opcao === 'C1_B') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Essas costuras parecem estar apertando um pouco a sua cabeça, não acha? haha";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/happy.png");
                        dialogBoxPai.innerHTML = "Apertando minha cabeça? Que piada curiosa! Mas falando em piadas, deixa-me contar outra...";
                        dialogBoxPai.style.display = "block";
                        
                        agendar(() => {
                            mostrarOpcoesPrincipais();
                        }, 3000);
                    }, 150);
                }, 4000);
            }
            else if (opcao === 'C2') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "É... acho que você tem razão, as coisas já são perfeitas assim.";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/happy.png");
                        dialogBoxPai.innerHTML = "Não é? Você deve sempre concordar conosco, querida! Fique sempre onde meus olhos conseguem te ver e evite certas companhias que possam bagunçar a sua mente com ideias estranhas.";
                        dialogBoxPai.style.display = "block";

                        choiceContainer.innerHTML = `
                            <button class="btn-choice" onclick="escolhaMinigame('C2_A')">Curiosidade sobre companhias</button>
                            <button class="btn-choice" onclick="escolhaMinigame('C2_B')">Mudar de assunto</button>
                        `;
                        choiceContainer.style.display = "flex";
                    }, 150);
                }, 4500);
            }
            else if (opcao === 'C2_A') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Quais companhias são essas que eu deveria evitar?";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/confused.png");
                        atmosferaMinigame('estranheza');
                        dialogBoxPai.innerHTML = "Quem mais poderia ser? Não fale bobagens igual aquele Bobinsky, que fica resmungando pelos tubos que é o único que sabe como navegar pelas fendas deste Outro Mundo. Que bobagem!";
                        dialogBoxPai.style.display = "block";

                        choiceContainer.innerHTML = `
                            <button class="btn-choice" onclick="escolhaMinigame('C_SAIR')">Afastar-se e procurar o Sr. Bobinsky</button>
                        `;
                        choiceContainer.style.display = "flex";
                    }, 150);
                }, 4000);
            }
            else if (opcao === 'C2_B') {
                choiceContainer.style.display = "none";
                dialogBoxPai.style.display = "none";

                dialogBoxLalai.style.display = "block";
                dialogBoxLalai.innerHTML = "Esqueça isso... conte-me outra piada, por favor.";

                agendar(() => {
                    dialogBoxLalai.style.display = "none";
                    agendar(() => {
                        mudarRetratoOutroPai("assets/images/happy.png");
                        dialogBoxPai.innerHTML = "Outra piada? Ah, sim... aqui tudo é eternamente perfeito, a felicidade sempre vem em primeiro lugar!";
                        dialogBoxPai.style.display = "block";
                        
                        agendar(() => {
                            mostrarOpcoesPrincipais();
                        }, 3000);
                    }, 150);
                }, 4000);
            }
            else if (opcao === 'C_SAIR') {
                limparAgendamentos(); 
                pararSomSuspense();
                atmosferaMinigame('esperanca');
                
                minigameOutroPaiAtivo = false;
                choiceContainer.style.display = "none";
                choiceContainer.innerHTML = "";
                dialogBoxLalai.style.display = "none";
                dialogBoxPai.style.display = "none"; 
                portraitFrame.style.display = "none";
                
                canvas.style.display = "block";

                document.getElementById('joystickArea').style.display = 'block';
                document.querySelector('.action-buttons').style.display = 'block';

                cenarioAtual = "storage";
                playerX = 260;
                playerY = 180;
                saiuDoMinigame = false; 
                
                missaoBobinskyAtiva = true;

                dialogBox.style.display = "none";

                salvarProgresso();
                updateGame();
                return;
            }
            else if (opcao === 'C_VOLTAR') {
                pararSomSuspense();
                mostrarOpcoesPrincipais(); 
                dialogBoxLalai.style.display = "none";
                mudarRetratoOutroPai("assets/images/happy.png"); 
                
                dialogBoxPai.innerHTML = "Mas enfim... onde estávamos? Ah, sim! " + loopPiadas[piadaAtual];
                dialogBoxPai.style.display = "block";

                piadaAtual++;
                if (piadaAtual >= loopPiadas.length) piadaAtual = 0; 
            }
        };

        function mostrarHistoria() {
            document.getElementById('menuScreen').style.display = 'none';
            document.getElementById('storyScreen').style.display = 'flex';
        }

        function iniciarJogoReal() {
            document.getElementById('storyScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';

            iniciarMusicaMundoReal();

            gameLoopRunning = true;
            updateGame();
        }

        // ---- SISTEMA DE SALVAMENTO ----

        const SAVE_KEY = 'fanfiction_v1_save';
        const SAVE_VERSION = 1;

        function estadoSeguroParaSalvar() {
            if (!gameLoopRunning) return false;
            if (emboscadaSalaDisparada) return false;
            if (emTransicao) return false;
            if (faseApresentacao) return false;
            if (minigameOutroPaiAtivo) return false;
            if (pcAtivo) return false;
            return true;
        }

        function coletarEstado() {
            return {
                v: SAVE_VERSION,
                cenarioAtual,
                playerX,
                playerY,
                isFacingLeft,
                jaAvisoPorta,
                avisoPortaFeito,
                missaoChaveAtiva,
                temChave,
                chaveUsada,
                faseOutroMundo,
                missaoBobinskyAtiva,
                sustoEscadariaFeito,
                sustoOfficeFeito,
                saiuDoMinigame,
                ts: Date.now()
            };
        }

        function salvarProgresso() {
            if (!estadoSeguroParaSalvar()) return;
            try {
                const estado = coletarEstado();
                const json = JSON.stringify(estado);
                if (json === ultimoHashSalvo) return;
                localStorage.setItem(SAVE_KEY, json);
                ultimoHashSalvo = json;
            } catch (e) {}
        }

        function carregarProgresso() {
            try {
                const json = localStorage.getItem(SAVE_KEY);
                if (!json) return null;
                const estado = JSON.parse(json);
                if (!estado || estado.v !== SAVE_VERSION) return null;
                return estado;
            } catch (e) {
                return null;
            }
        }

        function restaurarProgresso(estado) {
            cenarioAtual = estado.cenarioAtual;
            playerX = estado.playerX;
            playerY = estado.playerY;
            isFacingLeft = estado.isFacingLeft;
            jaAvisoPorta = estado.jaAvisoPorta;
            avisoPortaFeito = estado.avisoPortaFeito;
            missaoChaveAtiva = estado.missaoChaveAtiva;
            temChave = estado.temChave;
            chaveUsada = estado.chaveUsada;
            faseOutroMundo = estado.faseOutroMundo;
            missaoBobinskyAtiva = estado.missaoBobinskyAtiva;
            sustoEscadariaFeito = estado.sustoEscadariaFeito;
            sustoOfficeFeito = estado.sustoOfficeFeito;
            saiuDoMinigame = estado.saiuDoMinigame;
            dogX = playerX + (isFacingLeft ? 65 : -65);

            if (temChave && !chaveUsada) {
                keyIcon.style.display = "block";
            }

            document.getElementById('menuScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';

            if (faseOutroMundo) {
                iniciarTemaCaixinhaDeMusica();
            } else {
                iniciarMusicaMundoReal();
            }

            gameLoopRunning = true;
            iniciarSaveInterval();
            updateGame();
        }

        function resetarEstadoDoJogo() {
            gameLoopRunning = false;

            if (saveInterval) {
                clearInterval(saveInterval);
                saveInterval = null;
            }
            ultimoHashSalvo = null;

            // O menu já toca o Mundo Real: manter a mesma música evita corte e reinício
            iniciarMusicaMundoReal();

            cenarioAtual = "escadaria";
            playerX = canvas.width / 2 - 32;
            playerY = 240;
            isFacingLeft = false;
            dogX = playerX - 65;
            jaAvisoPorta = false;
            avisoPortaFeito = false;
            missaoChaveAtiva = false;
            temChave = false;
            dialogoOutroPaiAtivo = false;
            passoDialogoPai = 0;
            chaveUsada = false;
            emTransicao = false;
            faseOutroMundo = false;
            faseApresentacao = false;
            indiceApresentacao = 0;
            minigameOutroPaiAtivo = false;
            piadaAtual = 0;
            sustoEscadariaFeito = false;
            saiuDoMinigame = false;
            sustoOfficeFeito = false;
            jumpScareCenarioAtivo = false;
            missaoBobinskyAtiva = false;
            emboscadaSalaDisparada = false;
            movingLeft = false;
            movingRight = false;
            movingUp = false;
            movingDown = false;
            joystickDx = 0;
            joystickDy = 0;

            keyIcon.style.display = "none";
            dialogBox.innerHTML = "Explore a casa e veja o que o Catie descobre ao redor.";
            dialogBox.style.display = "block";

            const telaPreta = document.getElementById('telaPretaFase2');
            if (telaPreta) {
                telaPreta.style.opacity = '0';
                telaPreta.style.pointerEvents = 'none';
            }
        }

        function atualizarBotaoPrincipal() {
            const btn = document.getElementById('btnJogar');
            if (!btn) return;
            const salvo = carregarProgresso();
            if (salvo) {
                btn.textContent = 'Continuar';
                btn.onclick = function() { entrarEmTelaCheia(); iniciarContinuar(); };
            } else {
                btn.textContent = 'Jogar';
                btn.onclick = function() { entrarEmTelaCheia(); iniciarJogar(); };
            }
        }

        function iniciarJogar() {
            iniciarIntroducaoNarrativa();
        }

        function iniciarContinuar() {
            const estado = carregarProgresso();
            if (!estado) {
                iniciarJogar();
                return;
            }
            restaurarProgresso(estado);
        }

        function iniciarNovoJogo() {
            const salvo = carregarProgresso();
            if (salvo && !confirm('Tem certeza? O progresso guardado será apagado.')) return;
            localStorage.removeItem(SAVE_KEY);
            ultimoHashSalvo = null;
            resetarEstadoDoJogo();
            entrarEmTelaCheia();
            iniciarIntroducaoNarrativa();
        }

        function iniciarSaveInterval() {
            if (saveInterval) clearInterval(saveInterval);
            saveInterval = setInterval(salvarProgresso, 10000);
        }

        // ---- INTRODUÇÃO NARRATIVA ----

        let introAudioCtx = null;

        function tocarTeclaIntro() {
            if (!window.MixagemAudio) return;
            try {
                const ac = MixagemAudio.contexto();
                const sr = ac.sampleRate;
                const dur = 0.025;
                const buf = ac.createBuffer(1, Math.floor(sr * dur), sr);
                const data = buf.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                const src = ac.createBufferSource();
                src.buffer = buf;
                const filt = ac.createBiquadFilter();
                filt.type = 'bandpass';
                filt.frequency.value = 2500;
                filt.Q.value = 1.0;
                const gain = ac.createGain();
                gain.gain.setValueAtTime(0.1, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
                src.connect(filt);
                filt.connect(gain);
                gain.connect(MixagemAudio.saida('interface'));
                src.start();
            } catch(e) {}
        }

        function iniciarIntroducaoNarrativa() {
            document.getElementById('menuScreen').style.display = 'none';
            const introEl = document.getElementById('introNarrativa');
            introEl.style.transition = 'none';
            introEl.style.opacity = '1';
            introEl.style.display = 'flex';
            document.getElementById('introTexto').innerHTML = '';

            const paragrafos = [
                { texto: "Toda história começa em algum lugar.", titulo: true },
                { texto: "Algumas começam com um acontecimento extraordinário. Outras, com uma escolha, um encontro ou uma porta que nunca deveria ter sido aberta." },
                { texto: "Antes de encontrar um mundo perfeito, Lalai conhecia bem as imperfeições do seu próprio." },
                { texto: "Ela sonhava com uma família perfeita, uma vida perfeita e um lugar onde tudo era preparado especialmente para ela." },
                { texto: "Mas, às vezes, aquilo que parece perfeito demais esconde algo que não deveria existir." },
                { texto: "E essa é apenas a primeira página de uma história muito maior…", final: true }
            ];

            let pIndex = 0;

            function digitarParagrafo(para, aoTerminar) {
                const textoEl = document.getElementById('introTexto');
                const p = document.createElement('p');
                let classes = 'intro-para';
                if (para.titulo) classes += ' intro-para--titulo';
                if (para.final) classes += ' intro-para--final';
                p.className = classes;
                textoEl.appendChild(p);

                const texto = para.texto;
                let i = 0;
                let ativa = true;

                function proximo() {
                    if (!ativa) return;
                    if (i >= texto.length) {
                        ativa = false;
                        setTimeout(aoTerminar, para.final ? 2800 : 1600);
                        return;
                    }
                    const ch = texto[i];
                    p.textContent = texto.substring(0, i + 1);
                    i++;

                    if (/[^\s.,!?;:\-—]/.test(ch)) tocarTeclaIntro();

                    let delay;
                    if (ch === '…') {
                        delay = 650;
                    } else if (ch === '.') {
                        delay = para.final ? 420 : 290;
                    } else if (ch === ',') {
                        delay = 170;
                    } else {
                        const base = para.titulo ? 80 : para.final ? 80 : 70;
                        delay = base + Math.floor(Math.random() * 20);
                    }
                    setTimeout(proximo, delay);
                }
                proximo();
            }

            function proximoParagrafo() {
                if (pIndex >= paragrafos.length) {
                    setTimeout(() => {
                        introEl.style.transition = 'opacity 1.5s ease';
                        introEl.style.opacity = '0';
                        setTimeout(() => {
                            introEl.style.display = 'none';
                            if (introAudioCtx) {
                                introAudioCtx.close();
                                introAudioCtx = null;
                            }
                            const gc = document.getElementById('gameContainer');
                            gc.style.opacity = '0';
                            gc.style.transition = 'opacity 1s ease';
                            gc.style.display = 'block';
                            iniciarMusicaMundoReal();
                            gameLoopRunning = true;
                            iniciarSaveInterval();
                            updateGame();
                            salvarProgresso();
                            atualizarBotaoPrincipal();
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    gc.style.opacity = '1';
                                });
                            });
                        }, 1500);
                    }, 2200);
                    return;
                }

                const para = paragrafos[pIndex++];
                if (para.final) {
                    setTimeout(() => digitarParagrafo(para, proximoParagrafo), 1200);
                } else {
                    digitarParagrafo(para, proximoParagrafo);
                }
            }

            proximoParagrafo();
        }

        function tocarSomItem() {
            if (!window.MixagemAudio) return;
            const audioCtx = MixagemAudio.contexto();
            const saida = MixagemAudio.saida('interface');
            const notas = [523.25, 659.25, 783.99, 1046.50];
            let tempoAtual = audioCtx.currentTime;

            notas.forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.value = freq;
                osc.connect(gain);
                gain.connect(saida);
                osc.start(tempoAtual + i * 0.1);
                gain.gain.setValueAtTime(0.08, tempoAtual + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, tempoAtual + i * 0.1 + 0.1);
                osc.stop(tempoAtual + i * 0.1 + 0.1);
            });
        }
            function iniciarAnimacaoTunel() {
            emTransicao = true;
            fadeOutMusicaMundoReal();

            dialogBox.style.display = "none";
            canvas.style.display = "none";
            
            // Oculta todos os controles exceto a Action Button (Botão A)
            document.getElementById('joystickArea').style.display = 'none';
            document.getElementById('inventoryBox').style.display = 'none';
            document.getElementById('btnFullscreen').style.display = 'none';
            document.getElementById('btnSettings').style.display = 'none';
            
            tunelGif.style.display = "block";
            tunelGif.src = "assets/images/tunel.gif?" + new Date().getTime();

            iniciarTemaCaixinhaDeMusica();

            setTimeout(() => {
                tunelGif.style.display = "none";
                canvas.style.display = "block";
                
                faseOutroMundo = true; 
                faseApresentacao = true; 
                indiceApresentacao = 0; 
                emTransicao = false;
                
                ctx.imageSmoothingEnabled = false;
                ctx.fillStyle = "#0d0914";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                portraitContainer.style.display = "none";

                dialogBox.style.display = "flex";
                dialogBox.innerHTML = "Lalai: Há portas que jamais deveriam ser abertas... e eu acabei de abrir uma delas."; 
            }, 3000);
        }
        function desenharImagem(img, x, y, width, height, espelhar) {
            ctx.save();
            if (espelhar) {
                ctx.translate(x + width / 2, y + height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
            } else {
                ctx.drawImage(img, x, y, width, height);
            }
            ctx.restore();
        }

        let ultimoTempo = 0;

        function updateGame(tempoAtual = 0) {
            if (!gameLoopRunning) return;
            // Calcula o tempo decorrido entre os frames (Delta Time)
            let deltaTime = (tempoAtual - ultimoTempo) / 1000;
            ultimoTempo = tempoAtual;
            
            // Limita o deltaTime para evitar saltos bruscos se o jogo for minimizado
            if (isNaN(deltaTime) || deltaTime > 0.1) deltaTime = 0.016;

            // VERIFICAÇÃO DE PROXIMIDADE AUTOMÁTICA COM O OUTRO PAI NO OFFICE
            if (cenarioAtual === "storage" && chaveUsada && mapaCasa[cenarioAtual].npc && !minigameOutroPaiAtivo) {
                let npc = mapaCasa[cenarioAtual].npc;
                if (Math.abs(playerX - npc.x) < 90) {
                    iniciarMinigameOutroPai();
                }
            }
            if (emTransicao || faseApresentacao || minigameOutroPaiAtivo || pcAtivo) return; 

            let isMoving = false;

            // Velocidade em pixéis por segundo ajustada ao tempo real
            let velocidadeBase = faseOutroMundo ? 50 : 120;
            let playerSpeed = velocidadeBase * deltaTime;

            if (movingLeft) { playerX -= playerSpeed; isFacingLeft = true; isMoving = true; }
            if (movingRight) { playerX += playerSpeed; isFacingLeft = false; isMoving = true; }
            if (movingUp) { playerY -= playerSpeed; isMoving = true; }
            if (movingDown) { playerY += playerSpeed; isMoving = true; }

            // Joystick analógico
            if ((joystickDx !== 0 || joystickDy !== 0) && !jumpScareCenarioAtivo) {
                const jMag = Math.min(Math.sqrt(joystickDx * joystickDx + joystickDy * joystickDy), 1.0);
                if (jMag > 0.08) {
                    const nx = joystickDx / jMag;
                    const ny = joystickDy / jMag;
                    playerX += nx * playerSpeed * jMag;
                    playerY += ny * playerSpeed * jMag;
                    if (joystickDx < -0.15) isFacingLeft = true;
                    else if (joystickDx > 0.15) isFacingLeft = false;
                    isMoving = true;
                    if (Math.abs(joystickDx) >= Math.abs(joystickDy)) {
                        if (joystickDx < -0.6) tentarMudarCenario("esquerda");
                        else if (joystickDx > 0.6) tentarMudarCenario("direita");
                    } else if (joystickDy < -0.6) {
                        tentarMudarCenario("cima");
                    }
                }
            }

            if (isMoving) {
                animCounter++;
                if (animCounter > 15) { 
                    isStepFrame = !isStepFrame;
                    animCounter = 0;
                }
            } else {
                isStepFrame = false; 
                animCounter = 0;
            }
            // SENSOR 1: Escadaria Assombrada
            if (faseOutroMundo && cenarioAtual === "escadaria" && !sustoEscadariaFeito && !jumpScareCenarioAtivo) {
                if (playerX > 350 && playerX < 400) {
                    sustoEscadariaFeito = true; 
                    movingLeft = false; movingRight = false; movingUp = false; movingDown = false; 
                    dispararJumpscareCenario(imgEscadariaAssombrada);
                }
            }

            // SENSOR 2: Office Assombrado
            if (faseOutroMundo && cenarioAtual === "storage" && !sustoOfficeFeito && !jumpScareCenarioAtivo) {
                // Exige que a missão esteja ativa E que a Lalai caminhe para a porta (X < 300 e movingLeft)
                if (missaoBobinskyAtiva && playerX < 300 && movingLeft) {
                    sustoOfficeFeito = true; 
                    movingLeft = false; movingRight = false; movingUp = false; movingDown = false; 
                    dispararJumpscareCenario(imgOfficeAssombrado);
                }
            }

            if (faseOutroMundo && cenarioAtual === "sala" && missaoBobinskyAtiva && !emboscadaSalaDisparada) {
                if (playerX > 150) { 
                    dispararEmboscadaSala();
                    return;
                }
            }

            let currentImgPlayer = isStepFrame ? imgPlayerPasso : imgPlayer;
            let dogPosOffset = isFacingLeft ? 55 : -55;

            // REGRAS DE COLISÃO E LIMITES DINÂMICOS DO CENÁRIO ATUAL
            let salaDados = mapaCasa[cenarioAtual];
            let limiteChao = salaDados.chao; // Lê apenas a altura real definida no mapa
            
            if (playerX < salaDados.limiteEsquerdo) playerX = salaDados.limiteEsquerdo;
            if (playerX > salaDados.limiteDireito) playerX = salaDados.limiteDireito;
            
            if (playerY < limiteChao) playerY = limiteChao; 
            if (playerY > canvas.height - 90) playerY = canvas.height - 90;

            // MISSÃO DA CHAVE E PORTA SECRETA NA SALA (MUNDO REAL)
            if (cenarioAtual === "sala" && !faseOutroMundo) {
                if (playerX > 480) { 
                    if (!temChave && !avisoPortaFeito) {
                        avisoPortaFeito = true; 
                        dialogBox.style.display = "block"; 
                        dialogBox.innerHTML = "Catie: Au au!";
                        missaoChaveAtiva = true; 

                        setTimeout(() => {
                            if (cenarioAtual === "sala" && !temChave && !chaveUsada && !faseOutroMundo) {
                                dialogBox.style.display = "block"; 
                                dialogBox.innerHTML = "Lalai: Tem algo estranho com essa porta... onde estará a chave?";
                                
                                setTimeout(() => {
                                    if (cenarioAtual === "sala" && !temChave && !chaveUsada && !faseOutroMundo) {
                                        dialogBox.style.display = "block"; 
                                        dialogBox.innerHTML = "Encontre a chave (clicando com o botão A nas gavetas)";
                                    }
                                }, 2500); 
                            }
                        }, 1500); 
                    }
                }
            }

            if (cenarioAtual === "cozinha" && missaoChaveAtiva && !temChave && !faseOutroMundo) {
                if (dialogBox.innerHTML.indexOf("chave") === -1) {
                    dialogBox.innerHTML = "Encontre a chave (Clicando com o botão A nas gavetas)"; 
                }
            }

            let posicaoAlvoCao = playerX + dogPosOffset;
            let dogMovendo = Math.abs(posicaoAlvoCao - dogX) > 0.5 || Math.abs((playerY + 25) - dogY) > 0.5;

            dogX += (posicaoAlvoCao - dogX) * 0.1; 
            dogY += ((playerY + 25) - dogY) * 0.1;

            if (dogMovendo) {
                catieAnimCounter++;
                if (catieAnimCounter > 15) { 
                    catieStepFrame = !catieStepFrame;
                    catieAnimCounter = 0;
                }
            } else {
                catieStepFrame = false;
                catieAnimCounter = 0;
            }

            let currentImgDog = catieStepFrame ? imgDogPasso : imgDog;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false; 
            
            let cenarioARenderizar = mapaCasa[cenarioAtual].img;
            
            ctx.save(); 
            
            if (chaveUsada && !jumpScareCenarioAtivo) {
                ctx.filter = "brightness(65%) contrast(130%) sepia(20%)";
            } else {
                ctx.filter = "none"; 
            }
            
            ctx.drawImage(cenarioARenderizar, 0, 0, canvas.width, canvas.height);

            if (chaveUsada && mapaCasa[cenarioAtual].npc) {
                let npc = mapaCasa[cenarioAtual].npc;
                desenharImagem(npc.img, npc.x, npc.y, 110, 190, false); 
            }

            desenharImagem(currentImgDog, dogX, dogY, 100, 100, isFacingLeft); 
            desenharImagem(currentImgPlayer, playerX, playerY, 110, 110, isFacingLeft);
            
            ctx.restore(); 

            if (animandoChave) {
                tempoAnimacaoChave++;
                chaveY -= 1.5; 

                ctx.save();
                let opacidade = 1 - (tempoAnimacaoChave / 60);
                if (opacidade < 0) opacidade = 0;
                ctx.globalAlpha = opacidade;

                ctx.drawImage(imgChave, playerX + 20, chaveY, 24, 24); 

                ctx.fillStyle = "#ffffff";
                if (tempoAnimacaoChave % 10 < 5) {
                    ctx.fillRect(playerX + 15, chaveY + 5, 4, 4);
                    ctx.fillRect(playerX + 35, chaveY + 15, 4, 4);
                } else {
                    ctx.fillRect(playerX + 10, chaveY + 20, 4, 4);
                    ctx.fillRect(playerX + 40, chaveY + 5, 4, 4);
                }
                ctx.restore();

                if (tempoAnimacaoChave > 60) {
                    animandoChave = false; 
                }
            }

            requestAnimationFrame(updateGame);
        }


        // Eventos de Teclado (PC)
        window.addEventListener('keydown', (e) => {
            if (faseApresentacao && (e.key === ' ' || e.key === 'Space' || e.key === 'Enter' || e.key === 'e' || e.key === 'E')) {
                executarAcaoBotaoA(e);
                return;
            }

            if (emTransicao || faseApresentacao || minigameOutroPaiAtivo || jumpScareCenarioAtivo || pcAtivo) return;

            let direcaoIntencao = ""; 

            if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { 
                movingLeft = true; 
                direcaoIntencao = "esquerda"; 
            }
            if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { 
                movingRight = true; 
                direcaoIntencao = "direita"; 
            }
            if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { 
                movingUp = true; 
                direcaoIntencao = "cima"; 
            }
            if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { 
                movingDown = true; 
                direcaoIntencao = "baixo"; 
            }
            
            if (direcaoIntencao !== "" && direcaoIntencao !== "baixo") {
                tentarMudarCenario(direcaoIntencao);
            }

            if(e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Space') { 
                executarAcaoBotaoA(e); 
            }
        });

        window.addEventListener('keyup', (e) => {
            if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') movingLeft = false;
            if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') movingRight = false;
            if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') movingUp = false;
            if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') movingDown = false;
        });

        // AÇÃO DO BOTÃO A

        function executarAcaoBotaoA(e) {
            if (e) {
                if (e.cancelable) e.preventDefault();
                if (e.type === 'keydown' && e.key !== ' ' && e.key !== 'Space' && e.key !== 'Enter' && e.key !== 'e' && e.key !== 'E') {
                    return;
                }
            } 

            if (emTransicao || minigameOutroPaiAtivo) return;

            if (cenarioAtual === "storage" && playerX >= 210 && playerX <= 330) {
                abrirComputador();
                return;
            }

            if (faseApresentacao) {
                indiceApresentacao++;
                
                // Reseta sempre as imagens por padrão para os passos normais
                imgTopo.style.transition = "none";
                imgTopo.style.clipPath = "inset(0 0 100% 0)";
                imgTopo.src = "";

                imgFundo.style.transition = "none";
                imgFundo.className = "";
                void imgFundo.offsetWidth;
                imgFundo.style.transition = "filter 1.2s ease-in-out";

                if (indiceApresentacao === 1) {
                    portraitContainer.style.display = "block";
                    imgFundo.src = "assets/images/casa.png";
                    dialogBox.innerHTML = "Lalai: No início, tudo parecia um sonho encantador...";
                } else if (indiceApresentacao === 2) {
                    imgFundo.className = "sinistro";
                    dialogBox.innerHTML = "Lalai: Mas algo sombrio habitava naquela casa.";
                } else if (indiceApresentacao === 3) {
                    imgFundo.src = imgBobinsky.src;
                    dialogBox.innerHTML = "Lalai: o Sr. Bobinsky era o mesmo vizinho excêntrico das acrobacias...";
                } else if (indiceApresentacao === 4) {
                    imgFundo.className = "sinistro";
                    dialogBox.innerHTML = "Lalai: Mas havia algo de estranho em como ele sempre repetia as mesmas coisas...";
                } else if (indiceApresentacao === 5) {
                    imgFundo.src = imgOutroPai.src;
                    dialogBox.innerHTML = "Lalai: O Outro Pai também era o mesmo, sempre pronto para disparar piadas...";
                } else if (indiceApresentacao === 6) {
                    imgFundo.className = "sinistro";
                    dialogBox.innerHTML = "Lalai: Mas as piadas dele pareciam ensaiadas... quase como um fantoche.";
                } else if (indiceApresentacao === 7) {
                    imgFundo.src = imgOutraMae.src;
                    dialogBox.innerHTML = "Lalai: Estranhamente, a Outra Mãe estava sempre sorridente...";
                } else if (indiceApresentacao === 8) {
                    // Garante que o fundo fica com a imagem normal da Outra Mãe limpa
                    imgFundo.src = imgOutraMae.src;
                    imgFundo.className = ""; 
                    imgFundo.style.filter = "none";

                    // Configura a imagem do topo (Bela Dama real) para começar colorida e sem filtro
                    imgTopo.src = imgOutraMaeReal.src;
                    imgTopo.className = ""; 
                    imgTopo.style.transition = "none";
                    imgTopo.style.filter = "grayscale(0%) contrast(100%) brightness(100%)";
                    imgTopo.style.clipPath = "inset(0 0 100% 0)"; // Começa cortada em cima

                    setTimeout(() => {
                        // Ativa simultaneamente a descida (clip-path) e a transição gradual do filtro para cinzento/escuro SOMENTE na Bela Dama
                        imgTopo.style.transition = "clip-path 1.4s ease-in-out, filter 1.4s ease-in-out";
                        imgTopo.style.filter = "grayscale(100%) contrast(160%) brightness(70%)";
                        imgTopo.style.clipPath = "inset(0 0 0% 0)"; 
                    }, 50);

                    dialogBox.innerHTML = "Lalai: Mas aos poucos percebi a verdade... este mundo inteiro é controlado por ela, uma cópia distorcida feita para me prender aqui para sempre.";
                    return;
                } else if (indiceApresentacao === 9) {
                    portraitContainer.style.display = "none"; 
                    imgFundo.className = "";
                    imgTopo.className = "";
                    
                    // DEVOLVE OS CONTROLES PARA A TELA:
                    document.getElementById('joystickArea').style.display = 'block';
                    document.getElementById('inventoryBox').style.display = 'block';
                    document.getElementById('btnFullscreen').style.display = 'flex';
                    document.getElementById('btnSettings').style.display = 'flex';
                    
                    faseApresentacao = false;
                    cenarioAtual = "sala";
                    playerX = 100;
                    
                    dialogBox.classList.remove("dialogo-proximo");
                    dialogBox.innerHTML = "Lalai: Preciso descobrir como escapar daqui... vou explorar os cômodos para ver se encontro alguém que possa me ajudar.";
                    salvarProgresso();
                    updateGame();
                }
                return;
            }

            if (cenarioAtual === "cozinha" && missaoChaveAtiva && !temChave && !faseOutroMundo) {
                if (playerX > 400) { 
                    temChave = true;
                    dialogBox.innerHTML = "Lalai: Achei a chave! Agora so preciso voltar para a sala e abrir a porta secreta.";
                    keyIcon.style.display = "block";
                    animandoChave = true;
                    tempoAnimacaoChave = 0;
                    chaveY = playerY - 20;
                    tocarSomItem();
                    salvarProgresso();
                    return;
                } else {
                    dialogBox.innerHTML = "Lalai: A chave deve estar nas últimas gavetas da cozinha...";
                    return; 
                }
            }

            if (cenarioAtual === "sala" && playerX > 480 && !faseOutroMundo) {
                if (temChave && !chaveUsada) {
                    chaveUsada = true; 
                    keyIcon.style.display = "none"; 
                    iniciarAnimacaoTunel();
                    setTimeout(() => {
                tunelGif.style.display = "none";
                canvas.style.display = "block";
                
                faseOutroMundo = true; 
                faseApresentacao = true; 
                indiceApresentacao = 0; 
                emTransicao = false;
                
                ctx.imageSmoothingEnabled = false;
                ctx.fillStyle = "#0d0914";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                portraitContainer.style.display = "none";

                dialogBox.style.display = "flex";
                dialogBox.classList.add("dialogo-proximo");
                dialogBox.innerHTML = "Lalai: Há portas que jamais deveriam ser abertas... e eu acabei de abrir uma delas."; 
            }, 3000);
                    return;
                } else if (!temChave) {
                    dialogBox.innerHTML = "Lalai: Tem algo estranho com essa porta, onde estará a chave?";
                    return;
                }
            }


            interagir();
        } 

        const btnA = document.getElementById('btnA');
        if (btnA) {
            btnA.addEventListener('touchstart', executarAcaoBotaoA, { passive: false }); // Para os Telemóveis/Tablets
            btnA.addEventListener('mousedown', executarAcaoBotaoA); // Para quem jogar no PC
        }

        atualizarBotaoPrincipal();
        iniciarMusicaAbertura();

        window.addEventListener('pagehide', salvarProgresso);
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') salvarProgresso();
        });

        // ==== JOYSTICK ANALÓGICO ====
        (function() {
            const base = document.getElementById('joystickBase');
            const knob = document.getElementById('joystickKnob');
            if (!base || !knob) return;

            const maxRadius = 35;
            let activePointerId = null;
            let baseCenterX = 0;
            let baseCenterY = 0;

            function updateKnob(dx, dy) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ratio = dist > maxRadius ? maxRadius / dist : 1;
                const kx = dx * ratio;
                const ky = dy * ratio;
                knob.style.transform = 'translate(' + kx + 'px, ' + ky + 'px)';
                joystickDx = kx / maxRadius;
                joystickDy = ky / maxRadius;
            }

            function releaseJoystick() {
                activePointerId = null;
                knob.style.transition = 'transform 0.15s';
                knob.style.transform = 'translate(0, 0)';
                setTimeout(function() { knob.style.transition = ''; }, 150);
                joystickDx = 0;
                joystickDy = 0;
            }

            base.addEventListener('pointerdown', function(e) {
                if (activePointerId !== null) return;
                e.preventDefault();
                activePointerId = e.pointerId;
                base.setPointerCapture(e.pointerId);
                const rect = base.getBoundingClientRect();
                baseCenterX = rect.left + rect.width / 2;
                baseCenterY = rect.top + rect.height / 2;
                updateKnob(e.clientX - baseCenterX, e.clientY - baseCenterY);
            });

            base.addEventListener('pointermove', function(e) {
                if (e.pointerId !== activePointerId) return;
                e.preventDefault();
                updateKnob(e.clientX - baseCenterX, e.clientY - baseCenterY);
            });

            base.addEventListener('pointerup', function(e) {
                if (e.pointerId !== activePointerId) return;
                releaseJoystick();
            });

            base.addEventListener('pointercancel', function(e) {
                if (e.pointerId !== activePointerId) return;
                releaseJoystick();
            });
        })();
