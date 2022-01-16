// TODO: Create Type Definition for this file

export const retrieveInfo = async (fragment: any) => {
  let authable: any[] = [];
  if(fragment.definitions) {
    fragment.definitions.forEach((def:any) => {
      if(def.directives && def.directives.length > 0) { 
        let authFilter = def.directives.filter((d:any) => d.name.value === 'auth')
        authFilter.forEach((auth: any) => { 
          authable.push({
            name: def.name.value,
            args: auth.arguments.map((a:any) => ({ name: a.name.value, value: a.value.value })),
          })
        })
      }
    })
  }
  return authable;
}

export const retrieveProtected = async (fragment: any) => { 
  let _protected: any[] = [];
  if(fragment.definitions) { 
    fragment.definitions.forEach((def:any) => {
      if(def.directives && def.directives.length > 0) { 
        let protectedFilter = def.directives.filter((d:any) => d.name.value === 'protected')
        protectedFilter.forEach((p:any) => { 
          _protected.push({
            name: def.name.value,
            args: p.arguments.map((a:any) => ({ name: a.name.value, value: a.value.values })),
          })
        })
      }
    })
  }
  return _protected;
}