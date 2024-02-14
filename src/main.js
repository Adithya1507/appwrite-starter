import { Client,Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
      
      const collectionId = req.body.collectionId;
      log("reqbody"+req.body)
      // Initialize Appwrite client
      const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
          //.setKey(process.env.APPWRITE_API_KEY);

      
      const databases = new Databases(client);

      // Get documents from the specified collection with name "adi"
      const allDocuments = await databases.listDocuments(
          process.env.APPWRITE_FUNCTION_DATABASE_ID, // Use your database ID
          collectionId, // Use the extracted collection ID
          1000, // Get only one document
          0, // Start from the beginning
          undefined, // Filters: none
          undefined, // Order: none
          ['name'], // Fields to retrieve: only 'name'
          undefined // Search
      );

      // Update documents with name "adi" to set status field to "txn created"
      const updates = allDocuments.documents.map(async (document) => {
          if (document.name === 'adi') {
              await databases.updateDocument(
                  process.env.APPWRITE_FUNCTION_DATABASE_ID, // Use your database ID
                  collectionId, // Use the extracted collection ID
                  document.$id,
                  { status: "2" }
              );
              log(`Document with name ${document.name} updated.`);
          }
      });

      // Wait for all updates to complete
      await Promise.all(updates);

      // Send a response
      return res.send('Documents updated successfully.');
  } catch (error1) {
      // If something goes wrong, log an error
      error('Error updating documents: ' + error1);
      return res.send('Error updating documents.');
  }
};
