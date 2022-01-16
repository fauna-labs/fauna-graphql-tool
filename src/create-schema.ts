import fs from 'fs';

type AuthDirectiveArgs = {
  name: string;
  value: string;
}

export type Authable = {
  name: string;
  args: AuthDirectiveArgs[];
}

export const createSchema = async (authables: Authable[]) => {
  if(authables.length > 1) { 
    console.log('Multiple Auth Models not Supported');
    return;
  }

  const dir = 'fauna'
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
type Mutation {
  register(
    ${primaryKey.value}: String!, 
    password: String!
  ): ${authModel.name} @resolver(name: "Register${authModel.name}")
  login(
    ${primaryKey.value}: String!, 
    password: String!
  ): Token @resolver(name: "Login${authModel.name}")
}

type Token @embedded {
  ttl: Time!
  secret: String!
  data: ${authModel.name}
}
  `;
  await fs.writeFileSync('fauna/newschema.graphql', content)
} 