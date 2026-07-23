//List is used when order is needed and duplicates are allowed
const { createClient } = require('redis');

async function main() {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const LIST_KEY = 'visitors';

  // SEND — push names onto the list
  await client.rPush(LIST_KEY, 'Alice');
  await client.rPush(LIST_KEY, 'Bob');
  await client.rPush(LIST_KEY, 'Charlie');
  await client.rPush(LIST_KEY, 'Bob'); 
  await client.lPush(LIST_KEY, 'Shiva')
  console.log('pushed 5 names to list');

  // READ — get all items, or just a range
  const all = await client.lRange(LIST_KEY, 0, -1); //-1 generally means the last item and -2 means second last item
  console.log('list contents:', all); 

  const firstTwo = await client.lRange(LIST_KEY, 0, 1); // index 0 and 1 only
  console.log('first two visitors:', firstTwo);

  // lLen — how many items in the list
  const length = await client.lLen(LIST_KEY);
  console.log('list length:', length);

  // lIndex — get the item at a specific position
  const thirdVisitor = await client.lIndex(LIST_KEY, 2);
  console.log('visitor at index 2:', thirdVisitor); 

  // DELETE 
  await client.lRem(LIST_KEY, 1, 'Bob'); 
  console.log('after removing one Bob:', await client.lRange(LIST_KEY, 0, -1));

  // await client.del(LIST_KEY);
  // console.log('after del:', await client.lRange(LIST_KEY, 0, -1));

  await client.quit();
}

main();