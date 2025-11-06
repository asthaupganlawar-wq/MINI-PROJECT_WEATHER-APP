const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));


const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { cities: [] });


(async () => { await db.read(); db.data ||= { cities: [] }; await db.write(); })();


function escapeXml(value) {
return value.replace(/[<>&'\"]?/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','\"':'&quot;',"'":'&apos;' }[c] || c));
}


// Routes
app.get('/api/cities', async (req,res)=>{ await db.read(); res.json(db.data.cities); });


app.post('/api/cities', async (req,res)=>{
const item = { id: nanoid(), ...req.body };
await db.read();
db.data.cities.push(item);
await db.write();
res.status(201).json(item);
});


app.delete('/api/cities/:id', async (req,res)=>{
await db.read();
db.data.cities = db.data.cities.filter(c=>c.id!==req.params.id);
await db.write();
res.status(204).send();
});


// XML Export Route
app.get('/api/export/xml', async (req,res)=>{
await db.read();
const xmlPath = path.join(__dirname, 'weather_data.xml');
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<cities>\n';
for(const c of db.data.cities){
xml += ` <city id="${c.id}">\n`;
for(const [k,v] of Object.entries(c)){
if(k==='id') continue;
xml += ` <${k}>${escapeXml(String(v ?? ''))}</${k}>\n`;
}
xml += ' </city>\n';
}
xml += '</cities>';
fs.writeFileSync(xmlPath, xml);
res.download(xmlPath);
});


const PORT = 3000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));

app.get('/api/export/xml', async (req, res) => {
  await db.read();
  const cities = db.data.cities;
  const xmlFilePath = path.join(__dirname, 'weather_data.xml');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<cities>\n';
  cities.forEach(c => {
    xml += `  <city id="${c.id}">\n`;
    xml += `    <name>${escapeXml(c.city)}</name>\n`;
    xml += `    <country>${escapeXml(c.country || '')}</country>\n`;
    xml += `    <temp>${c.temp ?? ''}</temp>\n`;
    xml += `    <feels_like>${c.feels_like ?? ''}</feels_like>\n`;
    xml += `    <humidity>${c.humidity ?? ''}</humidity>\n`;
    xml += `    <wind>${c.wind ?? ''}</wind>\n`;
    xml += `    <description>${escapeXml(c.description || '')}</description>\n`;
    xml += `    <icon>${escapeXml(c.icon || '')}</icon>\n`;
    xml += `  </city>\n`;
  });
  xml += '</cities>';

  fs.writeFileSync(xmlFilePath, xml, 'utf8');
  res.download(xmlFilePath);
});