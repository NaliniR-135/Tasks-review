// set does not allow duplicates and are unordered
const { createClient } = require('redis');

async function main() {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const SET_KEY = 'visitor2:unique-visitors';

  // SEND — add names to the set
  await client.sAdd(SET_KEY, 'Alice');
  await client.sAdd(SET_KEY, 'Bob');
  await client.sAdd(SET_KEY, 'Charlie');
  await client.sAdd(SET_KEY, 'Bob'); 
  console.log('attempted to add 4 names to set');

  // READ — get all members, or check if one specific item exists
  const members = await client.sMembers(SET_KEY);
  console.log('set contents (unique, unordered):', members); 

  // sCard — how many unique members (this is the Set equivalent of lLen/hLen)
  const size = await client.sCard(SET_KEY);
  console.log('set size:', size); 

  // sIsMember — check if a specific name is in the set
  console.log('is Bob in the set?', await client.sIsMember(SET_KEY, 'Bob')); 
  console.log('is Zara in the set?', await client.sIsMember(SET_KEY, 'Zara')); 

  // DELETE — remove one specific member, or wipe the whole set
  await client.sRem(SET_KEY, 'Charlie');
  console.log('after removing Charlie:', await client.sMembers(SET_KEY));

  // await client.del(SET_KEY);
  // console.log('after del:', await client.sMembers(SET_KEY));

  await client.quit();
}

main();