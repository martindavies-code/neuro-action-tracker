import {renderToStaticMarkup} from 'react-dom/server';
import {CompanionArt} from '../src/components/CompanionArt';
import {writeFileSync} from 'node:fs';
const choices=['pip','mochi','nova','bubbles'] as const;
writeFileSync('/tmp/companion-gallery.html',renderToStaticMarkup(<html><head><style>{`body{font:18px system-ui;background:#f2f8f5;color:#20372c;padding:30px;--primary:#287b59;--primary-light:#e2f2e9;--accent-sun:#e78a18;--bg-surface:white}main{display:grid;grid-template-columns:repeat(3,180px);gap:20px}article{background:white;padding:20px;border-radius:14px;text-align:center}svg{width:125px;height:125px}`}</style></head><body><h1>Companion growth stages</h1><main>{choices.flatMap(choice=>[1,3,5].map(level=><article key={choice+level}><CompanionArt choice={choice} level={level}/><p>{choice} · level {level}</p></article>))}</main></body></html>));
