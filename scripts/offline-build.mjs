import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${path}/${e.name}`):[`${path}/${e.name}`])}
const files=walk('dist').filter(x=>!x.endsWith('/sw.js')).map(x=>x.slice(5));
const version=createHash('sha256').update(files.map(x=>readFileSync('dist/'+x)).join('')).digest('hex').slice(0,12);
const template=readFileSync('public/sw.js','utf8').replace('__CACHE_VERSION__',version).replace('/*__PRECACHE__*/[]',JSON.stringify(files));writeFileSync('dist/sw.js',template);
