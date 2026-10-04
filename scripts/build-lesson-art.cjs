// Original, language-neutral vector illustrations for Digital Wellbeing.
const fs = require("node:fs");
const path = require("node:path");
const target = path.resolve(__dirname, "../frontend/public/media");
const defs = `<defs>
  <linearGradient id="paper" x2="1" y2="1"><stop stop-color="#fcfaf5"/><stop offset="1" stop-color="#f1ede5"/></linearGradient>
  <linearGradient id="sage" x2=".8" y2="1"><stop stop-color="#bcd3bf"/><stop offset="1" stop-color="#719780"/></linearGradient>
  <linearGradient id="lavender" x2=".7" y2="1"><stop stop-color="#e2d8f4"/><stop offset="1" stop-color="#a694c1"/></linearGradient>
  <linearGradient id="ink" x2=".7" y2="1"><stop stop-color="#726583"/><stop offset="1" stop-color="#423d55"/></linearGradient>
  <linearGradient id="skin" x2=".8" y2="1"><stop stop-color="#d8b79f"/><stop offset="1" stop-color="#b88a72"/></linearGradient>
  <linearGradient id="night" x2=".8" y2="1"><stop stop-color="#514d6d"/><stop offset="1" stop-color="#2e3548"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#453a62" flood-opacity=".12"/></filter>
</defs>`;
function frame(body) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" fill="none">${defs}<rect width="600" height="360" rx="28" fill="url(#paper)"/><circle cx="415" cy="160" r="139" fill="#e8e2f0" opacity=".48"/><path d="M44 320H554" stroke="#ded8cf" stroke-width="2"/>${body}</svg>\n`; }
const check = (x, y, r=18) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#edf4ec" stroke="#87a68d" stroke-width="2"/><path d="m${x-7} ${y} 5 5 10-11" stroke="#52775d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
const dots = (x,y) => `<circle cx="${x}" cy="${y}" r="4" fill="#a18db5"/><circle cx="${x+15}" cy="${y}" r="4" fill="#c0aece"/><circle cx="${x+30}" cy="${y}" r="4" fill="#d5c8de"/>`;
const leaf = (x,y) => `<path d="M${x} ${y}q-30-43-50-27 0 31 50 40m0-13q16-51 43-43 6 32-43 56" fill="url(#sage)"/><path d="M${x} ${y+40}v-39" stroke="#6b8c75" stroke-width="4" stroke-linecap="round"/>`;
const arts = {
  "ergonomics": frame(`
    <rect x="59" y="45" width="96" height="153" rx="44" fill="#e1e9dd"/><path d="M107 52v139m-41-76h83" stroke="#fbfaf5" stroke-width="5"/>
    <ellipse cx="309" cy="319" rx="205" ry="13" fill="#44365e" opacity=".06"/>
    <g filter="url(#shadow)"><rect x="142" y="134" width="28" height="101" rx="13" fill="url(#ink)"/><path d="M160 183q21 12 13 43" stroke="#9482ae" stroke-width="12" stroke-linecap="round"/>
    <rect x="146" y="231" width="125" height="15" rx="7" fill="url(#ink)"/><path d="M204 247v43m0 0-53 17m53-17 53 17" stroke="#746c7f" stroke-width="7" stroke-linecap="round"/><circle cx="150" cy="311" r="7" fill="#5c556b"/><circle cx="257" cy="311" r="7" fill="#5c556b"/>
    <path d="M174 217h98q10 0 10 11v72" stroke="#68758a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><path d="M282 303h22q13 0 15 17h-47v-17" fill="#4d5267"/>
    <path d="M176 125q13-12 27 0l9 104h-45l-4-72q-1-23 13-32Z" fill="url(#sage)"/><path d="M190 108v20" stroke="#caa58c" stroke-width="15"/>
    <path d="M206 65q11 10 8 19l7 6-9 5q-2 20-20 20-25-1-28-25-5-32 22-34Z" fill="url(#skin)"/><path d="M167 91q-18-35 14-41 28-4 34 19-19-5-35 10l-1 14Z" fill="#5b4850"/><circle cx="207" cy="82" r="2.5" fill="#594551"/><path d="M204 100h7" stroke="#8e635a" stroke-width="2" stroke-linecap="round"/>
    <path d="M187 142v41h67" stroke="url(#skin)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M176 137h24v27h-23Z" fill="#8eaf96"/>
    <rect x="248" y="193" width="261" height="12" rx="5" fill="#b09c8b"/><path d="M334 205v110m157-110v110" stroke="#9a8b7e" stroke-width="8" stroke-linecap="round"/>
    <rect x="346" y="84" width="131" height="92" rx="9" fill="url(#ink)"/><rect x="354" y="92" width="115" height="76" rx="4" fill="#e8e5ee"/><rect x="363" y="103" width="33" height="53" rx="4" fill="#c6d8c9"/><path d="M408 112h45m-45 13h35m-35 13h40" stroke="#b4a5c9" stroke-width="5" stroke-linecap="round"/><path d="M411 176v14m-27 0h54" stroke="#71637e" stroke-width="6" stroke-linecap="round"/>
    <rect x="253" y="185" width="71" height="7" rx="3" fill="#a6a1af"/><path d="M262 188h48" stroke="#e6e3eb" stroke-width="2"/><path d="M211 82h134" stroke="#89a58e" stroke-width="2" stroke-dasharray="5 6"/>
    </g>${check(326,82,13)}${check(128,196,13)}${check(326,301,13)}
    <path d="M518 188v-45" stroke="#8fa48b" stroke-width="3"/>${leaf(518,157)}<path d="M498 172h38l-6 21h-26Z" fill="#d0bca5"/>
  `),
  "eyes": frame(`
    <defs><clipPath id="window-view"><rect x="369" y="48" width="154" height="231" rx="69"/></clipPath></defs>
    <g filter="url(#shadow)"><rect x="360" y="39" width="172" height="249" rx="76" fill="#a9c7b5"/><rect x="369" y="48" width="154" height="231" rx="69" fill="#e2eee5"/><g clip-path="url(#window-view)"><circle cx="409" cy="102" r="22" fill="#f4dda1"/><path d="m369 226 57-71 97 76v49H369Z" fill="#9aba9f"/><path d="m369 253 102-73 52 52v47H369Z" fill="#779c85"/></g><path d="M446 46v234m-76-113h151" stroke="#fffdf8" stroke-width="7"/>
    <path d="M71 161q119-143 248 0-122 140-248 0Z" fill="#e1d5ef" stroke="#9179aa" stroke-width="4"/><circle cx="199" cy="161" r="48" fill="url(#lavender)"/><circle cx="199" cy="161" r="26" fill="#615075"/><circle cx="214" cy="146" r="10" fill="#faf8fc"/><path d="M98 154q101-104 193 0" stroke="#a995bb" stroke-width="3"/>
    <rect x="124" y="251" width="151" height="52" rx="18" fill="#fcfaf6" stroke="#d8cfe0" stroke-width="2"/><circle cx="155" cy="277" r="15" stroke="#8d77a6" stroke-width="3"/><path d="M155 266v11l7 4" stroke="#8d77a6" stroke-width="3" stroke-linecap="round"/><path d="M185 274h65m-65 9h40" stroke="#a7bda8" stroke-width="5" stroke-linecap="round"/>
    </g><path d="m307 116 12-5m-8 33h17m-22 31 12 6" stroke="#b7a580" stroke-width="3" stroke-linecap="round"/>
  `),
  "display": frame(`
    <g filter="url(#shadow)"><rect x="68" y="57" width="338" height="236" rx="20" fill="url(#ink)"/><rect x="79" y="68" width="316" height="209" rx="12" fill="#faf8f2"/><path d="M237 68h146q12 0 12 12v185q0 12-12 12H237Z" fill="url(#night)"/>
    <circle cx="155" cy="136" r="27" fill="#ead298"/><g stroke="#d5b270" stroke-width="3" stroke-linecap="round"><path d="M155 94v-9m0 104v-9m-43-44h-9m104 0h-9m-74-29-6-6m65 65 6 6m-65-6-6 6m65-65 6-6"/></g><path d="M325 106a33 33 0 1 0 25 57q-45 5-25-57Z" fill="#ddd0ed"/>
    <path d="M113 211h84m-84 17h66" stroke="#cabbd7" stroke-width="6" stroke-linecap="round"/><path d="M272 211h84m-84 17h66" stroke="#8d83a8" stroke-width="6" stroke-linecap="round"/><path d="M53 291h371l-19 16H75Z" fill="#aaa0b6"/><path d="M212 291h53l-5 6h-42Z" fill="#ddd6e3"/>
    <rect x="424" y="113" width="115" height="172" rx="18" fill="#fbfaf6" stroke="#cfc5dc" stroke-width="2"/><circle cx="481" cy="144" r="16" fill="#e8deef"/><path d="M481 134v20m-10-10h20" stroke="#8d77a6" stroke-width="3"/><path d="M444 186h73m-73 31h73m-73 31h73" stroke="#ded7e6" stroke-width="5" stroke-linecap="round"/><circle cx="465" cy="186" r="7" fill="#8ca58e"/><circle cx="493" cy="217" r="7" fill="#9c85b3"/><circle cx="473" cy="248" r="7" fill="#c7ac88"/></g>
  `),
  "stretch": frame(`
    <ellipse cx="144" cy="306" rx="57" ry="10" fill="#83748e" opacity=".08"/><ellipse cx="300" cy="306" rx="57" ry="10" fill="#83748e" opacity=".08"/><ellipse cx="460" cy="306" rx="57" ry="10" fill="#83748e" opacity=".08"/>
    <g stroke-linecap="round" stroke-linejoin="round">
    <path d="m127 197-12 95m39-95 17 95" stroke="#68758a" stroke-width="18"/><path d="m284 197-15 95m47-95 15 95" stroke="#68758a" stroke-width="18"/><path d="m445 197-24 91m53-91 22 78" stroke="#68758a" stroke-width="18"/>
    <path d="M119 119q25-14 49 0l-4 88h-40Z" fill="url(#sage)"/><path d="M275 119q25-14 49 0l-4 88h-40Z" fill="url(#lavender)"/><path d="M435 119q25-14 49 0l-4 88h-40Z" fill="#d5b399"/>
    <path d="m120 129-25-38 5-34m68 72 25-38-5-34" stroke="#caa58c" stroke-width="13"/><path d="m277 131-43 10m88-10 43 10" stroke="#ad826b" stroke-width="13"/><path d="m437 131-28 37m72-37 25-23" stroke="#d8b99c" stroke-width="13"/>
    <path d="M144 105v18m156-18v18m160-18v18" stroke="#bb9780" stroke-width="11"/><circle cx="144" cy="86" r="24" fill="#caa58c"/><circle cx="300" cy="86" r="24" fill="#ad826b"/><circle cx="460" cy="86" r="24" fill="#d8b99c"/>
    <path d="M121 81q1-27 26-21 22 2 21 24-10-16-22-13-14 7-25 10" fill="#66535a"/><path d="M277 77q12-24 33-13 16 4 13 19-22-13-46-6" fill="#4c414e"/><path d="M437 79q9-26 29-17 17 0 18 24-18-14-47-7" fill="#78615a"/>
    <path d="M140 90h0m11 0h0m145 0h0m11 0h0m145 0h0m11 0h0" stroke="#544650" stroke-width="3"/><path d="m136 103 7 3 7-3m143 0 7 3 7-3m153 0 7 3 7-3" stroke="#8c665c" stroke-width="2"/>
    <path d="M107 300h22M162 300h22M257 300h24M319 300h24M411 297h24M483 285h25" stroke="#514a5f" stroke-width="9"/>
    <path d="M87 47q-16 17-7 37m126-37q16 17 7 37m27 28-10 4 10 6m127-10 10 4-10 6m133-27q16 6 14 23" stroke="#a795b3" stroke-width="2"/>
    </g>
  `),
  "password": frame(`
    <g filter="url(#shadow)"><rect x="93" y="81" width="290" height="215" rx="20" fill="#fcfaf6" stroke="#cfc9db" stroke-width="2"/><rect x="108" y="96" width="260" height="32" rx="9" fill="#e7e1ef"/>${dots(124,112)}<circle cx="166" cy="181" r="25" fill="#d5e2d6"/><circle cx="166" cy="174" r="8" fill="#88a28d"/><path d="M152 192q14-17 28 0" stroke="#88a28d" stroke-width="5" stroke-linecap="round"/>
    <rect x="210" y="159" width="140" height="37" rx="10" fill="#eee8f3"/><g fill="#8e7aa7"><circle cx="228" cy="178" r="4"/><circle cx="244" cy="178" r="4"/><circle cx="260" cy="178" r="4"/><circle cx="276" cy="178" r="4"/><circle cx="292" cy="178" r="4"/></g><rect x="123" y="227" width="112" height="30" rx="15" fill="url(#sage)"/>
    <path d="m420 47 103 37v72q0 71-103 118-103-47-103-118V84Z" fill="#d2e0de" stroke="#7c9a94" stroke-width="3"/><path d="m420 62 86 32v62q0 57-86 100-86-43-86-100V94Z" fill="#e8f0ea"/>
    <rect x="379" y="132" width="82" height="70" rx="16" fill="url(#ink)"/><path d="M395 132v-24a25 25 0 0 1 50 0v24" stroke="#6c5d80" stroke-width="9"/><circle cx="420" cy="159" r="8" fill="#e8dfef"/><path d="M420 166v15" stroke="#e8dfef" stroke-width="5" stroke-linecap="round"/>
    <circle cx="101" cy="274" r="26" fill="#efddb6" stroke="#b69b72" stroke-width="3"/><circle cx="101" cy="274" r="11" stroke="#b69b72" stroke-width="3"/><path d="M124 274h76m-13 0v12m-17-12v12" stroke="#b69b72" stroke-width="8" stroke-linecap="round"/></g>${check(494,252,23)}
  `),
  "phishing": frame(`
    <g filter="url(#shadow)"><rect x="79" y="55" width="410" height="242" rx="22" fill="#fcfaf6" stroke="#ccc5d8" stroke-width="2"/><path d="M79 98h410" stroke="#e0d9e7" stroke-width="2"/>${dots(100,77)}<rect x="153" y="69" width="213" height="15" rx="7" fill="#ece7f0"/>
    <circle cx="127" cy="143" r="19" fill="#d4e1d7"/><path d="M165 133h113m-113 17h80" stroke="#aaa0b8" stroke-width="6" stroke-linecap="round"/><path d="M112 195h212m-212 17h167m-167 17h182" stroke="#d7cede" stroke-width="6" stroke-linecap="round"/><rect x="107" y="249" width="189" height="27" rx="8" fill="#ece3f3"/><path d="M121 260h140" stroke="#8b6ba6" stroke-width="4" stroke-linecap="round"/><path d="M120 267h142" stroke="#b5a1c7" stroke-width="2"/>
    <path d="m395 239 91-3q12 0 12 12v61h-118v-58q0-12 15-12Z" fill="#d5e2de" stroke="#93aca4" stroke-width="2"/><path d="m383 241 56 43 57-47" stroke="#93aca4" stroke-width="3"/>
    <circle cx="405" cy="151" r="58" fill="#faf8f4" fill-opacity=".96" stroke="#9280a8" stroke-width="10"/><circle cx="405" cy="151" r="44" stroke="#e4dce9" stroke-width="2"/><path d="m447 193 54 55" stroke="url(#ink)" stroke-width="17" stroke-linecap="round"/><path d="M405 121v35" stroke="#b47b72" stroke-width="7" stroke-linecap="round"/><circle cx="405" cy="174" r="4" fill="#b47b72"/></g>
  `),
  "pomodoro": frame(`
    <g filter="url(#shadow)"><rect x="89" y="98" width="101" height="171" rx="15" fill="#fcfaf6" stroke="#d4c8dc" stroke-width="2"/><path d="M108 125h62m-62 16h43m-43 72h62m-62 16h43" stroke="#cec2d9" stroke-width="5" stroke-linecap="round"/>${check(138,175,18)}
    <path d="M266 34h51m-25 0v16" stroke="#aa937b" stroke-width="9" stroke-linecap="round"/><circle cx="293" cy="164" r="112" fill="#dcc6ac"/><circle cx="293" cy="164" r="99" fill="#fcf8ef"/><circle cx="293" cy="164" r="86" stroke="#e9e0d3" stroke-width="9"/><path d="M293 78a86 86 0 1 1-84 105" stroke="#9a84b3" stroke-width="9" stroke-linecap="round"/><path d="M293 100v63l33 21" stroke="#675875" stroke-width="6" stroke-linecap="round"/><circle cx="293" cy="164" r="7" fill="#675875"/>
    <rect x="422" y="123" width="106" height="144" rx="19" fill="#e0eadd" stroke="#b7cbb4" stroke-width="2"/>${leaf(477,186)}
    <rect x="126" y="297" width="76" height="14" rx="7" fill="#9d87b6"/><rect x="217" y="297" width="76" height="14" rx="7" fill="#b3a0c8"/><rect x="308" y="297" width="76" height="14" rx="7" fill="#cbbddb"/><rect x="399" y="297" width="76" height="14" rx="7" fill="#dfd6e7"/><circle cx="209" cy="304" r="3" fill="#89a58e"/><circle cx="300" cy="304" r="3" fill="#89a58e"/><circle cx="391" cy="304" r="3" fill="#89a58e"/></g>
  `),
  "blockers": frame(`
    <rect x="37" y="89" width="92" height="49" rx="14" fill="#e8e1ec" opacity=".75"/><path d="M52 109h59m-59 11h36" stroke="#c2b6cb" stroke-width="4" stroke-linecap="round"/><rect x="477" y="96" width="80" height="68" rx="16" fill="#e6ddd5" opacity=".7"/><circle cx="516" cy="129" r="15" stroke="#c7b4a5" stroke-width="3"/>
    <g filter="url(#shadow)"><rect x="110" y="52" width="382" height="242" rx="22" fill="#fcfaf6" stroke="#bbb0cd" stroke-width="2"/><path d="M110 91h382" stroke="#d9cede" stroke-width="2"/>${dots(131,72)}<rect x="208" y="65" width="182" height="15" rx="7" fill="#ede7f1"/>
    <rect x="127" y="109" width="84" height="166" rx="11" fill="#dce7dc"/><path d="M145 134h48m-48 23h37m-37 23h43m-43 61h41" stroke="#98b29d" stroke-width="5" stroke-linecap="round"/>
    <rect x="230" y="110" width="241" height="165" rx="13" fill="#f2eee6"/><path d="M256 135h132m-132 16h171m-171 16h150" stroke="#b8abc7" stroke-width="5" stroke-linecap="round"/><path d="M275 229v-37q33-10 63 0 30-10 62 0v37q-31-11-62 0-32-11-63 0Z" fill="#d9d0e4" stroke="#9d88b2" stroke-width="2"/><path d="M338 194v34" stroke="#9d88b2" stroke-width="2"/>
    <path d="m466 228 42 16v26q0 33-42 53-42-20-42-53v-26Z" fill="url(#sage)" stroke="#6d9277" stroke-width="2"/><path d="m450 272 12 12 22-26" stroke="#fafbf4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>
  `),
  "notifications": frame(`
    <g filter="url(#shadow)"><rect x="223" y="35" width="155" height="284" rx="30" fill="url(#ink)"/><rect x="232" y="45" width="137" height="264" rx="23" fill="#f8f4f9"/><rect x="272" y="50" width="56" height="8" rx="4" fill="#9a89ab"/><circle cx="300" cy="150" r="43" fill="#e5dcef"/><path d="M277 161h46l-7-12v-18a16 16 0 0 0-32 0v18Zm18 8h10" stroke="#967fae" stroke-width="4" stroke-linejoin="round"/><path d="m277 125 45 46" stroke="#967fae" stroke-width="4" stroke-linecap="round"/>
    <path d="M256 218h88m-88 15h62" stroke="#d1c3df" stroke-width="5" stroke-linecap="round"/><rect x="271" y="258" width="59" height="29" rx="15" fill="url(#sage)"/><circle cx="315" cy="272" r="10" fill="#f9faf5"/>
    <rect x="67" y="101" width="184" height="68" rx="18" fill="#fcfaf6" stroke="#d3c7dd" stroke-width="2"/><circle cx="94" cy="134" r="13" fill="#d6e3d4"/><path d="M120 125h108m-108 17h77" stroke="#b8a7c9" stroke-width="5" stroke-linecap="round"/>
    <rect x="352" y="177" width="183" height="66" rx="18" fill="#fcfaf6" stroke="#d3c7dd" stroke-width="2"/><circle cx="381" cy="210" r="13" fill="#e6d5c0"/><path d="M407 201h107m-107 17h77" stroke="#b8a7c9" stroke-width="5" stroke-linecap="round"/></g><path d="M171 70q19-13 38-9m185 69q29 0 37 19" stroke="#bcb0c6" stroke-width="2" stroke-dasharray="4 6"/>
  `),
  "sleep": frame(`
    <path d="M351 64a57 57 0 1 0 58 75q-70 9-58-75Z" fill="url(#lavender)"/><path d="m451 68 3 8 8 3-8 3-3 8-3-8-8-3 8-3m-46-45 2 6 6 2-6 2-2 6-2-6-6-2 6-2m98 84 2 6 6 2-6 2-2 6-2-6-6-2 6-2" fill="#d4b77b"/>
    <g filter="url(#shadow)"><path d="M80 213q0-25 25-25h219q26 0 26 26v81H80Z" fill="#a7bea8"/><path d="M88 229h254v53H88Z" fill="url(#sage)"/><rect x="76" y="180" width="16" height="126" rx="8" fill="#7f9a84"/><path d="M103 166h74q12 0 12 12v35h-93v-35q0-12 7-12Z" fill="#f8f3e7"/><path d="M203 193q67-13 130 10v78H203Z" fill="#e1d6ec"/><path d="M229 218q42-9 82 6m-82 19q40-9 82 6" stroke="#c3b2d5" stroke-width="3" stroke-linecap="round"/>
    <rect x="400" y="248" width="135" height="12" rx="5" fill="#b59f89"/><path d="M416 260v49m102-49v49" stroke="#aa927e" stroke-width="7" stroke-linecap="round"/><path d="M463 244v-49" stroke="#bca482" stroke-width="5"/><path d="m437 157-14 37h78l-14-37Z" fill="#eadcb6" stroke="#cbb990" stroke-width="2"/><ellipse cx="463" cy="243" rx="20" ry="4" fill="#c7b193"/>
    <rect x="427" y="225" width="61" height="8" rx="3" fill="#8faaa0"/><rect x="432" y="233" width="54" height="7" rx="2" fill="#d7e2d4"/><rect x="495" y="238" width="30" height="7" rx="3" fill="#71677d"/></g>
    <path d="M58 99q30-14 51-3m-35 10q21-9 38-3" stroke="#d6d9cb" stroke-width="2"/>
  `),
};
for (const [name, svg] of Object.entries(arts)) {
  fs.writeFileSync(path.join(target, `${name}-v2.svg`), svg);
  console.log(`${name}-v2.svg: ${Buffer.byteLength(svg)} bytes`);
}
