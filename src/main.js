import { Client,Databases,Query } from 'node-appwrite';
import axios from 'axios';
export default async ({ req, res, log, error }) => {
  try {
      
      
      //onst body=req.body);
      //log("body"+body)
      const collectionId = req.body.$collectionId;
      log("colctnid"+collectionId)
      // Initialize Appwrite client
      const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
          //.setKey(process.env.APPWRITE_API_KEY);

      
      const databases = new Databases(client);

      // Get documents from the specified collection with name "adi"
      const allDocuments = await databases.listDocuments(
          process.env.APPWRITE_FUNCTION_DATABASE_ID, 
          collectionId, 
          [
            Query.equal('name', ['adi'])
           
        ]
      );
  
      // Update documents with name "adi" to set status field to "txn created"
      const updates = allDocuments.documents.map(async (document) => {
          //if (document.name === 'adi') {
           
              await databases.updateDocument(
                  process.env.APPWRITE_FUNCTION_DATABASE_ID, // Use your database ID
                  collectionId, // Use the extracted collection ID
                  document.$id,
                  { status: "txn created" }
              );
              log(`Document with name ${document.name} updated.`);
          //}
      });

      // Wait for all updates to complete
      await Promise.all(updates);

      await triggerNotary1Function()


      
      // Send a response
      return res.send('Documents updated successfully.');
  } catch (error1) {
      // If something goes wrong, log an error
      error('Error updating documents: ' + error1);
      return res.send('Error updating documents.');
  }
};
async function triggerNotary1Function() {
    try {
      const webhookUrl = 'https://65cca72dd29fc671edf8.appwrite.global/'; // Replace with the URL of the webhook in the target project
      await axios.post(webhookUrl);
      log('Webhook triggered in the target project.');
    } catch (error) {
      error('Error triggering webhook in the target project: ' + error.message);
    }
  }