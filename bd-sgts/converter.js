const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const tableName = 'locali';

const inputCsv =  tableName + '.csv'; // Nombre del archivo CSV de entrada
const outputSql = './scripts mysql/' + 'insert_' + tableName + '.sql'; // Archivo SQL de salida

let columns = [];
let values = [];

fs.createReadStream(inputCsv, { encoding: 'latin1' }) // Leer el archivo en codificación Latin-1
  .pipe(csv({ separator: '\t' })) // Especificar tabulación como separador
  .on('headers', (headers) => {
    columns = headers.map(header => header.trim());
  })
  .on('data', (row) => {
    const rowValues = columns.map(col => `'${row[col].replace(/'/g, "''")}'`);
    values.push(`(${rowValues.join(', ')})`);
  })
  .on('end', () => {
    const sqlInsert = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values.join(',\n')};`;
    
    fs.writeFileSync(outputSql, sqlInsert, { encoding: 'utf8' }); // Guardar en UTF-8
    console.log(`Archivo SQL generado: ${outputSql}`);
  });
