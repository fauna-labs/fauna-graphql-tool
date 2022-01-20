# Fauna Labs

Fauna GraphQL tool is an automation library that is used to easily add features such as `authentication`, `custom resolver (UDF)`, `sorting of subgraphs`, `fuzzy full-text search`, etc. 

FGT works with the `fauna-graphql-upload` library as well as `fauna-schema-migrate` 

### Get Started

Define your GraphQL schema. `@auth` will define the model that is being used as membership model. Currently supports only 1 member model. `@protected` will define the rules for accessing a record.

```bash
type Comment @protected(membership: "User", rule: ["read", "write", "create"]) {
  content: String!
  talk: Talk!
  user: User!
}

type User @auth(primary: "email") {
  email: String! @unique
  username: String
  comments: [Comment!] @relation
}
```

```bash
npm i @fauna-labs/graphql-tool fauna-gql-upload --save-dev
```

Create a script to run the tool.

```json
// package.json

"scripts": {
		"fgu": "fgu",
    "fgt": "fgt"
}
```

In this example I am using the `fauna-graphql-upload` tool. Create a new `.env` file and add your admin key.

```json
FGU_SECRET=<your key>
```

Now run `npm run fgt`. Notice all resources are generated in the `/fauna/` file in your project directory.

Run `npm run fgu` to update all resources in the cloud environment.

---

Features in Progress

1. Fuzzy Search `@searchble` directive. Can be used as a full-text search as well.
2. Sorting and filtering `@sortable` directive **[Priority]**
3. Custom geolocation query `@geo` directive. Based on community solution. **[Priority]**
4. Multiple auth model support
5. `updated_at` field and custom sorting