import * as fs from 'fs';

const fileBuffer = fs.readFileSync('mclaren_p1.glb');
const str = fileBuffer.toString('utf8');

const regex = /"name":"([^"]+)"/g;
let match;
const names = new Set();
while ((match = regex.exec(str)) !== null) {
  names.add(match[1]);
}

console.log(Array.from(names).filter(n => n.toLowerCase().includes('door')));
