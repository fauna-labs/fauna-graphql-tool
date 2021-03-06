import fs from 'fs';
import { Authable } from './create-schema';


type ProtectedDirectiveArgs = {
  name: string;
  value: {}[];
}

export type ProtectedModel = {
  name: string;
  args: ProtectedDirectiveArgs[];
}

export const createAuthRoles = async (authables: Authable[], protectedModels: ProtectedModel[]) => { 
  if(authables.length > 1) { 
    console.log('Multiple Auth Models not Supported');
    return;
  }

  const authModel = authables[0]
  if(!authModel) { 
    return;
  }
  const dir = 'fauna/roles'
  if (!fs.existsSync(dir)){
    await fs.mkdirSync(dir, { recursive: true });
  }

  const predicates = `
    const onlyDeleteByOwner = q.Query(
      q.Lambda(
        "ref",
        q.Equals(q.CurrentIdentity(), q.Select(["data", "user"], q.Get(q.Var("ref"))))
      )
    );

    /**
     * Use this predicate to Restrict Create only to owner
     */
    // const onlyCreateByOwner = q.Query(
    //   q.Lambda(
    //     "values", 
    //     q.Equals(
    //       q.Identity(), 
    //       q.Select(["data", "owner"], q.Var("values"))
    //     )
    //   )
    // )

    /**
     * Use this predicate to Restrict Read only to owner
     */
    // const onlyReadByOwner = q.Query(
    //   q.Lambda("ref", q.Equals(
    //     q.Identity(), // logged in user
    //     q.Select(["data", "owner"], q.Get(q.Var("ref")))
    //   ))
    // )

    /**
     * User this predicate to Restrict Update only to owner
     */
    // const onlyOwnerWrite = q.Query(
    //   q.Lambda(
    //     ["oldData", "newData"],
    //     q.And(
    //       q.Equals(q.Identity(), q.Select(["data", "owner"], q.Var("oldData"))),
    //       q.Equals(
    //         q.Select(["data", "owner"], q.Var("oldData")),
    //         q.Select(["data", "owner"], q.Var("newData"))
    //       )
    //     )
    //   )
    // )


  `

  let privileges = `
    {
      resource: q.Collection("${authModel.name}"),
      actions: {
        read: true,
        create: true,
        delete: onlyDeleteByOwner
      }
    },`;

  protectedModels.forEach(m => { 
    let actions: any = {};
    const rule = m.args.filter(z => z.name === 'rule');
    rule[0].value.forEach((r: any) => {
      actions[r.value] = true;
    });

    
    let prev = `{
      resource: q.Collection("${m.name}"),
      actions: ${JSON.stringify(actions)}
    }`;
    privileges += prev;
  });

  privileges = `[${privileges}],`;

  const content = `
  import { query as q } from "faunadb";
  ${predicates};
  export default {
    name: "${authModel.name}Role",
    privileges: ${privileges}
    membership: [
      {
        resource: q.Collection("${authModel.name}"),
      }
    ]
  }
  `

  const registerRole = `
import { query as q } from "faunadb";

export default {
  name: "RegisterRole",
  privileges: [
    {
      resource: q.Collection("${authModel.name}"),
      actions: {
        read: true,
        create: true,
      }
    },
    {
      resource: q.Index("user_by_email"),
      actions: {
        read: true
      }
    }
  ]
}
  `;

  const loginRole = `
import { query as q } from "faunadb";

export default {
  name: "LoginRole",
  privileges: [
    {
      resource: q.Collection("User"),
      actions: {
        read: true,
      }
    },
    {
      resource: q.Index("user_by_email"),
      actions: {
        read: true
      }
    }
  ]
}
  `

  await fs.writeFileSync('fauna/roles/authRole.js', content)
  await fs.writeFileSync('fauna/roles/registerRole.js', registerRole)
  await fs.writeFileSync('fauna/roles/loginRole.js', loginRole)
}