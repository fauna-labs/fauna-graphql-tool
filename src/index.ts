import fs from 'fs';
import gql from  'graphql-tag';
import { createSchema } from './create-schema';
import { createAuthFunctions } from './fauna-functions';
import { createAuthIndex } from './fauna-index';
import { createAuthRoles } from './fauna-roles';
import { retrieveInfo, retrieveProtected } from './retrieve';
import { mergeTypeDefs } from '@graphql-tools/merge';
const print = require('graphql');


const main = async () => {
  try {
    const typeDefs = await fs.readFileSync('./schema.graphql').toString('utf-8');
    const fragment = gql`${typeDefs}`;
    const authables = await retrieveInfo(fragment);
    const protectedModels = await retrieveProtected(fragment);
    await createSchema(authables);
    await createAuthIndex(authables);
    await createAuthFunctions(authables);

    await createAuthRoles(authables, protectedModels);

    const graphqlChanges = await fs.readFileSync('./fauna/newschema.graphql').toString('utf-8');
    const types = [
      typeDefs,
      graphqlChanges,
    ];
    const newTypeDefs = mergeTypeDefs(types);
    const schemaPrint = print.print(newTypeDefs);
    let finalSchema = schemaPrint.split('schema')[0];
    await fs.writeFileSync('./fauna/schema.graphql', finalSchema);
    console.log('Generated resources from schema');
    
  } catch (error) {
    console.log(error);
  }
};

export default main();