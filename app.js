
const $=id=>document.getElementById(id); const LS_KEY='offbook.v53'; const LEGACY_KEYS=['offbook.v51','offbook.v50','offbook.v49','offbook.v47','offbook.v46','offbook.v45.multi','screenplayTrainer.v44.multi','screenplayTrainer.v43','screenplayTrainer.v42'];
const state={raw:'',title:'Untitled Script',author:'',lines:[],characters:[],selectedRoles:new Set(),statuses:{},trouble:{},bookmarks:{},misses:[],currentList:[],pos:0,revealed:false,listening:false,recognition:null,selectedFile:null,finalTimer:null,session:{practiced:0,passedFirst:0,retries:0,failed:0},randomQueue:[],blockingRevealed:false};
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function stripParen(s){return String(s||'').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim()}
function stripPause(s){return String(s||'').replace(/\[pause:\s*\d+(?:\.\d+)?\s*\]/gi,' ').replace(/\s+/g,' ').trim()}
function extractTags(raw){let out={text:String(raw||''),block:[],note:[],prop:[]}; out.text=out.text.replace(/[\[{](block|blocking|note|prop):\s*([^\]}}]+)[\]}]/gi,(m,k,v)=>{k=k.toLowerCase(); if(k==='blocking')k='block'; out[k].push(v.trim()); return ' ';}); return out}
function stripMetaTags(s){return extractTags(s).text.replace(/\s+/g,' ').trim()}
function pauseTotal(s){let total=0; String(s||'').replace(/\[pause:\s*(\d+(?:\.\d+)?)\s*\]/gi,(_,n)=>{total+=Number(n)*1000; return ''}); return total}
function statusBadge(line){let s=state.statuses[line.id]||'unmarked'; if(s==='passed')return '<span class="badge good">Passed</span>'; if(s==='failed')return '<span class="badge bad">Failed</span>'; if(s==='needs')return '<span class="badge warn">Needs</span>'; return '<span class="badge">Unmarked</span>'}
function cleanSpeakerName(s){
  s=(s||'').replace(/[\u000c\ufffe]/g,' ').trim();
  s=s.replace(/\((?:cont|continued)\.?\)/ig,' ');
  s=s.replace(/\b(?:cont|continued)\.?$/ig,' ');
  s=s.replace(/[^A-Za-z0-9 '&-]+/g,' ');
  s=s.replace(/\s+/g,' ').trim().toUpperCase();
  s=s.replace(/^THE\s+/,'');
  return s;
}
function isSetupHeading(t){
  t=(t||'').trim();
  return /^(CAST(?:\s+OF\s+CHARACTERS)?|CHARACTERS|CAST|THE\s+TIME|TIME:?|THE\s+PLACE|PLACE:?|SETTING:?|AT\s+RISE:?|END\.?|END\s+OF\s+SCENE|[-—]*END[-—]*|ACT\b|SCENE\b|INT\.|EXT\.)/i.test(t);
}
function shouldStopCastSection(t){return /^(THE\s+TIME|TIME:?|THE\s+PLACE|PLACE:?|SETTING:?|AT\s+RISE:?)/i.test((t||'').trim());}
function addNameAlias(raw,aliasMap,detected){
  raw=(raw||'').trim().replace(/[.:\-\s]+$/,'');
  if(!raw||raw.length>80)return;
  if(!/^[A-Z]/.test(raw))return;
  if(/^(TITLE|AUTHOR|BY|TIME|PLACE|SETTING|AT RISE|CAST|CHARACTERS|HAS|WAS|WEARS|WANTS|PLAYED|PRESENTS|CARRIES|WELL|ETHNICITY|SHE|HE|THEY|THIS|AN?|ANY|IF|WHEN|WHERE|WHY|HOW|WHAT)\b/i.test(raw))return;
  const names=[];
  const parens=[...raw.matchAll(/\(([A-Za-z][A-Za-z0-9 '&-]{0,28})\)/g)].map(m=>cleanSpeakerName(m[1])).filter(Boolean);
  parens.forEach(x=>names.push(x));
  const base=cleanSpeakerName(raw);
  if(base)names.push(base);
  if(/^THE\s+/i.test(raw)){let noThe=cleanSpeakerName(raw.replace(/^THE\s+/i,'')); if(noThe)names.push(noThe);}
  // Some older scripts list full descriptive names but use a shorter name in dialogue, e.g. "Round Heels Nell Wilding" -> NELL.
  // Only add individual tokens for mixed-case full names, not all-caps names like DORA THE DISH.
  const noParen=raw.replace(/\([^)]*\)/g,' ');
  const words=noParen.split(/\s+/).map(w=>w.replace(/[^A-Za-z'&-]/g,'')).filter(Boolean);
  const hasLower=/[a-z]/.test(noParen), hasMany=words.length>=3;
  if(hasLower&&hasMany){
    words.forEach(w=>{let n=cleanSpeakerName(w); if(n&&n.length>1&&!/^(THE|AND|OR|OF|A|AN|F|M)$/.test(n))names.push(n);});
  }
  names.forEach(n=>{if(n&&!aliasMap[n]){aliasMap[n]=n; detected.add(n);}});
}
function collectCastAliases(rawLines,warnings){
  const aliasMap={}, detected=new Set(); let inCast=false, beforeSetup=true, foundCast=false;
  rawLines.slice(0,180).forEach((line)=>{
    let t=(line||'').trim().replace(/^\d+$/,''); if(!t)return;
    if(/^(CAST\s+OF\s+CHARACTERS|CHARACTERS|CAST)$/i.test(t)){inCast=true; foundCast=true; return;}
    if(inCast&&shouldStopCastSection(t)){inCast=false; beforeSetup=false; return;}
    if(/^(THE\s+TIME|TIME:?|THE\s+PLACE|PLACE:?|SETTING:?|AT\s+RISE:?)/i.test(t)){beforeSetup=false;}
    if(inCast||beforeSetup){
      // Cast entries seen in this test set: NAME: desc, NAME. desc, NAME - desc, NAME- desc.
      let m=t.match(/^([A-Za-z][A-Za-z0-9 '&().-]{1,70}?)(?:\s*[:.-]\s+|\s+-\s+|-)\s*(.+)$/);
      if(m)addNameAlias(m[1],aliasMap,detected);
    }
  });
  if(Object.keys(aliasMap).length)warnings.push('Detected cast aliases: '+Object.keys(aliasMap).sort().join(', '));
  else warnings.push('No cast list detected; parser will fall back to uppercase character headings.');
  return aliasMap;
}
function validSpeakerLine(t,aliasMap){
  t=(t||'').trim(); if(!t||t.length>48)return null; if(isSetupHeading(t))return null;
  let n=cleanSpeakerName(t); if(!n)return null;
  if(aliasMap[n])return aliasMap[n];
  const aliases=Object.keys(aliasMap);
  // Avoid treating simultaneous cue labels like "FROG PRINCESS" as one character.
  const words=n.split(/\s+/); if(words.length>1&&words.every(w=>aliasMap[w]))return null;
  if(!aliases.length&&/^[A-Z][A-Z0-9 '&-]{1,40}$/.test(t)&&!/[.:]/.test(t))return n;
  return null;
}
function splitInlineSpeaker(t,aliasMap,seenDialogue){
  if(!seenDialogue)return null;
  let m=(t||'').trim().match(/^([A-Za-z][A-Za-z0-9 '&-]{1,32})\s+(.{1,220})$/);
  if(!m)return null;
  let n=cleanSpeakerName(m[1]), rest=m[2].trim();
  if(!aliasMap[n])return null;
  // Do not turn action lines like "MORGAN has just picked..." into dialogue.
  if(/^(is|are|has|have|had|enters|exits|runs|walks|looks|sits|stands|moves|crosses|returns|approaches|continues)\b/i.test(rest))return null;
  return {speaker:aliasMap[n], text:rest};
}
function isLikelyStageOnly(t){
  t=(t||'').trim(); if(!t)return true;
  if(/^\(.+\)$/.test(t))return true;
  if(/^(beat|pause|long pause)$/i.test(t))return true;
  if(/^(The conversation|At some point|Maybe |Have fun|Director note|The audience|Once |All exit|They get up|She skips|He repeats)/i.test(t))return true;
  return false;
}
function isCharacterLine(s){return !!validSpeakerLine(s,{});}
function parseScript(raw){
  let warnings=[], title='Untitled Script', author='', lines=[], current=null, buf=[];
  raw=(raw||'').replace(/\r/g,'').replace(/\u000c/g,'\n').replace(/\ufffe/g,'\n');
  const rawLines=raw.split('\n');
  const nonEmpty=rawLines.map(x=>x.trim()).filter(Boolean);
  if(nonEmpty.length){title=nonEmpty[0].replace(/^TITLE:\s*/i,'').trim();}
  nonEmpty.slice(0,8).forEach(t=>{let m=t.match(/^(?:by|author:?|By:)\s*(.+)$/i); if(m)author=m[1].trim();});
  const aliasMap=collectCastAliases(rawLines,warnings);
  const flush=()=>{
    if(current&&buf.length){
      let rawText=buf.join('\n').trim();
      let tags=extractTags(rawText); let cleanRaw=tags.text.trim();
      let speakText=stripPause(stripParen(cleanRaw));
      speakText=speakText.split('\n').filter(x=>!isLikelyStageOnly(x)).join(' ').replace(/\s+/g,' ').trim();
      if(speakText){let id='L'+String(lines.length+1).padStart(4,'0'); lines.push({id,globalN:lines.length+1,speaker:current,rawText,cleanRaw,speakText,pause:pauseTotal(rawText),block:tags.block,note:tags.note,prop:tags.prop,roleN:0});}
    }
    buf=[];
  };
  let seenDialogue=false, skipped=0;
  rawLines.forEach((line,idx)=>{
    let t=line.trim(); if(!t)return; if(/^\d+$/.test(t))return;
    if(/^TITLE:\s*/i.test(t)){title=t.replace(/^TITLE:\s*/i,'').trim(); return;}
    let am=t.match(/^AUTHOR:\s*(.+)$/i); if(am){author=am[1].trim(); return;}
    if(isSetupHeading(t))return;
    let speaker=validSpeakerLine(t,aliasMap);
    if(speaker){flush(); current=speaker; seenDialogue=true; return;}
    let inline=splitInlineSpeaker(t,aliasMap,seenDialogue);
    if(inline){flush(); current=inline.speaker; buf=[inline.text]; seenDialogue=true; return;}
    if(!current){skipped++; return;}
    buf.push(line);
  });
  flush();
  let counts={}; lines.forEach(l=>{counts[l.speaker]=(counts[l.speaker]||0)+1; l.roleN=counts[l.speaker]});
  let characters=Object.keys(counts).sort();
  if(skipped)warnings.push('Ignored '+skipped+' setup/stage lines before first detected dialogue.');
  if(!lines.length)warnings.push('No dialogue lines found. Check that character names are on their own line or listed in the cast section.');
  return {title,author,lines,characters,warnings,counts};
}
function importRaw(raw,source){let p=parseScript(raw); state.raw=raw; state.title=p.title; state.author=p.author; state.lines=p.lines; state.characters=p.characters; state.selectedRoles=new Set(state.characters.length?[state.characters[0]]:[]); state.currentList=[]; state.pos=0; state.revealed=false; saveAll(); renderImport(p.warnings,source); buildPracticeList(); setTab('library');}
function saveAll(){localStorage.setItem(LS_KEY,JSON.stringify({raw:state.raw,title:state.title,author:state.author,lines:state.lines,characters:state.characters,selectedRoles:[...state.selectedRoles],statuses:state.statuses,trouble:state.trouble,bookmarks:state.bookmarks,misses:state.misses}))}
function continueSaved(){let s=localStorage.getItem(LS_KEY); if(!s){for(const k of LEGACY_KEYS){s=localStorage.getItem(k); if(s){try{localStorage.setItem(LS_KEY,s); $('saveStatus').textContent='Migrated saved script to OffBook.'}catch(e){} break;}}} if(!s)return; try{let d=JSON.parse(s); Object.assign(state,d); state.selectedRoles=new Set(d.selectedRoles||[]); state.session={practiced:0,passedFirst:0,retries:0,failed:0}; renderImport([], 'Saved script'); buildPracticeList();}catch(e){console.log(e)}}
function renderImport(warnings=[],source=''){let counts={}; state.lines.forEach(l=>counts[l.speaker]=(counts[l.speaker]||0)+1); $('saveStatus').textContent=state.lines.length?state.title:'No script loaded'; $('importSummary').innerHTML=state.lines.length?`<b>${escapeHtml(state.title)}</b>${state.author?' by '+escapeHtml(state.author):''}<br><span class="subtle">Loaded from ${escapeHtml(source)}. Select one or more roles below.</span>`:'Import a script to see roles and line counts.'; $('importStats').innerHTML=stat('Characters',state.characters.length)+stat('Dialogue',state.lines.length)+stat('Practice roles',state.selectedRoles.size)+stat('Warnings',warnings.length); $('warnings').textContent=warnings.length?warnings.join('\n'):'No parser warnings.'; renderRoleCards(); renderCharacterStats(); renderReview();}
function renderRoleCards(){let counts={}; state.lines.forEach(l=>counts[l.speaker]=(counts[l.speaker]||0)+1); $('roleCards').innerHTML=state.characters.map(c=>`<button type="button" class="roleCard ${state.selectedRoles.has(c)?'active':''}" data-role="${escapeHtml(c)}"><span class="roleCheck">${state.selectedRoles.has(c)?'✓':'□'}</span><span><b>${escapeHtml(c)}</b><br><small class="subtle">${counts[c]||0} lines ${state.selectedRoles.has(c)?'• practicing':'• cue role'}</small></span></button>`).join('')||'<p class="subtle">No characters found.</p>'; document.querySelectorAll('.roleCard').forEach(card=>card.onclick=()=>{let r=card.dataset.role; state.selectedRoles.has(r)?state.selectedRoles.delete(r):state.selectedRoles.add(r); saveAll(); renderRoleCards(); buildPracticeList(); renderImport([], 'Current script');});}
function renderCharacterStats(){let rows=state.characters.map(c=>{let arr=state.lines.filter(l=>l.speaker===c); let passed=arr.filter(l=>state.statuses[l.id]==='passed').length; let needs=arr.filter(l=>state.statuses[l.id]==='needs').length; let failed=arr.filter(l=>state.statuses[l.id]==='failed').length; let selected=state.selectedRoles.has(c); return `<div class="stat" style="text-align:left"><b>${escapeHtml(c)}</b><span class="subtle">${arr.length} lines ${selected?'• practice':'• cue'}</span><br><span class="badge good">${passed} passed</span><span class="badge warn">${needs} needs</span><span class="badge bad">${failed} failed</span></div>`}).join(''); $('characterStats').innerHTML=rows||'<p class="subtle">No character stats yet.</p>'; $('reviewCharacterStats').innerHTML=rows||'<p class="subtle">No character stats yet.</p>';}
function stat(label,value){return `<div class="stat"><b>${escapeHtml(value)}</b><span class="subtle">${escapeHtml(label)}</span></div>`}
function setTab(id){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id)); document.querySelectorAll('.tabPane').forEach(p=>p.classList.toggle('hide',p.id!==id)); if(id==='review')renderReview()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
function practiceCandidates(){let arr=state.lines.filter(l=>state.selectedRoles.has(l.speaker)); let pool=$('practicePool')?.value||'all'; if(pool==='range'){let a=Number($('rangeStart').value)||1,b=Number($('rangeEnd').value)||state.lines.length; arr=arr.filter(l=>l.globalN>=a&&l.globalN<=b)} if(pool==='needs')arr=arr.filter(l=>state.statuses[l.id]==='needs'); if(pool==='failed')arr=arr.filter(l=>state.statuses[l.id]==='failed'); if(pool==='bookmarks')arr=arr.filter(l=>state.bookmarks[l.id]); return arr;}
function buildPracticeList(){let base=practiceCandidates(); let repeatEach=Number($('repeatEach')?.value)||1, repeatSeq=Number($('repeatSequence')?.value)||1; let seq=[]; for(let s=0;s<repeatSeq;s++) base.forEach(l=>{for(let r=0;r<repeatEach;r++)seq.push({...l,rep:r+1,seq:s+1})}); if(($('practiceOrder')?.value||'inorder')==='random'||($('practiceOrder')?.value||'')==='randomNoRepeats') seq=shuffle(seq); state.currentList=seq; state.pos=Math.min(state.pos,Math.max(0,seq.length-1)); $('rangeEnd').value=state.lines.length||1; $('repetitionSummary').textContent=state.lines.length?`${base.length} source lines → ${seq.length} practice cards. Roles: ${[...state.selectedRoles].join(', ')||'none selected'}.`:'No script loaded.'; renderCurrent(); renderReview();}
function shuffle(a){let b=[...a]; for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]} return b}
function cueFor(line){let idx=state.lines.findIndex(l=>l.id===line.id); if(idx<=0)return []; let mode=$('cueMode')?.value||'last1'; let prev=[]; for(let i=idx-1;i>=0;i--){let l=state.lines[i]; if(mode==='full'){ if(state.selectedRoles.has(l.speaker)) break; prev.unshift(l); } else { prev.unshift(l); if(prev.length>=(mode==='last2'?2:1)) break; } } return prev;}
function cueSpeechText(line){return cueFor(line).map(x=>x.speakText).filter(Boolean).join('. ')}

function renderLineExtras(line){if(!line)return ''; let parts=[]; if($('showBlocking')&&$('showBlocking').checked && line.block&&line.block.length){let content=state.blockingRevealed?line.block.map(escapeHtml).join('<br>'):'<span class="hiddenLine">Blocking hidden</span>'; parts.push('<div><b>Blocking</b><br>'+content+'</div>')} if($('showNotes')&&$('showNotes').checked){ if(line.note&&line.note.length)parts.push('<div><b>Notes</b><br>'+line.note.map(escapeHtml).join('<br>')+'</div>'); if(line.prop&&line.prop.length)parts.push('<div><b>Props</b><br>'+line.prop.map(escapeHtml).join('<br>')+'</div>'); } return parts.join('<div class="cueBlock"></div>')}
function renderCue(line){let cues=cueFor(line); if(!cues.length)return '<span class="subtle">No cue before this line.</span>'; return cues.map(c=>`<div class="cueBlock"><b>${escapeHtml(c.speaker)}</b><br>${escapeHtml(c.speakText)}</div>`).join('')}
function renderCurrent(){let c=current(); if(!c){$('currentTitle').textContent=state.title||'No script loaded'; $('currentMeta').textContent='No practice cards. Import a script, select roles, and start.'; return} $('currentTitle').textContent=state.title; $('currentMeta').textContent=`Card ${state.pos+1} of ${state.currentList.length} • ${c.speaker} line ${c.roleN} • overall ${c.globalN}${c.rep?` • repeat ${c.rep}`:''}`; $('currentBadges').innerHTML=statusBadge(c)+(state.bookmarks[c.id]?'<span class="badge mark">★</span>':''); $('cueText').innerHTML=renderCue(c); $('speakerLabel').textContent=`${c.speaker} • Line ${c.roleN}`; $('targetLine').textContent=state.revealed?c.speakText:'Hidden blurred text'; $('targetLine').classList.toggle('hiddenLine',!state.revealed); $('revealBtn').textContent=state.revealed?'Hide line':'Reveal line'; let extras=renderLineExtras(c); $('lineExtras').innerHTML=extras; $('lineExtras').classList.toggle('hide',!extras); $('toggleBlockingBtn').textContent=state.blockingRevealed?'Hide blocking':'Reveal blocking'; $('answerBox').value=''; $('checkResult').textContent=''; renderReview();}
function current(){return state.currentList[state.pos]||null}
function nextLine(){if(!state.currentList.length)return; let order=$('practiceOrder')?.value; if(order==='random'){state.pos=Math.floor(Math.random()*state.currentList.length)}else{state.pos=(state.pos+1)%state.currentList.length} state.revealed=false; state.blockingRevealed=false; renderCurrent()}
function prevLine(){if(!state.currentList.length)return; state.pos=(state.pos-1+state.currentList.length)%state.currentList.length; state.revealed=false; state.blockingRevealed=false; renderCurrent()}
function startRehearsal(){if(!state.selectedRoles.size){alert('Pick at least one practice role first.');return} buildPracticeList(); if(!state.currentList.length){alert('No lines in this pool.');return} state.pos=0; state.revealed=false; state.blockingRevealed=false; setTab('rehearse'); renderCurrent()}
function mark(id,val){if(!id)return; state.statuses[id]=val; if(val==='failed'||val==='needs') state.trouble[id]=true; saveAll(); renderCurrent(); renderReview()}
function normalize(s){s=(s||'').toLowerCase(); s=stripMetaTags(s); s=s.replace(/\[pause:\s*\d+(?:\.\d+)?\s*\]/g,' '); s=s.replace(/\([^)]*\)/g,' '); s=s.replace(/[“”]/g,'"').replace(/[‘’]/g,"'"); s=s.replace(/[^a-z0-9' ]+/g,' '); s=s.replace(/\bokay\b/g,'ok').replace(/\b(yeah|yep|yup)\b/g,'yes'); const hom={tee:'t',tea:'t',bee:'b',be:'b',sea:'c',see:'c',cue:'q',queue:'q',fore:'four'}; s=s.split(/\s+/).map(w=>hom[w]||w).join(' '); return numberWords(s).replace(/\s+/g,' ').trim()}
function numberWords(s){const map={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90}; let words=s.split(' '), out=[]; for(let i=0;i<words.length;i++){let w=words[i]; if(map[w]!=null){let n=map[w]; if(i+1<words.length&&map[words[i+1]]!=null&&map[words[i+1]]<10&&n>=20)n+=map[words[++i]]; out.push(String(n));} else out.push(w)} return out.join(' ')}

let offbookAudioCtx=null;
function getVolume(){const el=$('soundVolume'); return Math.max(0,Math.min(1,parseFloat(el?el.value:0.75)||0.75));}
async function enableSound(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){ if($('soundStatus')) $('soundStatus').textContent='Audio status: not supported in this browser.'; return false; }
    offbookAudioCtx=offbookAudioCtx||new AC();
    if(offbookAudioCtx.state==='suspended') await offbookAudioCtx.resume();
    const ok=offbookAudioCtx.state==='running';
    if($('soundStatus')) $('soundStatus').innerHTML=ok?'Audio Ready ✅':'Audio status: tap Enable sound cues again.';
    return ok;
  }catch(e){
    console.log('audio enable error', e);
    if($('soundStatus')) $('soundStatus').textContent='Audio status: blocked. Try Safari volume/ringer, then tap Enable again.';
    return false;
  }
}
function rawTone(freq,dur,delay=0,type='sine',gain=0.28){
  const ctx=offbookAudioCtx; if(!ctx || ctx.state!=='running') return false;
  const osc=ctx.createOscillator(); const g=ctx.createGain(); osc.type=type; osc.frequency.value=freq;
  const t=ctx.currentTime+delay; const vol=Math.max(0.0001,getVolume()*gain);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t+dur+0.05); return true;
}
async function tone(freq,dur,delay=0,type='sine',gain=0.28){ if(await enableSound()) rawTone(freq,dur,delay,type,gain); }
async function playPassSound(force=false){if(!force && (!$('soundFeedback') || !$('soundFeedback').checked))return; if(await enableSound()){rawTone(740,0.14,0,'sine',0.30); rawTone(980,0.18,0.11,'sine',0.26); if($('soundStatus')) $('soundStatus').innerHTML='Audio Ready ✅ Ding played.';}}
async function playFailSound(force=false){if(!force && (!$('soundFeedback') || !$('soundFeedback').checked))return; if(await enableSound()){rawTone(180,0.22,0,'sawtooth',0.22); rawTone(120,0.28,0.18,'sawtooth',0.18); if($('soundStatus')) $('soundStatus').innerHTML='Audio Ready ✅ Err played.';}}

function checkAnswer(auto=false){let c=current(); if(!c)return false; let said=$('answerBox').value.trim(); let ok=normalize(said)===normalize(c.speakText); state.session.practiced++; if(ok){ if(state.trouble[c.id]){mark(c.id,'needs'); state.session.retries++; $('checkResult').innerHTML='<span class="warnText">Correct now. Marked needs work because it missed earlier.</span>';} else {mark(c.id,'passed'); state.session.passedFirst++; $('checkResult').innerHTML='<span class="okText">Correct.</span>';} playPassSound(); if($('autoAdvanceCorrect').checked) setTimeout(nextLine,450); } else {playFailSound(); state.trouble[c.id]=true; mark(c.id,'failed'); state.session.failed++; state.misses.push({time:new Date().toLocaleString(),id:c.id,globalN:c.globalN,roleN:c.roleN,speaker:c.speaker,expected:c.speakText,said}); $('checkResult').innerHTML='<span class="badText">Not yet. Try again.</span>'; if(auto&&$('clearWrong').checked)$('answerBox').value=''; saveAll(); renderReview(); } return ok}
function renderReview(){renderCharacterStats(); $('sessionStats').innerHTML=stat('Practiced',state.session.practiced)+stat('First try',state.session.passedFirst)+stat('Retries',state.session.retries)+stat('Failed',state.session.failed); let q=($('navSearch').value||'').toLowerCase(), f=$('navFilter').value; let arr=state.lines.filter(x=>state.selectedRoles.has(x.speaker)).filter(x=>{let st=state.statuses[x.id]||'unmarked'; if(f==='passed'&&st!=='passed')return false; if(f==='needs'&&st!=='needs')return false; if(f==='failed'&&st!=='failed')return false; if(f==='bookmarks'&&!state.bookmarks[x.id])return false; if(q&&!(x.speakText.toLowerCase().includes(q)||renderCue(x).toLowerCase().includes(q)||x.speaker.toLowerCase().includes(q)))return false; return true}); $('navigator').innerHTML=arr.map(x=>`<button class="navItem ${current()&&current().id===x.id?'active':''}" data-id="${x.id}"><b>#${x.globalN} ${escapeHtml(x.speaker)} line ${x.roleN}</b> ${statusBadge(x)}${state.bookmarks[x.id]?'<span class="badge mark">★</span>':''}<br><span class="subtle">${escapeHtml(x.speakText.slice(0,150))}</span></button>`).join('')||'<p class="subtle">No matching lines.</p>'; document.querySelectorAll('.navItem').forEach(b=>b.onclick=()=>{let idx=state.currentList.findIndex(x=>x.id===b.dataset.id); if(idx<0){state.currentList=state.lines.filter(l=>state.selectedRoles.has(l.speaker)); idx=state.currentList.findIndex(x=>x.id===b.dataset.id)} if(idx>=0){state.pos=idx; state.revealed=false; state.blockingRevealed=false; setTab('rehearse'); renderCurrent();}}); $('missReport').innerHTML=state.misses.slice().reverse().map(m=>`<div class="reportItem"><b>${escapeHtml(m.speaker)} line ${m.roleN} • overall ${m.globalN} • ${escapeHtml(m.time)}</b><div class="expected">Expected: ${escapeHtml(m.expected)}</div><div class="said">You said: ${escapeHtml(m.said||'(blank)')}</div></div>`).join('')||'<p class="subtle">No missed lines recorded.</p>'}
let voices=[]; function loadVoices(){if(!('speechSynthesis'in window))return; voices=speechSynthesis.getVoices(); $('voiceSelect').innerHTML='<option value="">Default voice</option>'+voices.map((v,i)=>`<option value="${i}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('')}
function speak(text){if(!('speechSynthesis'in window)||!text)return; try{speechSynthesis.cancel(); let u=new SpeechSynthesisUtterance(stripPause(stripParen(stripMetaTags(text)))); let idx=$('voiceSelect').value; if(idx!==''&&voices[idx])u.voice=voices[idx]; u.rate=parseFloat($('voiceRate').value)||1; window.readerSpeaking=true; u.onend=()=>{window.readerSpeaking=false}; u.onerror=()=>{window.readerSpeaking=false}; speechSynthesis.speak(u)}catch(e){console.log(e)}}
function setupRecognition(){const R=window.SpeechRecognition||window.webkitSpeechRecognition; if(!R){$('listenBtn').textContent='No mic';return} if(state.recognition)return; state.recognition=new R(); state.recognition.continuous=true; state.recognition.interimResults=true; state.recognition.lang='en-US'; state.recognition.onresult=e=>{if(window.readerSpeaking)return; let final=''; for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+' '} if(final.trim()){let existing=$('answerBox').value.trim(); $('answerBox').value=(existing?existing+' ':'')+final.trim(); scheduleAutoCheck()}}; state.recognition.onend=()=>{state.listening=false; $('listenBtn').textContent='Listen'; if($('autoListen').checked)setTimeout(startListening,750)}; state.recognition.onerror=e=>console.log('speech error',e.error)}
function startListening(){setupRecognition(); if(!state.recognition||state.listening)return; try{state.recognition.start(); state.listening=true; $('listenBtn').textContent='Stop mic'}catch(e){}}
function stopListening(){if(state.recognition){try{state.recognition.stop()}catch(e){}} state.listening=false; $('listenBtn').textContent='Listen'}
function scheduleAutoCheck(){if(!$('autoCheck').checked)return; clearTimeout(state.finalTimer); let c=current(); let delay=(parseInt($('autoCheckDelay').value)||1400)+(c?c.pause:0); state.finalTimer=setTimeout(()=>checkAnswer(true),delay)}
function downloadText(name,content){let a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type:'text/plain'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function setFileReadStatus(message, kind=''){
  const el=$('fileReadStatus'); if(!el)return;
  el.textContent=message||'';
  el.className='subtle '+(kind==='bad'?'badText':kind==='ok'?'okText':kind==='warn'?'warnText':'');
}
function readFileAsArrayBuffer(file){return new Promise((resolve,reject)=>{const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=()=>reject(r.error||new Error('Could not read file.')); r.readAsArrayBuffer(file);});}
function readFileAsText(file){return new Promise((resolve,reject)=>{const r=new FileReader(); r.onload=()=>resolve(String(r.result||'')); r.onerror=()=>reject(r.error||new Error('Could not read file.')); r.readAsText(file);});}
async function loadPdfJs(){
  if(window.pdfjsLib) return window.pdfjsLib;
  if(window.__offbookPdfJsPromise) return window.__offbookPdfJsPromise;
  window.__offbookPdfJsPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-offbook-pdfjs]');
    if(existing){existing.addEventListener('load',()=>resolve(window.pdfjsLib)); existing.addEventListener('error',()=>reject(new Error('PDF reader failed to load.'))); return;}
    const script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async=true;
    script.dataset.offbookPdfjs='true';
    script.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(new Error('PDF reader loaded but was not available.'));
    script.onerror=()=>reject(new Error('PDF reader failed to load. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
  return window.__offbookPdfJsPromise;
}
async function extractPdfText(file){
  const pdfjsLib=await loadPdfJs();
  if(!pdfjsLib) throw new Error('PDF reader did not load. Check your internet connection, then refresh and try again.');
  if(pdfjsLib.GlobalWorkerOptions){
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const data=await readFileAsArrayBuffer(file);
  const pdf=await pdfjsLib.getDocument({data:new Uint8Array(data)}).promise;
  const pages=[];
  for(let pageNum=1;pageNum<=pdf.numPages;pageNum++){
    setFileReadStatus(`Reading PDF page ${pageNum} of ${pdf.numPages}...`);
    const page=await pdf.getPage(pageNum);
    const content=await page.getTextContent({normalizeWhitespace:true,disableCombineTextItems:false});
    const rows=[];
    content.items.forEach(item=>{
      const str=String(item.str||'').trim();
      if(!str)return;
      const transform=item.transform||[0,0,0,0,0,0];
      const x=Number(transform[4]||0);
      const y=Number(transform[5]||0);
      let row=rows.find(r=>Math.abs(r.y-y)<=3);
      if(!row){row={y,items:[]}; rows.push(row);}
      row.items.push({x,text:str});
    });
    rows.sort((a,b)=>b.y-a.y);
    const pageLines=rows.map(row=>{
      row.items.sort((a,b)=>a.x-b.x);
      let line='';
      let lastX=null;
      row.items.forEach(item=>{
        if(!line){line=item.text;}
        else{
          const gap=lastX===null?1:item.x-lastX;
          line += gap>18 ? '  '+item.text : ' '+item.text;
        }
        lastX=item.x + item.text.length*5;
      });
      return line.replace(/\s+/g,' ').trim();
    }).filter(Boolean);
    pages.push(pageLines.join('\n'));
  }
  return pages.join('\n\n');
}

async function importSelectedFile(){
  if(!state.selectedFile){alert('Choose a .txt or .pdf file first.');return;}
  const file=state.selectedFile;
  const name=(file.name||'').toLowerCase();
  try{
    $('loadFileBtn').disabled=true;
    if(name.endsWith('.pdf')||file.type==='application/pdf'){
      setFileReadStatus('Reading PDF...');
      const text=await extractPdfText(file);
      if(!text.trim()){
        setFileReadStatus('No text was found in this PDF. It may be scanned/image-only and will need OCR.', 'bad');
        alert('No text was found in this PDF. It may be scanned/image-only and will need OCR.');
        return;
      }
      importRaw(text,file.name);
      setFileReadStatus('PDF imported. Review the detected characters before rehearsing.', 'ok');
    }else{
      setFileReadStatus('Reading text file...');
      const text=await readFileAsText(file);
      importRaw(text,file.name);
      setFileReadStatus('Text file imported. Review the detected characters before rehearsing.', 'ok');
    }
  }catch(err){
    console.error(err);
    setFileReadStatus(err&&err.message?err.message:'Could not read file.', 'bad');
    alert(err&&err.message?err.message:'Could not read file.');
  }finally{
    $('loadFileBtn').disabled=false;
  }
}
$('fileInput').addEventListener('change',e=>{state.selectedFile=e.target.files&&e.target.files[0]; $('loadFileBtn').textContent=state.selectedFile?'Load '+state.selectedFile.name:'Load selected file'; setFileReadStatus(state.selectedFile?'Ready to import '+state.selectedFile.name:'');});
$('loadFileBtn').onclick=()=>importSelectedFile();
if($('enableSoundBtn')) $('enableSoundBtn').onclick=async()=>{if(await enableSound()) rawTone(520,0.10,0,'sine',0.22)}; if($('testDingBtn')) $('testDingBtn').onclick=()=>playPassSound(true); if($('testErrBtn')) $('testErrBtn').onclick=()=>playFailSound(true); if($('cueModeQuick')) $('cueModeQuick').onchange=()=>{if($('cueModeQuick').value!=='same'){$('cueMode').value=$('cueModeQuick').value; renderCard();}};
$('loadPasteBtn').onclick=()=>importRaw($('pasteBox').value,'Pasted text'); $('clearPasteBtn').onclick=()=>$('pasteBox').value=''; $('continueBtn').onclick=continueSaved; $('clearSavedBtn').onclick=()=>{localStorage.removeItem(LS_KEY); LEGACY_KEYS.forEach(k=>localStorage.removeItem(k)); alert('Saved OffBook script cleared.')}; $('downloadTemplateBtn').onclick=()=>downloadText('screenplay_trainer_multicharacter_template.txt','TITLE: Script Name\nAUTHOR: Author Name\n\nALICE\nWhere is Bob?\n\nBOB\nRight here.\n\nCAROL\nCan we get started?\n\nALICE\nOne second.\n[pause:3]\nReady.\n');
$('selectAllRoles').onclick=()=>{state.selectedRoles=new Set(state.characters); saveAll(); renderImport([], 'Current script'); buildPracticeList()}; $('clearRoles').onclick=()=>{state.selectedRoles=new Set(); saveAll(); renderImport([], 'Current script'); buildPracticeList()};
$('startBtn').onclick=startRehearsal; $('goReviewBtn').onclick=()=>setTab('review'); ['practiceOrder','practicePool','rangeStart','rangeEnd','repeatEach','repeatSequence','cueMode'].forEach(id=>$(id).onchange=buildPracticeList);
$('revealBtn').onclick=()=>{state.revealed=!state.revealed; renderCurrent()}; $('checkBtn').onclick=()=>checkAnswer(false); $('nextBtn').onclick=nextLine; $('prevBtn').onclick=prevLine; $('markPassBtn').onclick=()=>mark(current()?.id,'passed'); $('markFailBtn').onclick=()=>mark(current()?.id,'failed'); $('markNeedsBtn').onclick=()=>mark(current()?.id,'needs'); $('bookmarkBtn').onclick=()=>{let c=current(); if(c){state.bookmarks[c.id]=!state.bookmarks[c.id]; saveAll(); renderCurrent(); renderReview()}}; $('speakCueBtn').onclick=()=>{let c=current(); if(c)speak(cueSpeechText(c))}; $('toggleBlockingBtn').onclick=()=>{state.blockingRevealed=!state.blockingRevealed; renderCurrent()}; $('showBlocking').onchange=renderCurrent; $('showNotes').onchange=renderCurrent; $('speakLineBtn').onclick=()=>{let c=current(); if(c)speak(c.speakText)}; $('requeueBtn').onclick=()=>{let c=current(); if(c){state.currentList.splice(state.pos+1,0,c); $('checkResult').textContent='Line requeued.'}}; $('clearAnswerBtn').onclick=()=>$('answerBox').value=''; $('listenBtn').onclick=()=>state.listening?stopListening():startListening(); $('refreshVoicesBtn').onclick=loadVoices; $('testVoiceBtn').onclick=()=>speak('Reader voice is working.'); $('navSearch').oninput=renderReview; $('navFilter').onchange=renderReview; $('copyReportBtn').onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(state.misses.map(m=>`Line ${m.roleN} (${m.speaker})\nExpected: ${m.expected}\nYou said: ${m.said}\n`).join('\n')); $('clearReportBtn').onclick=()=>{state.misses=[]; saveAll(); renderReview()}; $('resetProgressBtn').onclick=()=>{if(confirm('Reset statuses, bookmarks, and missed report?')){state.statuses={};state.trouble={};state.bookmarks={};state.misses=[];saveAll();renderCurrent();renderReview()}};
if('speechSynthesis'in window){loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; setTimeout(loadVoices,500); setTimeout(loadVoices,1500)}
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js?v=48').then(reg=>{reg.update&&reg.update();}).catch(()=>{})}
continueSaved();
