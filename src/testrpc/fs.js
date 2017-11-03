import * as Level from 'level-js';
import * as levelup from 'levelup';
import * as fs from 'level-filesystem';

const leveldb = new Level('./database');

console.log('LEVELJS: ', leveldb);
const db = levelup('level-filesystem', { db: leveldb });
module.exports = fs(db);
