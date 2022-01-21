import fs from 'fs';
import { Authable } from "./create-schema";

export const createAuthIndex = async (authables: Authable[]) => {
  if(authables.length > 1) { 
    console.log('Multiple Auth Models not Supported');
    return;
  }

  const authModel = authables[0];
  if(!authModel) { 
    return;
  }
  const primaryKey = authModel.args.find(a => a.name === 'primary');

  if(!primaryKey) { 
    console.log('No Primary Key Found');
    return;
  }

  const dir = 'fauna/indexes'
  if (!fs.existsSync(dir)){
    await fs.mkdirSync(dir, { recursive: true });
  }
  const content = `
import { query as q } from "faunadb";

export default {
  name: "${authModel.name.toLowerCase()}_by_${primaryKey.value}",
  source: q.Collection("${authModel.name}"),
  unique: true,
  terms: [
    {
      field: ["data", "${primaryKey.value}"]
    }
  ]
}
`;

  await fs.writeFileSync('fauna/indexes/authindex.js', content);

}