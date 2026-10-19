import { setPlan } from "../strategy/PitStrategy.js";
import { compounds } from "../strategy/Resources.js";
import { driverCatalog } from "../data/drivers.js";
import { vehicles, purchasePart } from "../garage.js";
import { defaults } from "../save.js";
import { requestPit } from "../strategy/PitStop.js";
import { nextCamera } from "../camera/CameraManager.js";
import { powerUnits } from "../data/powerUnits.js";
import { aeroSetupById } from "../data/parts.js";
import { sponsorById, teamPrincipalById } from "../data/sponsors.js";
export function handleExtraAction(g, action, data) {
  const s = g.save,
    ui = g.ui;
  const refresh = () => {
    g.store();
    ui.render();
  };
  const applySettings = () => {
    g.controls.configure(g.save.settings);
    g.audio.configure(g.save.settings);
    g.engineer.configure(g.save.settings);
    g.world.quality(g.save.settings);
  };
  switch (action) {
    case "venue-tour":
      g.world.venueFocus =
        ((g.world.venueFocus ?? -1) + 1) % g.world.venues.plan.length;
      g.world.setMode("venue-preview");
      ui.toast(
        "Arquibancada " +
          (g.world.venueFocus + 1) +
          " / 10 · " +
          g.world.venues.plan[g.world.venueFocus].label,
      );
      return true;
    case "track-overview":
      g.world.setMode("track-preview");
      return true;
    case "track-catalog":
      ui.closeModal();
      ui.navigate("tracks");
      return true;
    case "track-filter":
      ui.trackFilter = data.category;
      ui.render();
      g.world.setMode("track-preview");
      return true;
    case "choose-track":
      g.loadTrack(data.id, { page: true });
      return true;

    case "hud-mode": {
      const modes = ["standard", "compact", "immersive"];
      g.setting("hudMode", modes[(modes.indexOf(s.settings.hudMode) + 1) % 3]);
      return true;
    }
    case "toggle-wheel": {
      const next = s.settings.showWheelCockpit === false;
      s.settings.showWheelCockpit = next;
      g.store();
      const wheel = document.getElementById("f1-wheel-cockpit");
      if (wheel) wheel.classList.toggle("show", next);
      ui.toast(
        next ? "Volante F1 ativado no HUD." : "Volante F1 recolhido.",
      );
      return true;
    }
    case "preview-pu": {
      ui.previewOverrides = { powerUnitId: Number(data.id) };
      ui.render();
      ui.toast("Comparador atualizado com a Unidade de Potência selecionada.");
      return true;
    }
    case "select-pu": {
      const id = Number(data.id);
      const pu = powerUnits[id];
      if (!pu) return true;
      s.unlockedPowerUnits = s.unlockedPowerUnits || [0];
      if (!s.unlockedPowerUnits.includes(id)) {
        if (s.credits < pu.cost) {
          ui.toast("Créditos insuficientes para adquirir esta Unidade de Potência.");
          return true;
        }
        s.credits -= pu.cost;
        s.unlockedPowerUnits.push(id);
      }
      s.selectedPowerUnit = id;
      ui.previewOverrides = null;
      refresh();
      ui.toast(pu.name + " instalado no carro titular.");
      return true;
    }
    case "preview-part": {
      ui.previewOverrides = {
        carParts: { [data.key]: Number(data.level) },
      };
      ui.render();
      ui.toast("Comparador Antes × Depois atualizado.");
      return true;
    }
    case "buy-part": {
      const res = purchasePart(s, data.key);
      ui.previewOverrides = null;
      if (res.ok) {
        refresh();
        ui.toast(res.message);
      } else {
        ui.toast(res.message);
      }
      return true;
    }
    case "aero-setup": {
      s.aeroSetup = aeroSetupById(data.value).id;
      ui.previewOverrides = null;
      refresh();
      ui.toast("Acerto aerodinâmico: " + aeroSetupById(s.aeroSetup).name);
      return true;
    }
    case "team-principal": {
      const tp = teamPrincipalById(Number(data.value));
      s.teamPrincipal = tp.id;
      refresh();
      ui.toast("Chefe de Equipe ativo: " + tp.name);
      return true;
    }
    case "sponsor-primary": {
      const sp = sponsorById(data.value);
      s.sponsors = s.sponsors || {
        primary: "aether_ai",
        secondary: "pirex_tires",
        goalsCompleted: 0,
        totalEarned: 0,
      };
      s.sponsors.primary = sp.id;
      refresh();
      ui.toast("Patrocinador Master: " + sp.name);
      return true;
    }
    case "sponsor-secondary": {
      const sp = sponsorById(data.value);
      s.sponsors = s.sponsors || {
        primary: "aether_ai",
        secondary: "pirex_tires",
        goalsCompleted: 0,
        totalEarned: 0,
      };
      s.sponsors.secondary = sp.id;
      refresh();
      ui.toast("Patrocinador Técnico: " + sp.name);
      return true;
    }

    case "pilot": {
      const id = Number(data.id),
        d = driverCatalog[id];
      if (!d) return true;
      if (!s.unlockedDrivers.includes(id)) {
        if (id === 30) {
          ui.toast("Vença o confronto Mega Baxter para desbloquear.");
          return true;
        }
        if (s.credits < d.cost) {
          ui.toast("Créditos insuficientes para contratar.");
          return true;
        }
        s.credits -= d.cost;
        s.unlockedDrivers.push(id);
      }
      s.selectedDriver = id;
      refresh();
      ui.toast(d.name + " contratado e selecionado.");
      return true;
    }
    case "buy-car": {
      const id = Number(data.id),
        v = vehicles[id];
      if (v?.cost && !s.unlockedCars.includes(id) && s.credits >= v.cost) {
        s.credits -= v.cost;
        s.unlockedCars.push(id);
        s.selectedCar = id;
        g.world.customization = s.customizations[id];
        g.world.setPreview(id);
        refresh();
        ui.toast("Novo carro adquirido.");
      } else ui.toast("Saldo ou requisito insuficiente.");
      return true;
    }
    case "paint-editor":
      ui.showModal("paint-editor");
      return true;
    case "save-paint": {
      const customTeamName = document.getElementById("team-custom-name")?.value;
      if (customTeamName && customTeamName.trim()) {
        s.team.name = customTeamName.trim().slice(0, 30);
      }
      const primary = document.getElementById("paint-primary").value,
        secondary = document.getElementById("paint-secondary").value,
        detail = document.getElementById("paint-detail").value,
        number = Math.round(
          Math.max(
            0,
            Math.min(
              99,
              Number(document.getElementById("paint-number").value) || 0,
            ),
          ),
        );
      s.customizations[s.selectedCar] = { primary, secondary, detail, number };
      g.world.customization = s.customizations[s.selectedCar];
      g.world.setPreview(s.selectedCar);
      ui.closeModal();
      refresh();
      ui.toast("Identidade da equipe, pintura e número aplicados ao carro.");
      return true;
    }
    case "reset-paint":
      delete s.customizations[s.selectedCar];
      g.world.customization = null;
      g.world.setPreview(s.selectedCar);
      ui.closeModal();
      refresh();
      return true;
    case "rotate":
      g.world.previewRotation += ((Number(data.direction) || 1) * Math.PI) / 4;
      g.world.showCar.rotation.y +=
        ((Number(data.direction) || 1) * Math.PI) / 4;
      return true;
    case "camera":
      ui.toast(nextCamera(g.world));
      return true;
    case "pit":
      if (g.race?.manager) {
        const c = g.race.cars.find(
          (c) => c.id === (g.race.isDelegated() ? g.world.focusId || 0 : 0),
        );
        if (g.race.manager.owns(c))
          g.race.manager.command(
            c.id,
            c.pit.requested ? "cancel" : "pit",
            c.pit.compound,
          );
        return true;
      }
      if (g.race?.state === "racing") {
        const c = g.race.cars[0];
        const yes = requestPit(c);
        g.engineer.say(
          yes
            ? "Boxes solicitados. Aproxime-se pelo lado sinalizado dos boxes antes da linha de chegada. Entrada guiada, sem teletransporte."
            : "Pedido de boxes cancelado.",
          2,
          g.race.time,
          "pit-" + g.race.time,
        );
      }
      return true;
    case "radio":
      g.engineer.report(g.race);
      return true;
    case "pit-options":
      if (g.race?.isDelegated()) {
        g.action("manager-open");
        return true;
      }
      if (g.race) {
        if (g.race.state !== "paused") g.pause(true);
        ui.showModal("pit-options");
      }
      return true;
    case "pit-cancel":
      if (g.race?.cars[0].pit.state === "track") {
        g.race.cars[0].pit.requested = false;
        g.pause();
      }
      return true;
    case "pit-plan-save":
    case "pit-compound": {
      if (!g.race) return true;
      const c = g.race.cars[0],
        p = c.pit;
      const plan = document.getElementById("pit-plan");
      if (plan) {
        setPlan(
          c,
          plan.value.split(",").map((n) => Number(n.trim())),
        );
        if (g.race.manager)
          g.race.manager.order(c.id, {
            stops: p.plan.map((l) => ({
              from: l,
              to: l,
              compound: p.compound,
            })),
          });
        s.settings.pitPlan = p.plan.slice();
        g.store();
      }
      if (!["service", "release"].includes(p.state)) {
        for (const job of ["tires", "repair", "fuel"]) {
          const el = document.getElementById("pit-job-" + job);
          if (el)
            p.jobs[job] =
              el.checked && (job !== "fuel" || c.realism === "realistic");
        }
        const target = Number(
          document.getElementById("pit-fuel-target")?.value,
        );
        if ([0.25, 0.5, 0.75, 1].includes(target)) p.fuelTarget = target;
        if (action === "pit-compound" && compounds[data.key])
          p.compound = data.key;
      }
      if (g.race.state === "paused") g.pause();
      else ui.closeModal();
      if (action === "pit-compound" && !p.requested && p.state === "track")
        g.action("pit");
      if (action === "pit-plan-save")
        ui.toast(
          "Plano salvo: " + (p.plan.join(", ") || "sem paradas programadas"),
        );
      return true;
    }
    case "rebind": {
      const key = data.key;
      ui.toast("Pressione a nova tecla. Esc cancela.");
      g.controls.capture = (code) => {
        if (code === "Escape") return;
        if (!/^(Key[A-Z]|Digit[0-9])$/.test(code)) {
          ui.toast("Use uma letra ou número.");
          return;
        }
        if (
          Object.entries(s.settings.bindings).some(
            ([k, v]) => k !== key && v === code,
          )
        ) {
          ui.toast("Esta tecla já está em uso.");
          return;
        }
        s.settings.bindings[key] = code;
        g.controls.configure(s.settings);
        g.store();
        ui.showModal("settings");
      };
      return true;
    }
    case "reset-career":
      ui.showModal("reset-career");
      return true;
    case "confirm-reset":
      g.save = defaults();
      applySettings();
      g.switchTrack(g.save.settings.track);
      g.store();
      ui.closeModal();
      ui.navigate("home");
      ui.toast("Carreira reiniciada.");
      return true;
    case "exit-race":
      ui.showModal("confirm-exit");
      return true;
    case "confirm-exit":
      g.race = null;
      g.engineer.reset();
      g.controls.clear();
      g.loop.reset();
      ui.closeModal();
      ui.navigate("home");
      return true;
    case "team-upgrade": {
      const cost = 1200 + s.team.development * 700;
      if (
        s.team.development >= 5 ||
        s.upgrades.handling >= 5 ||
        s.credits < cost
      ) {
        ui.toast("Saldo insuficiente ou nível máximo.");
        return true;
      }
      s.credits -= cost;
      s.team.development++;
      s.upgrades.handling = Math.min(5, s.upgrades.handling + 1);
      refresh();
      ui.toast("Desenvolvimento de equipe aplicado ao controle dos carros.");
      return true;
    }
    case "partner":
      if (Number(data.id) === s.selectedDriver) {
        ui.toast("Contrate outro piloto para formar uma dupla.");
        return true;
      }
      if (s.unlockedDrivers.includes(Number(data.id))) {
        s.team.partner = Number(data.id);
        refresh();
      }
      return true;
    case "mega-event":
      if (!s.stats.seasons && !g.admin.active) {
        ui.toast("Complete um campeonato para desafiar Mega Baxter.");
        return true;
      }
      s.settings.mode = "mega";
      s.settings.difficulty = "elite";
      s.settings.realism = "arcade";
      g.store();
      ui.showModal("setup");
      return true;
    case "admin-login":
      ui.showModal("admin-login");
      return true;
    case "admin-enter":
      if (g.admin.enter(g, document.getElementById("admin-password").value)) {
        ui.closeModal();
        ui.navigate("admin");
      } else ui.toast("Senha incorreta.");
      return true;
    case "admin-exit":
      if (g.race) {
        ui.toast("Saia da corrida de teste antes de encerrar o laboratório.");
        return true;
      }
      g.admin.exit(g);
      applySettings();
      g.switchTrack(g.save.settings.track);
      ui.navigate("home");
      return true;
    case "admin-unlock":
      if (g.admin.active) {
        g.admin.unlock(g);
        refresh();
      }
      return true;
    case "admin-credit":
      if (g.admin.active) {
        s.credits = Math.max(
          0,
          Math.min(
            1e8,
            Number(document.getElementById("admin-credits").value) || 0,
          ),
        );
        refresh();
      }
      return true;
    case "admin-reset":
      if (g.admin.active) {
        g.admin.restore(g);
        applySettings();
        g.switchTrack(g.save.settings.track);
        refresh();
      }
      return true;
    case "admin-inspect":
      if (g.admin.active) {
        if (g.race && g.race.state !== "paused") g.pause(true);
        ui.showModal("admin-inspect");
      }
      return true;
    case "admin-damage":
      if (g.admin.active && g.race) {
        g.race.cars[0].damage = 0.65;
        g.race.cars[0].impact = 30;
        ui.toast("Impacto de teste registrado.");
      }
      return true;
    case "admin-pit":
      if (g.admin.active && g.race) {
        g.race.cars[0].pit.requested = true;
        g.race.cars[0].fuel = g.race.cars[0].fuelPerLap;
        ui.toast("Boxes solicitados. Nenhum teletransporte.");
      }
      return true;
    default:
      return false;
  }
}
