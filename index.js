const MongoClient = require("mongodb").MongoClient;

const MONGO_URL = "mongodb://localhost:27017";
const DATABASE_NAME = "loadtest";
const COLLECTION_NAME = "test";
const DOCS_TO_INSERT_COUNT = 8 * 1000;
const ARRAY_FIELD_SIZE = 20;
const REQUESTS_COUNT = 300;

const client = new MongoClient(MONGO_URL, {
  enableUtf8Validation: false,
  ignoreUndefined: true,
});

let db;

async function main() {
  await initDbConnection();
  await maybePopulateDb();
  await runBenchmark();
}

main()
  .catch(console.error)
  .finally(() => client.close());

async function initDbConnection() {
  await client.connect();
  db = client.db(DATABASE_NAME);
}

async function runBenchmark() {
  const tag = generateTag();
  const numBenchmarkIterations = 3;

  for (let i = 0; i < numBenchmarkIterations; i += 1) {
    console.time(tag);
    await benchmark();
    console.timeEnd(tag);

    /* wait for GC to free up the memory */
    await sleep(60);
  }
}

function generateTag() {
  const driverVersion = process.argv[2];
  return `Fetch ${DOCS_TO_INSERT_COUNT} docs ${REQUESTS_COUNT} times in parallel (driver ${driverVersion})`;
}

async function maybePopulateDb() {
  const insertedDocsCount = await getInsertedDocsCount();
  if (!insertedDocsCount) {
    await populateDb();
  } else if (DOCS_TO_INSERT_COUNT !== insertedDocsCount) {
    await clearDb();
    await populateDb();
  }
}

function getInsertedDocsCount() {
  return db.collection(COLLECTION_NAME).countDocuments({});
}

function clearDb() {
  return db.collection(COLLECTION_NAME).drop();
}

async function populateDb() {
  const docs = composeDocs();
  await bulkInsertDocs(docs);
}

function composeDocs() {
  const docs = new Array(DOCS_TO_INSERT_COUNT);
  const arrayField = composeArrayField();

  for (let i = 0; i < DOCS_TO_INSERT_COUNT; i += 1) {
    docs[i] = { _id: i, arrayField };
  }

  return docs;
}

function composeArrayField() {
  const arrayField = new Array(ARRAY_FIELD_SIZE);

  for (let i = 0; i < ARRAY_FIELD_SIZE; i += 1) {
    arrayField[i] = "5e99f3f5d3ab06936d360" + i;
  }

  return arrayField;
}

async function bulkInsertDocs(docs) {
  const operations = new Array(docs.length);

  for (let i = 0; i < docs.length; i += 1) {
    operations[i] = { insertOne: docs[i] };
  }

  await db.collection(COLLECTION_NAME).bulkWrite(operations);
}

async function benchmark() {
  const promises = new Array(REQUESTS_COUNT);

  for (let i = 0; i < REQUESTS_COUNT; i += 1) {
    promises[i] = fetchDocs();
  }

  return Promise.all(promises);
}

function fetchDocs() {
  return db.collection(COLLECTION_NAME).find({}).toArray();
}

function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
