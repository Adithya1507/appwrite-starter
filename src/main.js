import { Client } from 'node-appwrite';

// This is your Appwrite function
// It's executed each time we get a request
export default async ({ req, res, log, error }) => {
  // Why not try the Appwrite SDK?
  //
  // const client = new Client()
  //    .setEndpoint('https://cloud.appwrite.io/v1')
  //    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  //    .setKey(process.env.APPWRITE_API_KEY);
  try{
  log("collectionId is"+ req.body);
  // You can log messages to the console
  //log('Hello, app123');
  }catch(error1){
  // If something goes wrong, log an error
  error('Hello, Errors!'+ error1);}

  // The `req` object contains the request data
  // if (req.method === 'GET') {
  //   // Send a response with the res object helpers
  //   // `res.send()` dispatches a string back to the client
  //   return res.send('Hello, World123!');
  // }

  // `res.json()` is a handy helper for sending JSON
  return res.send("Respinse from starter function");
};
