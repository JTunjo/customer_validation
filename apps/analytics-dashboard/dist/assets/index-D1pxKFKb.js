(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(e){if(e.ep)return;e.ep=!0;const r=o(e);fetch(e.href,r)}})();const b="https://script.google.com/macros/s/AKfycbyPJKstRan77EPASJMjb1yMuD2PPG6xTWp5zIqHhC6dDsQdFKxEXLVivPMVPt8iSPww/exec";async function g(){const t=await fetch(`${b}?action=analytics`);if(!t.ok)throw new Error(`Error de red (${t.status}) al pedir la analítica`);return t.json()}const $=document.getElementById("app"),d=["tarjeta_1","tarjeta_2","tarjeta_3"];function a(t){const s=document.createElement("div");return s.textContent=t??"",s.innerHTML}function h(t){return`${Math.round(t*100)}%`}function v(t){if(!t)return"—";const s=new Date(t);return Number.isNaN(s.getTime())?String(t):s.toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"})}async function f(){m('<p class="hint">Cargando analítica…</p>');try{const t=await g();w(t)}catch(t){m(`<p class="empty">No se pudo cargar la analítica: ${a(t.message)}</p>`)}}function m(t){var s;$.innerHTML=`
    <div class="wrap">
      <div class="header">
        <div>
          <h1 class="title">Analítica · Velvet Greens</h1>
          <p class="subtitle">Customer Discovery — validación de hipótesis</p>
        </div>
        <button type="button" id="refresh-btn" class="btn">Actualizar</button>
      </div>
      ${t}
    </div>
  `,(s=document.getElementById("refresh-btn"))==null||s.addEventListener("click",f)}function w(t){const s=[P(t),S(t),x(t),j(t),E(t)].join("");m(`
    <p class="subtitle">
      ${t.numInterviews} entrevista${t.numInterviews===1?"":"s"} registrada${t.numInterviews===1?"":"s"}
      · actualizado ${v(t.generatedAt)}
    </p>
    ${s}
  `)}function P(t){const s=[...t.interviews].sort((n,e)=>new Date(e.fecha)-new Date(n.fecha)),o=s.length?`
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Entrevista</th>
            <th>Fecha</th>
            <th>Hipótesis ganadora</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${s.map(n=>{var e;return`
            <tr>
              <td>${a(n.entrevistador)} · ${a(n.ciudad)}</td>
              <td>${v(n.fecha)}</td>
              <td><span class="badge">${a(((e=t.hypotheses[n.winner])==null?void 0:e.label)||n.winner)}</span></td>
              <td>${h(n.score)}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`:'<p class="empty">Todavía no hay entrevistas guardadas.</p>';return l("Hipótesis por encuesta","Hipótesis ganadora y score (veces elegida / 9) de cada entrevista.",o)}function S(t){const s=d.map(o=>{const n=t.hypotheses[o],e=t.maxPossiblePoints>0?n.totalPoints/t.maxPossiblePoints*100:0;return`
      <div class="card hypo-card">
        <h3>${a(n.label)}</h3>
        <p class="points">${n.totalPoints} <small>puntos</small></p>
        <div class="bar-track"><div class="bar-fill" style="width:${e}%"></div></div>
      </div>`}).join("");return l("Resultados globales",`Suma de veces elegida cada hipótesis en las 9 preguntas comparativas, de todas las entrevistas. Máximo teórico combinado: ${t.maxPossiblePoints} puntos (9 × número de encuestas).`,`<div class="hypo-grid">${s}</div>`)}function x(t){const o=`
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Hipótesis</th>
            <th>Score promedio</th>
            <th>Desv. estándar</th>
            <th>% encuestas válidas (≥65%)</th>
          </tr>
        </thead>
        <tbody>${t.ranking.map((n,e)=>{const r=t.hypotheses[n];return`
        <tr>
          <td>${e===0?'<span class="badge badge-rank1">#1</span>':`#${e+1}`}</td>
          <td>${a(r.label)}</td>
          <td>${h(r.meanScore)}</td>
          <td>${h(r.stdDev)}</td>
          <td>${r.pctValid.toFixed(0)}%</td>
        </tr>`}).join("")}</tbody>
      </table>
    </div>`;return l("Ranking de hipótesis","Ordenado por % de encuestas donde la hipótesis alcanzó al menos 65% de score; en empate, por score promedio.",o)}function j(t){const s=d.map(e=>`<th>${a(t.hypotheses[e].label)}</th>`).join(""),o=t.perQuestion.map(e=>{const r=d.map(u=>e.counts[u]||0),i=Math.max(...r,1),c=d.map(u=>{const p=e.counts[u]||0,y=`rgba(23, 23, 21, ${(p/i).toFixed(2)})`;return`<td class="matrix-cell" data-intensity="${p===0?0:1}" style="background:${y}">${p}</td>`}).join("");return`<tr><td>${a(e.question)}</td>${c}</tr>`}).join(""),n=`
    <div class="table-scroll">
      <table>
        <thead><tr><th>Pregunta</th>${s}</tr></thead>
        <tbody>${o}</tbody>
      </table>
    </div>`;return l("Resultados por pregunta","Veces elegida cada hipótesis en cada una de las 9 preguntas comparativas. El color resalta cuál domina esa pregunta.",n)}function E(t){const s=d.map(o=>{const n=t.hypotheses[o],e=t.wordcloud[o]||[],r=Math.max(...e.map(c=>c.count),1),i=e.length?`<div class="wordcloud-terms">
          ${e.map(c=>`<span class="wordcloud-term" style="font-size:${(.85+c.count/r*1.6).toFixed(2)}rem">${a(c.term)}</span>`).join("")}
        </div>`:'<p class="empty">Sin datos todavía. Agrega la columna <code>key_terms</code> en la hoja "Interviews" (términos separados por comas) para ver esto.</p>';return`<div class="wordcloud-col"><h3>${a(n.label)}</h3>${i}</div>`}).join("");return l("Sesión abierta — Wordcloud por hipótesis ganadora","Términos más frecuentes (columna manual key_terms) entre las entrevistas donde ganó cada hipótesis, sin stopwords.",`<div class="wordcloud-grid">${s}</div>`)}function l(t,s,o){return`
    <div class="section">
      <h2>${a(t)}</h2>
      <p class="hint">${a(s)}</p>
      <div class="card">${o}</div>
    </div>`}f();
