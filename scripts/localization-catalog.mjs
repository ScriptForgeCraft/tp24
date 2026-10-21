import fs from 'node:fs/promises';
import { uiTranslations, uiText } from '../src/uiTranslations.js';

// The data module's Vite-only image lookups are irrelevant to the text inventory.
export async function readData(file = 'src/data.js') {
  return readDataSource(await fs.readFile(file, 'utf8'));
}
export async function readDataSource(source) {
  source = source.replace(/import\.meta\.glob\([^;]+\)/g, '{}');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
export function catalog(data) {
  const rows = [];
  const add = (key, en, am, file = 'src/data.js') => rows.push({ key, en, am, file });
  const pair = (key, en, am) => {
    if (Array.isArray(en)) en.forEach((value, index) => pair(`${key}[${index}]`, value, am?.[index]));
    else if (typeof en === 'string') add(key, en, am);
  };
  for (const key of Object.keys(data.translations.en)) pair(`translations.${key}`, data.translations.en[key], data.translations.am[key]);
  for (const collection of ['packages','services','projects','implementingCompanies','news','videos']) {
    data[collection].forEach((item, index) => {
      for (const key of ['name','title','category','description','detail','items','inheritance','comparison','imageLabel','role','organization']) {
        if (item[key] === undefined) continue;
        const am = key === 'name' || key === 'title' ? item.am ?? item.hy?.[key] ?? item[key] : item.hy?.[key];
        pair(`${collection}[${index}].${key}`, item[key], am);
      }
      item.scope?.forEach((group, groupIndex) => {
        pair(`${collection}[${index}].scope[${groupIndex}].title`, group.title, group.hy?.title);
        pair(`${collection}[${index}].scope[${groupIndex}].items`, group.items, group.hy?.items);
      });
    });
  }
  data.stages.forEach(([title,text,amTitle,amText],index) => {
    add(`stages[${index}].title`,title,amTitle); add(`stages[${index}].text`,text,amText);
  });
  data.navigation.forEach((item,index)=>add(`navigation[${index}]`,item.en,item.am));
  add('contact.location',data.contact.location,data.contact.amLocation);
  return rows;
}
export function uiCatalog() {
  return Object.entries(uiTranslations).map(([en,am])=>({key:`uiText(${JSON.stringify(en)})`,en,am,file:'src/uiTranslations.js'}));
}
export { uiText };
