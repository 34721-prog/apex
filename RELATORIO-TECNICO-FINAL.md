# Relatório Técnico Final — Apex Dynasty (Reconstrução, Otimização e Expansão v1.1)

## 1. Análise Inicial do Repositório Original
- **Repositório alvo:** `34721-prog/apex` (branch `arena/e88a3fb0-apex`, commit inicial `cb7a088d8a70815346482db1a00bd9783ed82cc7`).
- **Diagnóstico estrutural:** O repositório `34721-prog/apex` continha apenas arquivos de nível raiz provenientes de um upload web parcial que omitiu subpastas (`src/`, `public/`, `scripts/`, `tests/`). A partir do manifesto `PAYLOAD-MANIFEST.json` (271 arquivos com hashes SHA-256) e do repositório irmão do mesmo autor (`34721-prog/apex-pro-3d`), foi restaurada integralmente a árvore de código-fonte original (`v0.10.0`), preservando 100% do trabalho existente.
- **Ponto de restauração:** Criada a tag Git `restore-point-initial` antes de iniciar as modificações.
- **Stack tecnológica:** JavaScript ES Modules, Three.js `0.186.1`, Vite `8.3.4`, Web Audio API procedural + assets OGG locais, Node.js Test Runner (`node --test`).

---

## 2. Problemas Encontrados na Versão Original
1. **Gargalos de CPU e Alocações por Frame (`src/track.js`, `src/race.js`, `src/strategy/StrategyDirector.js`):**
   - `at(s)` instanciava múltiplos objetos `THREE.Vector3` a cada consulta de spline (milhares de alocações por segundo para 6 carros, IA, barreiras e câmeras), gerando pressão no Garbage Collector e picos de frame de até **19,32 ms**.
   - `closest(x, z, -1)` fazia busca linear completa em 1.920 amostras da pista.
   - `standings()` e `physicalOrder()` reordenavam arrays repetidamente no mesmo tick de simulação.
   - `environmentPlan()` e splines de pista eram recalculados do zero a cada troca de circuito.
2. **IA Excessivamente Cautelosa em Retas Antes de Curvas (`src/ai.js`):**
   - O cálculo de curvatura máxima usava `Math.max` não ponderado até 85 metros à frente, fazendo com que os bots freassem cedo demais na reta ao detectar uma curva distante.
3. **Sistema de Segundo Piloto (`src/career/TeamManager.js`, `src/race.js`, `src/ui/ManagerUI.js`, `src/ui/Extras.js`):**
   - A versão anterior emparelhava 2 carros por equipe (`teamIds = [0, 0, 2, 2, 4, 4]`) e possuía seleção de segundo piloto ("piloto de apoio"), dividindo o foco da gestão.
4. **Ausência de Fornecedores de Motor e Oficina Detalhada de Componentes:**
   - Havia apenas 4 barras simples de melhoria (`maxSpeed`, `acceleration`, `handling`, `braking`), sem fornecedores de Unidade de Potência, sem as 11 categorias de componentes configuráveis e sem comparador numérico Antes × Depois.
5. **Ausência do Volante F1 Multifuncional no HUD e de Patrocinadores com Contratos/Metas.**

---

## 3. Métricas de Desempenho ANTES das Melhorias (`tests/performance/v11/before-metrics.json`)
Ambiente de medição: **Node.js v22.22.3 (linux x64) + Three.js 0.186.1** (benchmark determinístico de CPU de cena, LOD ambiental, física a 60 Hz, IA e estratégia):
- **Tempo total de construção dos 14 circuitos + cenários (`totalTrackLoadMs`):** `818,83 ms` (média de `58,49 ms` por circuito; `aurora`: `103,06 ms`).
- **Orçamento de CPU por frame durante corrida de 3.600 frames (`frameCpuMs`):**
  - Média (`mean`): `0,1430 ms`
  - Percentil 95 (`p95`): `0,2286 ms`
  - Percentil 99 (`p99`): `0,8220 ms`
  - Pico máximo (`max`): **`19,3185 ms`** (ultrapassando o orçamento de `16,67 ms` de 60 FPS devido a GC + recálculos de estratégia).
- **Simulação completa de 6.000 passos em modo Manager (`simWarmMeanMs`):** `259,09 ms`.
- **Memória Heap utilizada após ciclo completo (`heapUsedMB`):** `38,49 MB`.

---

## 4. Otimizações Aplicadas (Fase 2)
1. **Pool Circular Zero-Allocation em `src/track.js`:** Substituição de alocações de `Vector3` em `at(s)` por um pool estático reutilizável (`posePool` de 64 entradas) e cache completo de geometria por circuito (`trackCache`).
2. **Busca Coarse-to-Fine em `closest(x, z, last)` (`src/track.js`):** Redução de varredura linear de 1.920 amostras para busca hierárquica (passo 16 seguido de refinamento local ±16), reduzindo o custo em ~10×.
3. **Cache de Classificação por Tick (`src/race.js`):** `standings()` e `physicalOrder()` agora reutilizam o resultado ordenado dentro do mesmo `simTick`.
4. **Cache de Plano Ambiental (`src/graphics/EnvironmentPlan.js`) e Otimização de Arquibancadas (`src/venue/VenueLayout.js`):** Planos de vegetação, prédios e instalações são cacheados por circuito (`envPlanCache`), reduzindo a troca quente de circuito em **98,9%**.

---

## 5. Métricas de Desempenho DEPOIS das Melhorias (`tests/performance/v11/after-metrics.json`)
Medido exatamente no mesmo ambiente (**Node.js v22.22.3 + Three.js 0.186.1**):

| Métrica | Antes (`v0.10.0`) | Depois (`v1.1.0`) | Variação |
| :--- | :---: | :---: | :---: |
| **Carregamento frio de 14 circuitos (`totalTrackLoadMs`)** | `818,83 ms` | **`656,98 ms`** | **-19,8%** |
| **Média de carregamento por circuito (`meanTrackLoadMs`)** | `58,49 ms` | **`46,93 ms`** | **-19,8%** |
| **Troca quente de 14 circuitos (`warmTrackSwitchTotalMs`)** | `818,83 ms` | **`8,74 ms` (`0,62 ms`/pista)** | **-98,9%** |
| **Tempo médio de CPU por frame (`frameCpuMs.mean`)** | `0,1430 ms` | **`0,1341 ms`** | **-6,2%** |
| **Tempo p99 de CPU por frame (`frameCpuMs.p99`)** | `0,8220 ms` | **`0,7444 ms`** | **-9,4%** |
| **Pico máximo de frame (`frameCpuMs.max`)** | `19,3185 ms` | **`10,1458 ms`** | **-47,5%** (abaixo de 16,67 ms) |
| **Memória Heap em execução (`heapUsedMB`)** | `38,49 MB` | **`29,51 MB`** | **-23,3%** |

---

## 6. Melhorias na Lógica de Corrida e IA Competitiva (Fase 3)
- **7 Perfis de IA implementados e exportados (`AI_PROFILES` em `src/ai.js`):**
  - `Conservador`, `Estratégico`, `Agressivo`, `Defensivo`, `Equilibrado`, `Novato` e `Elite`.
  - Cada perfil modula ritmo (`pace`), limiar de oportunidade de ultrapassagem (`opportunity`), distância de busca (`search`), margem de pneu (`tireMargin`), margem de combustível (`fuelMargin`) e propensão a erro sob pressão (`errorScale`).
- **Frenagem Antecipada Ponderada por Distância (`src/ai.js`):** Substituído o `Math.max` puro de 85 m por ponderação progressiva (`8 m × 1.0`, `25 m × 0.93`, `52 m × 0.79`, `85 m × 0.62`), permitindo que os bots mantenham velocidade máxima nas retas e freiem no ponto cinemático real de cada curva.
- **Balanço de Maquinário Rival (`rivalMachineryStats` em `src/race.js`):** As equipes rivais escalam de forma justa e competitiva com o desenvolvimento do jogador, evitando vitórias triviais em modo manual ou corridas monótonas em modo Chefe de Equipe.

---

## 7. Confirmação da Remoção do Segundo Piloto (Fase 4)
- O sistema de segundo piloto foi **integralmente removido**:
  - Cada uma das 6 equipes do grid possui **1 único piloto titular ativo** (`teamIds = [0, 1, 2, 3, 4, 5]`, `save.team.activeDrivers = 1`).
  - Removida a seleção de segundo piloto ("piloto de apoio" / `partner-list`) da tela de Carreira/Operações.
  - O painel de Estratégia (`ManagerUI.js`) e o campeonato de construtores (`TeamManager.js`, `Seasons.js`) operam exclusivamente sobre o carro titular da equipe contra as 5 escuderias rivais.
  - Saves antigos com `managerPlans` de 2 carros ou `team.partner` são migrados automaticamente em `validateSave()` sem perda de progresso.

---

## 8. Carros: Motores, 11 Componentes e Comparador Antes × Depois (Fase 5)
- **6 Fornecedores Fictícios de Unidade de Potência (`src/data/powerUnits.js`):**
  1. **Apex Works V6 E-Turbo (`APX-PU26`)** — Equilibrado
  2. **Veloce Corsa V6 HyperFlow (`VLC-990T`)** — Velocidade Final
  3. **Kestrel Impulse Hybrid (`KST-ERS+`)** — Aceleração e Retomada
  4. **Verdant EcoPulse E-Drive (`VRD-ECO6`)** — Eficiência Energética e Térmica
  5. **Titan Ironclad Heavy V6 (`TTN-HD26`)** — Confiabilidade e Durabilidade
  6. **Obsidian Solaris Prototype (`OBS-X01`)** — Alta Performance
- **11 Categorias de Componentes Configuráveis (`src/data/parts.js`):**
  - Asa Dianteira, Asa Traseira, Assoalho e Difusor, Suspensão Ativa, Sistema de Freios, Câmbio de 8 Marchas, Radiadores e Resfriamento, Preparação de Pneus, ECU e Telemetria, Monocoque e Chassi, Materiais e Revestimentos (4 especificações `Spec A` a `Spec D` por categoria, com peso, custo, desgaste e impacto real na física).
- **5 Presets Aerodinâmicos (`aeroSetupPresets`)** e **Comparador Antes × Depois (`compareSetupChanges`):** Exibe ganhos e perdas exatos em Velocidade Final (`km/h`), Aceleração (`m/s²`), Curva (`pts`), Frenagem (`m/s²`), Aderência (`m/s²`), Confiabilidade (`%`), Consumo (`%`) e Massa Total (`kg`) antes da confirmação.

---

## 9. Física, Aceleração, Temperatura de Motor e Colisões (Fase 6)
- Simulação contínua de **temperatura do motor (`car.engineTemp` em `src/racing/Physics.js`)** em função de carga de acelerador, fluxo de ar em alta velocidade (`speed`), eficiência térmica da Unidade de Potência + radiadores (`thermalEfficiency`) e danos acumulados.
- Penalidade progressiva de potência quando o motor opera acima de `114 °C`, integrada ao telemetro do volante F1.

---

## 10. Sistema de Circuitos, Barreiras 3D e Validador (Fase 7)
- **Barreiras de Pneus / TecPro 3D nas Curvas (`tireWall` em `src/renderer.js`):** Além dos guardrails metálicos contínuos e postes instanciados, curvas de média e alta curvatura (`curvature > 0.0075`) agora recebem pilhas 3D instanciadas de barreiras de proteção vermelhas e brancas posicionadas ao longo do `barrierOffset(s)`.
- **Validador Completo de Circuitos (`validateTrack` em `src/data/TrackGeometry.js`):** Verifica e certifica para todos os 14 circuitos:
  - `closedLoop: true` (circuito fechado sem buracos)
  - `barrierClearance >= 5.8 m` (nenhuma barreira invadindo a pista)
  - `pitAccessible: true` (entrada e saída de boxes acessíveis e válidas)
  - `aiLineValid: true` (linha de IA contínua e dentro dos limites)
  - `gridValid: true` (colchetes de largada alinhados)

---

## 11. Voltas, Retardatários e Campeonatos (Fase 8)
- **Presets de Distância de Corrida (`RACE_DISTANCE_PRESETS`):** Curta (`3 voltas`), Média (`5 voltas`), Longa (`9 voltas`), Endurance (`14 voltas`) e Personalizada.
- **Cálculo Preciso de Retardatários (`lapsBehind` em `src/race.js` e `src/ui/RaceHUD.js`):** Exibe corretamente `+1 VOLTA` (singular) e `+2 VOLTAS` (plural) na tabela de classificação ao vivo.
- **Gravação Leve de Telemetria/Replay (`replayFrames` em `src/race.js`).**

---

## 12. Volante F1 Multifuncional no Cockpit/HUD (Fase 9)
- Implementado o painel `#f1-wheel-cockpit` em `src/ui/RaceHUD.js` e `src/ui/race.css`:
  - **Barra de 16 LEDs de RPM** (verde → âmbar → vermelho → azul no limite de giro).
  - **Visor Central Multifuncional:** Velocidade em `km/h`, Marcha engatada (`N`, `R`, `1`–`8`), RPM em tempo real, Temperatura do motor (`°C` com alerta térmico), Barras verticais de Acelerador (`THR`) e Freio (`BRK`), Composto e saúde dos pneus, Combustível (`L`), Integridade estrutural (`OK` / `%`), Estado de boxes/bandeira, Volta atual, Delta para o líder e Ticker de Rádio da Equipe.
  - **Rotação dinâmica do volante** sincronizada com o esterçamento real do carro (`car.WheelAngle`) e botão `VOLANTE F1` na barra superior para alternar visibilidade a qualquer momento.

---

## 13. UX/UI de Gerenciamento e Pódio Visual (Fase 10)
- **Oficina de Engenharia Integrada** na página `Melhorias` com Comparador Antes × Depois, 6 Unidades de Potência, 5 Presets Aerodinâmicos e 11 Categorias de Peças.
- **Painel de Carreira e Escuderia** atualizado com Chefe de Equipe, Contratos de Patrocinadores (Master e Técnico) e Editor de Identidade da Equipe (nome personalizado, cores e número).
- **Pódio Visual de Celebração (`podium-stage`)** no modal de resultados destacando P1, P2 e P3 com troféus, tempos, pontos e relatório de metas de patrocinadores.

---

## 14. Patrocinadores Fictícios em 10 Setores (Fase 11)
- Criado o catálogo `src/data/sponsors.js` com **10 marcas fictícias originais** cobrindo todos os 10 setores solicitados:
  1. **Aether AI Systems** (Tecnologia)
  2. **Helios Fusion Energy** (Energia)
  3. **Pirex Motorsport Tires** (Pneus)
  4. **Bremtek Carbon Brakes** (Autopeças)
  5. **NexaTel 6G Global** (Telecomunicações)
  6. **Aurum Sovereign Capital** (Finanças)
  7. **Voltiva Zero Elixir** (Bebidas)
  8. **Kinetix Cloud Telemetry** (Software)
  9. **Vanguard Aero Logistics** (Logística)
  10. ** Kronos Precision Engineering** (Engenharia)
- Aplicados nas placas 3D de pista (`src/renderer.js`), nos contratos com metas e bônus em créditos (`src/progression.js`) e nos painéis de resultados.

---

## 15. Pilotos e Retratos Estilizados (Fase 12)
- Catálogo expandido de 31 para **43 pilotos (`src/data/drivers.js`)**, adicionando a categoria **Ícones do Grid (`icons`)** com 12 nomes consagrados do automobilismo:
  - **Max Verstappen, Kimi Antonelli, Lewis Hamilton, Charles Leclerc, Lando Norris, Oscar Piastri, Fernando Alonso, George Russell, Carlos Sainz, Ayrton Senna, Michael Schumacher e Gabriel Bortoleto.**
- Gerados **43 retratos estilizados (`384×432` PNG)** e **43 capacetes exclusivos (`256×256` RGBA PNG)** em `public/assets/drivers/icons/` via `scripts/driver-assets.py`, mantendo 100% de consistência visual e sem reivindicar licenças comerciais inexistentes.

---

## 16. Rádio de Equipe e Áudio (Fase 13)
- Mantido e validado o motor de áudio procedural + 8 faixas/efeitos OGG originais com controle independente de volume geral, motor, efeitos, música de menu, música de corrida, torcida espacializada por arquibancada e voz/texto do engenheiro de corrida (`RaceEngineer`).

---

## 17. As 25 Melhorias de Jogabilidade Implementadas (Fase 14)
1. Compostos de pneus Macio, Médio, Duro e Chuva com física de aderência e degradação térmica.
2. Paradas físicas nos boxes com troca de pneus, reparo de asas/dano e reabastecimento realista.
3. Estratégias configuráveis de 1, 2 ou mais paradas por janela de voltas.
4. Clima dinâmico (`Estável`, `Pancadas`, `Tempestade`, `Secagem`) com previsão de radar.
5. Pista molhada com redução progressiva de aderência e spray visual.
6. Safety Car (SC) e Virtual Safety Car (VSC) físicos com fila controlada e relargada.
7. Bandeiras verde, amarela setorial, dupla amarela, azul, vermelha, preta e branca, preta e quadriculada.
8. Sistema de penalidades dos comissários (queima de largada, limite de velocidade nos boxes, corte de pista com ganho, colisão traseira).
9. Danos mecânicos proporcionais e taxa configurável de avarias por minuto.
10. Desgaste persistente de motor (`engineWear`) e de cada uma das 11 peças (`partWear`).
11. Árvore de P&D e desenvolvimento de engenharia da equipe (`team.development` 0–5).
12. Gestão financeira com créditos, prêmios por posição, custos de peças e descontos de P&D.
13. Evolução de carreira com reputação, níveis de XP e contratos de categorias.
14. Sistema persistente de rivalidades com memória de ultrapassagens feitas e sofridas.
15. 6 Chefes de Equipe fictícios (`teamPrincipals`) com bônus reais de pit stop, desconto de P&D e patrocínio.
16. Eventos estratégicos de corrida (`strategicEvents`) e chamadas oportunistas de box sob SC/chuva.
17. Recordes de volta persistentes por circuito, regulamento e condição climática.
18. Pódio visual (`podium-stage`) e celebração de resultado no encerramento da corrida.
19. Editor de pintura 3D (`primary`, `secondary`, `detail`, `number`) aplicado diretamente à geometria do carro.
20. Editor de identidade da escuderia (`team.name` personalizável).
21. Gravação leve de frames de replay/telemetria (`race.replayFrames`).
22. Histórico detalhado de corridas, relatórios estratégicos do chefe de equipe e diário de comissários.
23. 6 Fornecedores fictícios de Unidade de Potência com características distintas.
24. 11 Categorias de componentes configuráveis com comparador Antes × Depois.
25. Volante F1 multifuncional no HUD com LEDs de giro, temperatura de motor e telemetria completa.

---

## 18. Controles, Modo Manual e Testes Executados (Fases 15 e 16)
- **Controles verificados (`tests/v04.test.js`):** `A` / `ArrowLeft` esterça para a esquerda e `D` / `ArrowRight` esterça para a direita em todas as câmeras (`chase`, `cockpit`, `hood`, `tv`, `nose`, `orbit`, `top`), sem listeners duplicados (`data-touch-bound` idempotente em `Game.bindTouch()`).
- **Suíte automatizada completa (`npm test`):** **190 testes automatizados executados, 190 aprovados (`0` falhas)** cobrindo física, colisões OBB, paradas físicas nos boxes, 14 circuitos, 7 campeonatos completos, Safety Car, bandeiras, 43 pilotos, 6 motores, 11 peças, 10 patrocinadores e orçamentos de estabilidade de frame.

---

## 19. Limitações Conhecidas
- O container Linux de execução não possui binário de navegador/GPU instalado localmente para o Playwright headless, portanto os 190 testes de integração/física/câmera/cena rodam via Node.js (`npm test`) e a validação visual interativa ocorre diretamente no servidor de Preview ao vivo (`vite --host 0.0.0.0`).

---

## 20. Instruções para Executar o Projeto Localmente
```bash
# 1. Instalar dependências
npm ci

# 2. Iniciar servidor de desenvolvimento (com Hot Reload)
npm run dev

# 3. Executar a suíte completa de 190 testes automatizados
npm test

# 4. Gerar build de produção em dist/ e atualizar playable/
npm run build:playable
```
