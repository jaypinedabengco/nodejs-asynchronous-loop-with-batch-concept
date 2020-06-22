var http = require("http");
const data = require(`${__dirname}/data.json`);

//create a server object:
http
  .createServer(async function(req, res) {
    await logic(req, res);
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080

/**
 *
 */
async function logic(req, res) {
  try {
    const sampleData = [...data];

    /**
     * Sample on how to do
     * batch asynchronous
     * request
     */
    const result = await _loopByBatch(
      sampleData,
      async data => {
        return _simulateAsyncronousProcess(data);
      },
      { batchCount: 10 }
    );

    res.write(JSON.stringify(result, null, 2));
  } catch (err) {
    // res.status(500);
    console.error(err);
    res.write("error");
  }
}

/**
 * Loop through the array, with ability
 * to set batch count.
 */
async function _loopByBatch(
  data,
  doToEach,
  { batchCount = 4, saveResult = true } = {}
) {
  if (doToEach instanceof Function === false) {
    throw new Error(`function is required on 2nd argument`);
  }

  const resultsContainer = [];

  let batchProcessContainer = [];
  for (let i = 0; i < data.length; i++) {
    // if
    const currentBatchCount = i + 1;
    batchProcessContainer.push(doToEach(data[i]));

    // If divisible by batchhCount OR its the last on the loop,
    // then wait for it to finish
    // & cleanup the batchProcessContainer...
    if (
      currentBatchCount % batchCount === 0 ||
      currentBatchCount === data.length
    ) {
      const result = await Promise.all(batchProcessContainer);

      console.log(
        `Waiting for batch #${Math.ceil(
          currentBatchCount / batchCount
        )} to finish`,
        ` | batchCount: ${batchCount}, saveResult : ${saveResult}`
      );
      // clean batchProcessContainer
      batchProcessContainer.length = 0;
      if (saveResult) {
        resultsContainer.push(...result);
      }
    }
  }
  return resultsContainer;
}

/**
 *
 */
async function _simulateAsyncronousProcess(
  data,
  timeoutInMillis = 100,
  throwError = false
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (throwError) {
        return reject(new Error("Simulated Error"));
      }
      return resolve({
        data,
        process_timestamp: Date.now()
      });
    }, timeoutInMillis);
  });
}
