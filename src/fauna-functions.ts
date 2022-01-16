import { Authable } from "./create-schema";
import fs from 'fs';

export const createAuthFunctions = async (authables: Authable[]) => { 
  const dir = 'fauna/functions'
  if (!fs.existsSync(dir)){
    await fs.mkdirSync(dir, { recursive: true });
  }

  const authModel = authables[0];
  const primaryKey = authModel.args.find(a => a.name === 'primary');

  if(!primaryKey) {
    console.log('No Primary Key Found');
    return;
  }

  const content = `
import { query as q } from "faunadb";

export default {
  name: "Login${authModel.name}",
  body:
  q.Query(
    q.Lambda(
      ["${primaryKey.value}", "password"],
      q.Let(
        {
          credentials: q.Login(q.Match(q.Index("${authModel.name.toLowerCase()}_by_${primaryKey.value}"), q.Var("${primaryKey.value}")), {
            password: q.Var("password"),
            ttl: q.TimeAdd(q.Now(), 1800, "seconds")
          })
        },
        {
          secret: q.Select("secret", q.Var("credentials")),
          ttl: q.Select("ttl", q.Var("credentials")),
          data: q.Match(q.Index("${authModel.name.toLowerCase()}_by_${primaryKey.value}"), q.Var("${primaryKey.value}")),
        }
      )
    )
  )
};
  `

  const register = `
import { query as q } from "faunadb";

export default {
  name: "Register${authModel.name}",
  body:
  q.Query(
    q.Lambda(
      ["${primaryKey.value}", "password"],
      q.Create(q.Collection("${authModel.name}"), {
        credentials: { password: q.Var("password") },
        data: { ${primaryKey.value}: q.Var("${primaryKey.value}")}
      })
    )
  )
};
  `
  await fs.writeFileSync('fauna/functions/login.js', content)
  await fs.writeFileSync('fauna/functions/register.js', register)
}
