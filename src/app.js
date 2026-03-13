// TriQualify — main application
import { RACES } from "./data/races.js";
import { calculateRaces, formatTime, getAdjustmentDetails } from "./calculator.js";

// App state
const state = {
  athleteProfile: "balanced",
  swimCond: "wetsuit",
  bikeProfile: "flat",
  bikeWind: "none",
  runProfile: "flat",
  heat: "normal",
  continent: "all",
};

// Wire up all toggle button groups
function initToggles() {
  const groups = {
    "grp-profile":   "athleteProfile",
    "grp-swim":      "swimCond",
    "grp-bike":      "bikeProfile",
    "grp-bikewind":  "bikeWind",
    "grp-run":       "runProfile",
    "grp-heat":      "heat",
    "grp-continent": "continent",
  };
  Object.entries(groups).forEach(([groupId, stateKey]) => {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll(".toggle").forEach((el) => {
      el.addEventListener("click", () => {
        group.querySelectorAll(".toggle").forEach((t) => t.classList.remove("active"));
        el.classList.add("active");
        state[stateKey] = el.dataset.val;
      });
    });
  });
}

function getTimeSec() {
  const h = parseInt(document.getElementById("th").value) || 0;
  const m = parseInt(document.getElementById("tm").value) || 0;
  const s = parseInt(document.getElementById("ts").value) || 0;
  return h * 3600 + m * 60 + s;
}

function calculate() {
  const timeSec = getTimeSec();
  if (timeSec < 28800 || timeSec > 72000) {
    alert("Please enter a finish time between 8:00:00 and 20:00:00");
    return;
  }
  const gender   = document.getElementById("gender").value;
  const ageGroup = document.getElementById("agegroup").value;
  const conditions = {
    bikeProfile: state.bikeProfile,
    runProfile:  state.runProfile,
    swimCond:    state.swimCond,
    heat:        state.heat,
    wind:        state.bikeWind,
  };
  const results = calculateRaces(RACES, timeSec, conditions, gender, ageGroup, state.athleteProfile, state.continent);
  renderResults(results, gender, ageGroup, timeSec);
}

function renderResults(results, gender, ageGroup, rawSec) {
  const section = document.getElementById("results-section");
  section.style.display = "block";

  const profileLabels = { balanced: "Balanced", biker: "Strong cyclist", runner: "Strong runner", swimmer: "Strong swimmer" };
  const windLabels    = { none: "no wind", moderate: "moderate wind", strong: "strong wind" };
  const heatLabels    = { normal: "normal temp.", hot: "hot", extreme: "extreme heat" };
  const bikeLabels    = { flat: "Flat", hilly: "Hilly", vhilly: "Very hilly" };
  const runLabels     = { flat: "Flat", hilly: "Hilly", vhilly: "Very hilly" };

  let html = `
    <div class="result-header">
      <div class="result-title">Your calculation</div>
      <div class="result-sub">
        Reference time: <strong>${formatTime(rawSec)}</strong> · Profile: <strong>${profileLabels[state.athleteProfile]}</strong><br>
        Age group: <strong>${gender === "M" ? "Male" : "Female"} ${ageGroup}</strong>
      </div>
      <div class="segs-row">
        <div class="seg-box"><div class="seg-box-label">Bike</div><div class="seg-box-val">${bikeLabels[state.bikeProfile]}</div></div>
        <div class="seg-box"><div class="seg-box-label">Run</div><div class="seg-box-val">${runLabels[state.runProfile]}</div></div>
        <div class="seg-box"><div class="seg-box-label">Swim</div><div class="seg-box-val">${state.swimCond === "wetsuit" ? "Wetsuit" : "No wetsuit"}</div></div>
        <div class="seg-box"><div class="seg-box-label">Wind</div><div class="seg-box-val">${windLabels[state.bikeWind]}</div></div>
        <div class="seg-box"><div class="seg-box-label">Temp.</div><div class="seg-box-val">${heatLabels[state.heat]}</div></div>
      </div>
    </div>
  `;

  results.forEach((r, i) => {
    const under = r.diffMin < 0;
    const tight = r.diffMin >= -5 && r.diffMin < 0;
    const absDiff = Math.abs(r.diffMin).toFixed(1);

    const chanceClass = r.diffMin < -15 ? "chance-high" : r.diffMin < 0 ? "chance-med" : "chance-low";
    const chanceLabel = r.diffMin < -15 ? "Strong chance" : r.diffMin < 0 ? "Realistic chance" : "Not there yet";
    const viClass = tight ? "vi-amber" : under ? "vi-green" : "vi-red";
    const vtClass = tight ? "vt-amber" : under ? "vt-green" : "vt-red";
    const verdictTxt = under
      ? `${absDiff} min under cutoff${tight ? " — tight, depends on field" : ""}`
      : `${absDiff} min over cutoff — you need to go faster`;

    const ratioClass = r.slotRatio >= 4 ? "ratio-good" : r.slotRatio >= 2.5 ? "ratio-med" : "ratio-low";
    const ratioLabel = r.slotRatio >= 4 ? "High slot ratio" : r.slotRatio >= 2.5 ? "Average slot ratio" : "Low slot ratio";

    const compVsSlots = r.fieldQualCount <= r.agSlots
      ? `<span class="ratio-good">enough slots for all who meet standard</span>`
      : `<span class="ratio-low">more will meet standard than available slots</span>`;

    const barColor = r.fieldPct <= 12 ? "fill-green" : r.fieldPct <= 20 ? "fill-amber" : "fill-red";

    let compVerdict, compClass;
    if (under) {
      if (r.fieldQualCount <= r.agSlots) {
        compVerdict = `Est. ~${r.fieldQualCount} athletes in your age group will meet the standard, with ~${r.agSlots} slots available — likely everyone who qualifies gets a slot.`;
        compClass = "fv-green";
      } else {
        compVerdict = `Est. ~${r.fieldQualCount} athletes in your age group will meet the standard, but only ~${r.agSlots} slots available — meeting the standard alone may not be enough.`;
        compClass = "fv-amber";
      }
    } else {
      compVerdict = `You need to lower your age-graded time by ${absDiff} min. Est. ~${r.fieldQualCount} athletes in your age group will meet the standard.`;
      compClass = "fv-red";
    }

    const adjDetails = getAdjustmentDetails(r, state.athleteProfile);
    const bL = { flat: "Bike: flat", hilly: "Bike: hilly", vhilly: "Bike: very hilly" };
    const rL = { flat: "Run: flat", hilly: "Run: hilly", vhilly: "Run: very hilly" };

    let badges = [];
    if (r.flagship) badges.push(`<span class="badge badge-slots">Continental Champ.</span>`);
    badges.push(r.wetsuit ? `<span class="badge badge-wet">Wetsuit</span>` : `<span class="badge badge-hot">No wetsuit</span>`);
    if (r.heat === "hot")      badges.push(`<span class="badge badge-hot">Hot</span>`);
    if (r.heat === "extreme")  badges.push(`<span class="badge badge-hot">Extreme heat</span>`);
    if (r.wind === "moderate") badges.push(`<span class="badge badge-wind">Wind</span>`);
    if (r.wind === "strong")   badges.push(`<span class="badge badge-wind">Strong wind</span>`);
    badges.push(`<span class="badge ${r.bike === "flat" ? "badge-fast" : "badge-hills"}">${bL[r.bike]}</span>`);
    badges.push(`<span class="badge ${r.run === "flat" ? "badge-fast" : "badge-hills"}">${rL[r.run]}</span>`);

    html += `
      <div class="race-card ${i === 0 ? "top" : ""}">
        <div class="race-top">
          <div>
            <div class="race-name">${i + 1}. <a href="${r.officialUrl}" target="_blank" rel="noopener">${r.name}</a></div>
            <div class="race-date">${r.date} · ${r.country}</div>
          </div>
          <span class="race-chance ${chanceClass}">${chanceLabel}</span>
        </div>
        <div class="race-details">${badges.join("")}</div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Kona slots total</div>
            <div class="stat-val">${r.slots} <span style="font-size:12px;font-weight:400;color:#888">/ ${r.slotRatio.toFixed(1)}%</span></div>
            <div class="stat-sub ${ratioClass}">${ratioLabel}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Starters / your age group</div>
            <div class="stat-val">${r.starters.toLocaleString("en")} <span style="font-size:12px;font-weight:400;color:#888">/ ~${r.agStarters}</span></div>
            <div class="stat-sub" style="color:#888">~${r.agSlots} slots for your age group</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Your age group — meets standard</div>
            <div class="stat-val">~${r.fieldQualCount} <span style="font-size:12px;font-weight:400;color:#888">athletes</span></div>
            <div class="stat-sub">${compVsSlots}</div>
          </div>
        </div>

        <div class="cutoff-block">
          <div class="cutoff-row">
            <span class="cutoff-label">Your projected finish time</span>
            <div>
              <div class="cutoff-val">${formatTime(r.projectedSec)}</div>
              <div class="adj-detail">${adjDetails}</div>
            </div>
          </div>
          <div class="cutoff-row">
            <span class="cutoff-label">Your age-graded time</span>
            <span class="cutoff-val">${formatTime(r.projectedAG)}</span>
          </div>
          <div class="cutoff-row">
            <span class="cutoff-label">Kona Standard cutoff</span>
            <span class="cutoff-val">${formatTime(r.cutoffSec)}</span>
          </div>
          <div class="cutoff-row">
            <span class="cutoff-label">Verdict</span>
            <div class="verdict">
              <div class="verdict-icon ${viClass}">${under ? "✓" : "✗"}</div>
              <span class="${vtClass}">${verdictTxt}</span>
            </div>
          </div>
          <div class="field-bar-wrap">
            <div class="field-bar-label">Estimated % of field meeting Kona Standard at this race</div>
            <div class="field-bar-bg">
              <div class="field-bar-fill ${barColor}" style="width:${Math.min(100, r.fieldPct)}%"></div>
            </div>
            <div class="field-bar-note">
              <span>0% (nobody)</span>
              <span style="color:#1D9E75">~${r.fieldPct}% meet standard</span>
              <span>100% (everyone)</span>
            </div>
            <div class="field-verdict ${compClass}">${compVerdict}</div>
          </div>
        </div>
      </div>
    `;
  });

  section.innerHTML = html;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  initToggles();
  document.getElementById("calc-btn").addEventListener("click", calculate);
});
