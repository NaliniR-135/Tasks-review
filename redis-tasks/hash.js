// hash is used when we want to store objects that has many attributes
const { createClient } = require('redis');

async function main() {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const HASH_KEY = 'person:alice'; // one hash representing one person

  // SEND — set fields on the hash
  await client.hSet(HASH_KEY, 'name', 'Alice');
  await client.hSet(HASH_KEY, 'age', '28');
  await client.hSet(HASH_KEY, 'education', 'B.Tech');
  console.log('set fields on hash');

  // READ — get one field, or all fields
  const name = await client.hGet(HASH_KEY, 'name');
  console.log('name:', name);

  const all = await client.hGetAll(HASH_KEY);
  console.log('all fields:', all); 

  // hExists — check if a field exists without reading its value
  const hasAge = await client.hExists(HASH_KEY, 'age');
  console.log('does age field exist?', hasAge);

  const hasCity = await client.hExists(HASH_KEY, 'city');
  console.log('does city field exist?', hasCity); 

  // hLen — how many fields total
  const fieldCount = await client.hLen(HASH_KEY);
  console.log('number of fields:', fieldCount); // 3

  // hKeys — just the field names
  const keys = await client.hKeys(HASH_KEY);
  console.log('field names:', keys); 

  // hVals — just the values
  const values = await client.hVals(HASH_KEY);
  console.log('values:', values); 

  // hSetNX — only set a field if it doesn't already exist
  const setCity = await client.hSetNX(HASH_KEY, 'city', 'Bangalore');
  console.log('did hSetNX add city?', setCity);

  const setNameAgain = await client.hSetNX(HASH_KEY, 'name', 'SomeoneElse');
  console.log('did hSetNX overwrite name?', setNameAgain); 

  console.log('name is still:', await client.hGet(HASH_KEY, 'name')); // 'Alice', unchanged

  // updating a value normally — plain hSet DOES overwrite
  await client.hSet(HASH_KEY, 'age', '29');
  console.log('after updating age:', await client.hGetAll(HASH_KEY));

  // DELETE — remove one field, or wipe the whole hash
  await client.hDel(HASH_KEY, 'education');
  console.log('after removing education field:', await client.hGetAll(HASH_KEY));

  // await client.del(HASH_KEY);
  // console.log('after del:', await client.hGetAll(HASH_KEY));

  await client.quit();
}

main();